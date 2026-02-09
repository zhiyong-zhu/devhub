import { useCommandHistoryStore } from '@/stores/useCommandHistoryStore'
import { useConnectionStore } from '@/stores/useConnectionStore'
import type { SSHConfig } from '@/types'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { Clock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
import { CommandHistoryPanel } from './CommandHistoryPanel'

interface SSHTerminalProps {
  connectionId: string
  onDisconnect?: () => void
}

export function SSHTerminal({ connectionId, onDisconnect }: SSHTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [currentCommand, setCurrentCommand] = useState('')
  const { connections } = useConnectionStore()
  const { addCommand } = useCommandHistoryStore()

  // 从连接列表中获取当前连接的配置
  const getConnectionConfig = (): SSHConfig | null => {
    console.log('🔍 SSHTerminal: 查找连接配置, connectionId:', connectionId)

    const isBrowser = !window.__TAURI__
    let displayConnections = connections

    // 在浏览器中使用模拟数据
    if (isBrowser && connections.length === 0) {
      console.log('🌐 SSHTerminal: 使用模拟数据')
      displayConnections = [
        {
          id: 'mock-1',
          name: '测试 SSH 服务器',
          type: 'ssh' as const,
          config: {
            host: 'localhost',
            port: 22,
            username: 'testuser',
            auth_method: 'password' as const,
            password: 'password',
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]
    }

    const connection = displayConnections.find(c => c.id === connectionId)
    console.log('📌 SSHTerminal: 找到的连接', connection?.name)

    if (!connection || connection.type !== 'ssh') {
      console.log('❌ SSHTerminal: 连接不存在或不是 SSH 类型')
      return null
    }

    console.log('✅ SSHTerminal: 返回 SSH 配置')
    return connection.config as SSHConfig
  }

  // 初始化终端
  useEffect(() => {
    if (!terminalRef.current) return

    // 创建终端实例
    const term = new Terminal({
      cursorBlink: true,
      fontSize: 14,
      fontFamily:
        'JetBrains Mono, "Fira Code", Consolas, "Courier New", monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#d4d4d4',
        black: '#000000',
        red: '#cd3131',
        green: '#0dbc79',
        yellow: '#e5e510',
        blue: '#2472c8',
        magenta: '#bc3fbc',
        cyan: '#11a8cd',
        white: '#e5e5e5',
        brightBlack: '#666666',
        brightRed: '#f14c4c',
        brightGreen: '#23d18b',
        brightYellow: '#f5f543',
        brightBlue: '#3b8eea',
        brightMagenta: '#d670d6',
        brightCyan: '#29b8db',
        brightWhite: '#ffffff',
      },
      scrollback: 1000,
      tabStopWidth: 4,
    })

    // 创建插件
    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()

    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)

    // 打开终端
    term.open(terminalRef.current)
    fitAddon.fit()

    // 保存引用
    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // 欢迎信息
    term.writeln('\x1b[1;32mDevHub SSH Terminal\x1b[0m')
    term.writeln('Initializing...')

    // 监听窗口大小变化
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
      }
    }

    window.addEventListener('resize', handleResize)

    // 清理函数
    return () => {
      window.removeEventListener('resize', handleResize)
      term.dispose()

      // 断开 SSH 连接
      if (sessionId) {
        invoke('ssh_disconnect', { sessionId }).catch(console.error)
      }
    }
  }, [sessionId])

  // 连接 SSH
  useEffect(() => {
    if (!connectionId || !xtermRef.current) return

    const connectSSH = async () => {
      try {
        const config = getConnectionConfig()

        if (!config) {
          throw new Error('Connection configuration not found')
        }

        xtermRef.current?.writeln(
          '\r\n\x1b[90mConnecting to SSH server...\x1b[0m'
        )
        xtermRef.current?.writeln(`  Host: ${config.host}:${config.port}`)
        xtermRef.current?.writeln(`  User: ${config.username}`)
        xtermRef.current?.writeln(`  Auth: ${config.auth_method}`)

        const id = await invoke<string>('ssh_connect', {
          host: config.host,
          port: config.port,
          username: config.username,
          authMethod: config.auth_method,
          password: config.password,
          keyPath: config.private_key_path,
          passphrase: config.passphrase,
        })

        setSessionId(id)
        setConnected(true)
        setError(null)

        xtermRef.current?.writeln('\r\n\x1b[1;32m✓ Connected\x1b[0m')

        // 监听 SSH 数据事件
        const unlisten = await listen<string>(`ssh-data-${id}`, event => {
          try {
            // 将 Base64 编码的数据解码为二进制字符串
            const binaryString = atob(event.payload)
            // 转换为字节数组，然后解码为 UTF-8
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            const decoded = new TextDecoder('utf-8').decode(bytes)
            xtermRef.current?.write(decoded)
          } catch (err) {
            console.error('Failed to decode SSH data:', err)
          }
        })

        // 保存取消监听函数
        return () => {
          unlisten()
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err)
        setError(errorMsg)
        xtermRef.current?.writeln(
          `\r\n\x1b[1;31m✗ Connection failed:\x1b[0m ${errorMsg}`
        )
        xtermRef.current?.writeln('\r\n')
      }
    }

    const cleanupPromise = connectSSH()

    return () => {
      cleanupPromise.then(cleanup => cleanup?.()).catch(console.error)
    }
  }, [connectionId, connections])

  // 监听用户输入
  useEffect(() => {
    const term = xtermRef.current
    if (!term || !sessionId || !connected) {
      console.log('SSH Terminal: 跳过 onData 绑定', {
        term: !!term,
        sessionId,
        connected,
      })
      return
    }

    console.log('SSH Terminal: 绑定 onData 事件监听器')

    const disposable = term.onData(async (data: string) => {
      try {
        console.log('SSH Terminal: 收到输入数据', data.length, 'bytes')

        // 记录命令历史（检测回车键）
        if (data === '\r') {
          if (currentCommand.trim()) {
            addCommand(currentCommand.trim(), connectionId)
            setCurrentCommand('')
          }
        } else if (data === '\x7f' || data === '\b') {
          // 退格键
          setCurrentCommand(prev => prev.slice(0, -1))
        } else if (data.length === 1 && data >= ' ') {
          // 可打印字符
          setCurrentCommand(prev => prev + data)
        }

        await invoke('ssh_write', {
          sessionId,
          data,
        })
      } catch (err) {
        console.error('Failed to write to SSH:', err)
        term.writeln(`\r\n\x1b[1;31mError: ${err}\x1b[0m\r\n`)
      }
    })

    return () => {
      console.log('SSH Terminal: 清理 onData 事件监听器')
      disposable.dispose()
    }
  }, [sessionId, connected, connectionId, addCommand])

  // 手动调整大小
  const handleManualFit = () => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit()
    }
  }

  // 执行历史命令
  const handleExecuteCommand = async (command: string) => {
    if (!sessionId || !xtermRef.current) return

    try {
      // 将命令写入终端
      xtermRef.current.write('\r\n')
      await invoke('ssh_write', {
        sessionId,
        data: command + '\n',
      })

      // 记录到历史
      addCommand(command, connectionId)
    } catch (err) {
      console.error('Failed to execute command:', err)
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
      {/* 终端工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex items-center space-x-2">
          <div
            className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-yellow-500'}`}
          />
          <span className="text-sm text-gray-300">
            {connected ? 'Connected' : 'Connecting...'}
          </span>
          {sessionId && (
            <span className="text-xs text-gray-500">
              ({sessionId.substring(0, 8)}...)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleManualFit}
            className="px-3 py-1 text-xs text-gray-300 bg-[#3e3e42] hover:bg-[#4e4e52] rounded flex items-center space-x-1"
          >
            Fit
          </button>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-3 py-1 text-xs rounded flex items-center space-x-1 ${
              showHistory
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 bg-[#3e3e42] hover:bg-[#4e4e52]'
            }`}
          >
            <Clock size={14} />
            <span>History</span>
          </button>
          {connected && onDisconnect && (
            <button
              onClick={() => {
                invoke('ssh_disconnect', { sessionId })
                  .then(() => {
                    setConnected(false)
                    setSessionId(null)
                    onDisconnect()
                  })
                  .catch(console.error)
              }}
              className="px-3 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* 终端和命令历史区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 终端区域 */}
        <div
          ref={terminalRef}
          className={`flex-1 overflow-hidden ${showHistory ? '' : 'w-full'}`}
          style={{ minHeight: '400px' }}
        />

        {/* 命令历史面板 */}
        {showHistory && (
          <div className="w-80 border-l border-[#3e3e42]">
            <CommandHistoryPanel
              connectionId={connectionId}
              onExecuteCommand={handleExecuteCommand}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="px-4 py-2 bg-red-900/50 text-red-300 text-sm border-t border-red-700">
          {error}
        </div>
      )}
    </div>
  )
}

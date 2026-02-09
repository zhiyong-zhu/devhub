import { useCommandHistoryStore } from '@/stores/useCommandHistoryStore'
import { useConnectionStore } from '@/stores/useConnectionStore'
import type { SSHConfig } from '@/types'
import { listen } from '@tauri-apps/api/event'
import { invoke } from '@tauri-apps/api/tauri'
import { Clock } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'
import 'xterm/css/xterm.css'
import { CommandHistoryPanel } from './CommandHistoryPanel'

interface SSHTerminalProps {
  connectionId: string
  onDisconnect?: () => void
  onFitAddonReady?: (fit: () => void) => void
}

export function SSHTerminal({ connectionId, onDisconnect, onFitAddonReady }: SSHTerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<Terminal | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  const sessionIdRef = useRef<string | null>(null)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const currentCommandRef = useRef('')
  const { addCommand } = useCommandHistoryStore()
  const connectionsRef = useRef(useConnectionStore.getState().connections)

  // 订阅 connections 变化到 ref（不触发重渲染）
  useEffect(() => {
    const unsub = useConnectionStore.subscribe(
      state => { connectionsRef.current = state.connections }
    )
    return unsub
  }, [])

  // 从连接列表中获取当前连接的配置
  const getConnectionConfig = useCallback((): SSHConfig | null => {
    const isBrowser = !window.__TAURI__
    let displayConnections = connectionsRef.current

    if (isBrowser && displayConnections.length === 0) {
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
    if (!connection || connection.type !== 'ssh') return null
    return connection.config as SSHConfig
  }, [connectionId])

  // 单一 effect：初始化终端 + 连接 SSH + 绑定输入 + 清理
  // 仅依赖 connectionId，组件生命周期内只执行一次
  useEffect(() => {
    if (!terminalRef.current || !connectionId) return

    let cancelled = false
    let unlistenFn: (() => void) | null = null
    let inputDisposable: { dispose: () => void } | null = null

    // 1. 创建终端实例
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

    const fitAddon = new FitAddon()
    const webLinksAddon = new WebLinksAddon()
    term.loadAddon(fitAddon)
    term.loadAddon(webLinksAddon)
    term.open(terminalRef.current)
    fitAddon.fit()

    xtermRef.current = term
    fitAddonRef.current = fitAddon

    // 暴露 fit 函数给父组件（用于分屏布局变化时重新适配）
    onFitAddonReady?.(() => fitAddon.fit())

    // 监听窗口大小变化
    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)

    // 2. 连接 SSH
    const connectSSH = async () => {
      try {
        const config = getConnectionConfig()
        if (!config) {
          throw new Error('Connection configuration not found')
        }

        term.writeln('\x1b[1;32mDevHub SSH Terminal\x1b[0m')
        term.writeln(`\x1b[90mConnecting to ${config.host}:${config.port}...\x1b[0m`)

        const id = await invoke<string>('ssh_connect', {
          host: config.host,
          port: config.port,
          username: config.username,
          authMethod: config.auth_method,
          password: config.password,
          keyPath: config.private_key_path,
          passphrase: config.passphrase,
        })

        if (cancelled) {
          invoke('ssh_disconnect', { sessionId: id }).catch(() => {})
          return
        }

        sessionIdRef.current = id
        setConnected(true)
        setError(null)

        term.writeln('\x1b[1;32m✓ Connected\x1b[0m\r\n')

        // 3. 监听 SSH 数据事件
        unlistenFn = await listen<string>(`ssh-data-${id}`, event => {
          try {
            const binaryString = atob(event.payload)
            const bytes = new Uint8Array(binaryString.length)
            for (let i = 0; i < binaryString.length; i++) {
              bytes[i] = binaryString.charCodeAt(i)
            }
            const decoded = new TextDecoder('utf-8').decode(bytes)
            term.write(decoded)
          } catch (err) {
            console.error('Failed to decode SSH data:', err)
          }
        }) as unknown as () => void

        // 4. 绑定用户输入
        inputDisposable = term.onData(async (data: string) => {
          try {
            // 记录命令历史
            if (data === '\r') {
              const cmd = currentCommandRef.current.trim()
              if (cmd) {
                addCommand(cmd, connectionId)
                currentCommandRef.current = ''
              }
            } else if (data === '\x7f' || data === '\b') {
              currentCommandRef.current = currentCommandRef.current.slice(0, -1)
            } else if (data.length === 1 && data >= ' ') {
              currentCommandRef.current += data
            }

            await invoke('ssh_write', {
              sessionId: sessionIdRef.current,
              data,
            })
          } catch (err) {
            console.error('Failed to write to SSH:', err)
            term.writeln(`\r\n\x1b[1;31mError: ${err}\x1b[0m\r\n`)
          }
        })
      } catch (err) {
        if (cancelled) return
        const errorMsg = err instanceof Error ? err.message : String(err)
        setError(errorMsg)
        term.writeln(`\r\n\x1b[1;31m✗ Connection failed:\x1b[0m ${errorMsg}`)
      }
    }

    connectSSH()

    // 清理函数
    return () => {
      cancelled = true
      window.removeEventListener('resize', handleResize)
      inputDisposable?.dispose()
      unlistenFn?.()
      term.dispose()
      xtermRef.current = null
      fitAddonRef.current = null

      if (sessionIdRef.current) {
        invoke('ssh_disconnect', { sessionId: sessionIdRef.current }).catch(() => {})
        sessionIdRef.current = null
      }
      setConnected(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectionId])

  // 手动调整大小
  const handleManualFit = () => {
    if (fitAddonRef.current) {
      fitAddonRef.current.fit()
    }
  }

  // 执行历史命令
  const handleExecuteCommand = async (command: string) => {
    if (!sessionIdRef.current || !xtermRef.current) return
    try {
      await invoke('ssh_write', {
        sessionId: sessionIdRef.current,
        data: command + '\n',
      })
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
                if (sessionIdRef.current) {
                  invoke('ssh_disconnect', { sessionId: sessionIdRef.current })
                    .then(() => {
                      setConnected(false)
                      sessionIdRef.current = null
                      onDisconnect()
                    })
                    .catch(console.error)
                }
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
          style={{ minHeight: '100px' }}
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

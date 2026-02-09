import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useConnectionStore } from '@/stores/useConnectionStore'
import type { Connection, ConnectionType, SSHConfig, DatabaseConfig } from '@/types'

interface ConnectionDialogProps {
  connection?: Connection
  open: boolean
  onClose: () => void
}

export function ConnectionDialog({ connection, open, onClose }: ConnectionDialogProps) {
  const { addConnection, updateConnection, clearError } = useConnectionStore()

  const [type, setType] = useState<ConnectionType>('ssh')
  const [name, setName] = useState('')
  const [host, setHost] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'key'>('password')
  const [password, setPassword] = useState('')
  const [privateKeyPath, setPrivateKeyPath] = useState('')
  const [passphrase, setPassphrase] = useState('')

  useEffect(() => {
    if (connection) {
      setType(connection.type)
      setName(connection.name)
      if (connection.type === 'ssh' && 'auth_method' in connection.config) {
        const config = connection.config as SSHConfig
        setHost(config.host)
        setPort(config.port.toString())
        setUsername(config.username)
        setAuthMethod(config.auth_method)
        setPassword(config.password || '')
        setPrivateKeyPath(config.private_key_path || '')
        setPassphrase(config.passphrase || '')
      } else if (connection.type !== 'ssh' && 'host' in connection.config) {
        const config = connection.config as DatabaseConfig
        setHost(config.host)
        setPort(config.port.toString())
        setUsername(config.username)
        setPassword(config.password)
      }
    }
  }, [connection])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      const baseData = {
        name,
        group_id: undefined,
      }

      if (type === 'ssh') {
        const config: SSHConfig = {
          host,
          port: Number.parseInt(port),
          username,
          auth_method: authMethod,
          ...(authMethod === 'password' ? { password } : { private_key_path: privateKeyPath, passphrase }),
        }

        if (connection) {
          await updateConnection(connection.id, {
            ...connection,
            ...baseData,
            config,
          })
        } else {
          await addConnection({
            ...baseData,
            type: 'ssh',
            config,
          })
        }
      } else {
        const config: DatabaseConfig = {
          host,
          port: Number.parseInt(port),
          username,
          password,
        }

        if (connection) {
          await updateConnection(connection.id, {
            ...connection,
            ...baseData,
            type,
            config,
          })
        } else {
          await addConnection({
            ...baseData,
            type,
            config,
          })
        }
      }

      onClose()
      resetForm()
    } catch (error) {
      console.error('Failed to save connection:', error)
    }
  }

  const resetForm = () => {
    setType('ssh')
    setName('')
    setHost('')
    setPort('22')
    setUsername('')
    setAuthMethod('password')
    setPassword('')
    setPrivateKeyPath('')
    setPassphrase('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card rounded-lg shadow-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">
            {connection ? '编辑连接' : '新建连接'}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 连接类型 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">连接类型</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ConnectionType)}
              className="w-full px-3 py-2 rounded-md border bg-background"
              disabled={!!connection}
            >
              <option value="ssh">SSH</option>
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
              <option value="redis">Redis</option>
            </select>
          </div>

          {/* 名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入连接名称"
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* 主机 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">主机</label>
            <input
              type="text"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="localhost 或 IP 地址"
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* 端口 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">端口</label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* 用户名 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 rounded-md border bg-background"
              required
            />
          </div>

          {/* SSH 特有配置 */}
          {type === 'ssh' && (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">认证方式</label>
                <select
                  value={authMethod}
                  onChange={(e) => setAuthMethod(e.target.value as 'password' | 'key')}
                  className="w-full px-3 py-2 rounded-md border bg-background"
                >
                  <option value="password">密码</option>
                  <option value="key">密钥</option>
                </select>
              </div>

              {authMethod === 'password' ? (
                <div className="space-y-2">
                  <label className="text-sm font-medium">密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border bg-background"
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">私钥路径</label>
                    <input
                      type="text"
                      value={privateKeyPath}
                      onChange={(e) => setPrivateKeyPath(e.target.value)}
                      placeholder="~/.ssh/id_rsa"
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">私钥密码（可选）</label>
                    <input
                      type="password"
                      value={passphrase}
                      onChange={(e) => setPassphrase(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border bg-background"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {/* 数据库密码 */}
          {type !== 'ssh' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background"
              />
            </div>
          )}

          {/* 按钮 */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              取消
            </Button>
            <Button type="submit">
              {connection ? '保存' : '创建'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

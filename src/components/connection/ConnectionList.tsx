import { useEffect } from 'react'
import { useConnectionStore } from '@/stores/useConnectionStore'
import { Server, Database, Terminal, Trash2, Edit, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Connection } from '@/types'

interface ConnectionListProps {
  onConnectionClick?: (connection: Connection) => void
  onConnectionEdit?: (connection: Connection) => void
  searchQuery?: string
}

export function ConnectionList({
  onConnectionClick,
  onConnectionEdit,
  searchQuery = '',
}: ConnectionListProps) {
  const { connections, isLoading, error, fetchConnections, deleteConnection, selectedConnection } =
    useConnectionStore()

  useEffect(() => {
    // 检查是否在浏览器环境中
    const isBrowser = !window.__TAURI__

    if (isBrowser) {
      console.log('🌐 检测到浏览器环境，使用模拟数据')
      // 在浏览器中使用模拟数据
      return
    }

    console.log('🖥️ 检测到 Tauri 环境，从数据库加载连接')
    fetchConnections()
  }, [fetchConnections])

  // 在浏览器环境中使用模拟数据
  const displayConnections = (() => {
    const isBrowser = !window.__TAURI__

    if (isBrowser && connections.length === 0) {
      console.log('📦 返回模拟数据用于测试')
      // 返回模拟数据用于测试（使用 password 认证以匹配其他组件）
      return [
        {
          id: 'mock-1',
          name: '测试 SSH 服务器',
          type: 'ssh' as const,
          config: {
            host: 'localhost',
            port: 22,
            username: 'testuser',
            auth_method: 'password' as const,
            password: 'password'
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'mock-2',
          name: '测试数据库',
          type: 'mysql' as const,
          config: {
            host: 'localhost',
            port: 3306,
            username: 'root',
            database: 'test',
            password: ''
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
    }

    return connections
  })()

  // 过滤连接
  const filteredConnections = displayConnections.filter((connection) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    const name = connection.name.toLowerCase()
    const type = connection.type.toLowerCase()

    // 检查配置中的 host 字段
    const host = connection.config && 'host' in connection.config
      ? (connection.config as any).host?.toLowerCase() || ''
      : ''

    return name.includes(query) || type.includes(query) || host.includes(query)
  })

  const getIcon = (type: Connection['type']) => {
    switch (type) {
      case 'ssh':
        return <Server className="w-4 h-4" />
      case 'mysql':
      case 'postgresql':
      case 'redis':
        return <Database className="w-4 h-4" />
      default:
        return <Terminal className="w-4 h-4" />
    }
  }

  const getTypeLabel = (type: Connection['type']) => {
    const labels: Record<Connection['type'], string> = {
      ssh: 'SSH',
      mysql: 'MySQL',
      postgresql: 'PostgreSQL',
      redis: 'Redis',
      sqlite: 'SQLite',
    }
    return labels[type]
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm('确定要删除这个连接吗？')) {
      try {
        await deleteConnection(id)
      } catch (error) {
        console.error('Failed to delete connection:', error)
      }
    }
  }

  const handleEdit = (connection: Connection, e: React.MouseEvent) => {
    e.stopPropagation()
    onConnectionEdit?.(connection)
  }

  const handleConnect = (connection: Connection, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    console.log('连接按钮被点击:', connection.name, connection.type)
    // 显示提示
    alert(`正在连接到: ${connection.name}`)
    onConnectionClick?.(connection)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">错误: {error}</div>
      </div>
    )
  }

  if (displayConnections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <Server className="w-16 h-16 text-muted-foreground/50" />
        <div className="text-center space-y-2">
          <h3 className="font-medium text-foreground">暂无连接</h3>
          <p className="text-sm text-muted-foreground">
            点击上方按钮添加新连接
          </p>
        </div>
      </div>
    )
  }

  if (filteredConnections.length === 0 && searchQuery) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center text-muted-foreground">
          <p>未找到匹配的连接</p>
          <p className="text-sm mt-1">尝试其他搜索关键词</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {displayConnections.length === 0 && searchQuery ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p>未找到匹配的连接</p>
            <p className="text-sm mt-1">尝试其他搜索关键词</p>
          </div>
        </div>
      ) : (
        filteredConnections.map((connection) => (
          <div
            key={connection.id}
            onClick={() => {
              console.log('卡片被点击:', connection.name)
              onConnectionClick?.(connection)
            }}
            className={cn(
              'flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent cursor-pointer transition-colors',
              selectedConnection?.id === connection.id && 'border-primary bg-accent'
            )}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="text-muted-foreground">
                {getIcon(connection.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{connection.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{getTypeLabel(connection.type)}</span>
                  {connection.config && 'host' in connection.config && (
                    <>
                      <span>•</span>
                      <span className="truncate">
                        {connection.config.host}:{connection.config.port}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 relative z-10">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={(e) => {
                  console.log('连接按钮被点击', connection.name)
                  handleConnect(connection, e)
                }}
                title="连接"
              >
                <Plug className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={(e) => handleEdit(connection, e)}
                title="编辑"
              >
                <Edit className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive cursor-pointer"
                onClick={(e) => handleDelete(connection.id, e)}
                title="删除"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

import { useState } from 'react'
import { ConnectionList, ConnectionDialog } from '@/components/connection'
import { Button } from '@/components/ui/button'
import { Plus, Download, Upload } from 'lucide-react'
import { useConnectionStore } from '@/stores/useConnectionStore'
import { SearchBar } from '@/components/common/SearchBar'
import type { Connection } from '@/types'

interface ConnectionsPageProps {
  onPageChange?: (page: 'connections' | 'database' | 'ssh' | 'settings' | 'welcome') => void
}

export function ConnectionsPage({ onPageChange }: ConnectionsPageProps) {
  const { error, clearError, exportConnections, importConnections, setSelectedConnection, connections } = useConnectionStore()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingConnection, setEditingConnection] = useState<Connection | undefined>()
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddClick = () => {
    setEditingConnection(undefined)
    setDialogOpen(true)
  }

  const handleEditClick = (connection: Connection) => {
    setEditingConnection(connection)
    setDialogOpen(true)
  }

  const handleConnectionClick = (connection: Connection) => {
    console.log('=== handleConnectionClick 被调用 ===')
    console.log('连接信息:', connection)
    console.log('连接类型:', connection.type)
    console.log('onPageChange 函数:', onPageChange)

    // 设置选中的连接
    try {
      setSelectedConnection(connection)
      console.log('已设置选中连接')
    } catch (error) {
      console.error('设置选中连接失败:', error)
    }

    // 根据连接类型跳转到对应页面
    if (connection.type === 'ssh') {
      console.log('跳转到 SSH 页面')
      if (onPageChange) {
        onPageChange('ssh')
        console.log('已调用 onPageChange("ssh")')
      } else {
        console.error('onPageChange 函数不存在！')
      }
    } else if (['mysql', 'postgresql', 'redis', 'sqlite'].includes(connection.type)) {
      console.log('跳转到数据库页面')
      if (onPageChange) {
        onPageChange('database')
        console.log('已调用 onPageChange("database")')
      } else {
        console.error('onPageChange 函数不存在！')
      }
    } else {
      console.log('未知连接类型:', connection.type)
    }
  }

  const handleExport = async () => {
    try {
      const json = await exportConnections()
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `devhub-connections-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export:', error)
    }
  }

  const handleImport = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const count = await importConnections(text)
        alert(`成功导入 ${count} 个连接`)
      } catch (error) {
        console.error('Failed to import:', error)
        alert('导入失败')
      }
    }
    input.click()
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">连接管理</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline" size="sm" onClick={handleImport}>
            <Upload className="w-4 h-4 mr-2" />
            导入
          </Button>
          <Button size="sm" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            新建连接
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800">
        <SearchBar
          onSearch={setSearchQuery}
          placeholder="Search connections by name, host, or type..."
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={clearError}
              className="text-sm underline hover:no-underline"
            >
              关闭
            </button>
          </div>
        </div>
      )}

      {/* Connection List */}
      <div className="flex-1 overflow-auto p-4">
        <ConnectionList
          onConnectionClick={handleConnectionClick}
          onConnectionEdit={handleEditClick}
          searchQuery={searchQuery}
        />
      </div>

      {/* Dialog */}
      <ConnectionDialog
        connection={editingConnection}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
      />
    </div>
  )
}

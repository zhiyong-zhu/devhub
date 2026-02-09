import { cn } from '@/lib/utils'
import { Server, Database, Terminal, Settings } from 'lucide-react'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: 'welcome' | 'connections' | 'database' | 'ssh' | 'settings') => void
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const menuItems = [
    { icon: <Server className="w-4 h-4" />, label: '连接', id: 'connections' as const },
    { icon: <Database className="w-4 h-4" />, label: '数据库', id: 'database' as const },
    { icon: <Terminal className="w-4 h-4" />, label: '终端', id: 'ssh' as const },
    { icon: <Settings className="w-4 h-4" />, label: '设置', id: 'settings' as const },
  ]

  return (
    <div className="flex h-full w-64 border-r bg-card flex flex-col">
      {/* App Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-muted-foreground" />
          <span className="font-semibold">DevHub</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onPageChange(item.id)}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors',
              currentPage === item.id && 'bg-accent'
            )}
          >
            {item.icon}
            <span className="text-sm">{item.label}</span>
          </div>
        ))}
      </nav>

      {/* Footer - Theme Toggle */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">主题设置</span>
        </div>
      </div>
    </div>
  )
}

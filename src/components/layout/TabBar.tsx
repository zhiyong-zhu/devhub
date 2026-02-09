import React from 'react'
import { X, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface Tab {
  id: string
  label: string
}

export function TabBar() {
  const [tabs, setTabs] = React.useState<Tab[]>([
    { id: '1', label: '终端' },
    { id: '2', label: 'SFTP' },
    { id: '3', label: '数据库' },
  ])

  const activeTabId = tabs[0]?.id

  const closeTab = (id: string) => {
    setTabs(tabs.filter((tab) => tab.id !== id))
  }

  return (
    <div className="flex h-12 items-center border-b bg-card">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => setTabs(tabs.filter((t) => t.id === tab.id))}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 cursor-pointer hover:bg-accent transition-colors',
            activeTabId === tab.id && 'border-b-2 border-primary bg-background',
          )}
        >
          <span className="text-sm font-medium">{tab.label}</span>
          {tab.id === activeTabId && (
            <X
              className="w-4 h-4 text-muted-foreground opacity-50 hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                closeTab(tab.id)
              }}
            />
          )}
        </div>
      ))}

      <Button variant="ghost" size="icon" className="ml-2">
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  )
}

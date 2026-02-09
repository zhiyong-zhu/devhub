import { useState, useRef } from 'react'
import { Server } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { TabBar } from './TabBar'
import { StatusBar } from './StatusBar'
import { ConnectionsPage } from '@/pages/ConnectionsPage'
import { SSHPage } from '@/pages/SSHPage'
import { DatabasePage } from '@/pages/DatabasePage'

type PageType = 'welcome' | 'connections' | 'database' | 'ssh' | 'settings'

export function MainLayout() {
  const [currentPage, setCurrentPage] = useState<PageType>('welcome')
  // 记录哪些页面曾经被访问过，只有访问过的页面才渲染（避免一开始就全部渲染）
  const visitedPages = useRef<Set<PageType>>(new Set(['welcome']))

  const handlePageChange = (page: PageType) => {
    visitedPages.current.add(page)
    setCurrentPage(page)
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* 左侧边栏 */}
      <Sidebar onPageChange={handlePageChange} currentPage={currentPage} />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 标签页栏 */}
        <TabBar />

        {/* 内容区域 - 所有已访问的页面始终保持挂载，用 display 控制显隐 */}
        <div className="flex-1 overflow-hidden relative">
          <div className={`absolute inset-0 overflow-auto ${currentPage === 'welcome' ? '' : 'hidden'}`}>
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <Server className="w-16 h-16 text-muted-foreground mx-auto" />
                <h2 className="text-2xl font-bold text-foreground">
                  欢迎使用 DevHub
                </h2>
                <p className="text-muted-foreground text-sm">
                  跨平台开发运维工具
                </p>
              </div>
            </div>
          </div>

          {visitedPages.current.has('connections') && (
            <div className={`absolute inset-0 overflow-auto ${currentPage === 'connections' ? '' : 'hidden'}`}>
              <ConnectionsPage onPageChange={handlePageChange} />
            </div>
          )}

          {visitedPages.current.has('ssh') && (
            <div className={`absolute inset-0 overflow-hidden ${currentPage === 'ssh' ? '' : 'hidden'}`}>
              <SSHPage />
            </div>
          )}

          {visitedPages.current.has('database') && (
            <div className={`absolute inset-0 overflow-auto ${currentPage === 'database' ? '' : 'hidden'}`}>
              <DatabasePage />
            </div>
          )}
        </div>

        {/* 状态栏 */}
        <StatusBar />
      </div>
    </div>
  )
}

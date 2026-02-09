import { Plus, Terminal as TerminalIcon, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { SSHTerminal } from './SSHTerminal';

export interface TerminalTab {
  id: string;
  connectionId: string;
  title: string;
  isActive: boolean;
}

interface TabbedTerminalProps {
  connectionId: string;
  onAllTabsClosed?: () => void;
}

export function TabbedTerminal({ connectionId, onAllTabsClosed }: TabbedTerminalProps) {
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: `tab-${Date.now()}`,
      connectionId,
      title: 'Terminal 1',
      isActive: true,
    }
  ]);

  // 添加新标签页
  const addTab = useCallback(() => {
    const newTab: TerminalTab = {
      id: `tab-${Date.now()}`,
      connectionId,
      title: `Terminal ${tabs.length + 1}`,
      isActive: true,
    };

    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: false
    })).concat(newTab));
  }, [connectionId, tabs.length]);

  // 关闭标签页
  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const closingTab = prev.find(t => t.id === tabId);
      const newTabs = prev.filter(t => t.id !== tabId);

      // 如果关闭的是当前激活的标签，激活最后一个标签
      if (closingTab?.isActive && newTabs.length > 0) {
        const lastTab = newTabs[newTabs.length - 1];
        if (lastTab) lastTab.isActive = true;
      }

      // 如果没有标签了，通知父组件
      if (newTabs.length === 0 && onAllTabsClosed) {
        onAllTabsClosed();
      }

      return newTabs;
    });
  }, [onAllTabsClosed]);

  // 切换标签页
  const switchTab = useCallback((tabId: string) => {
    setTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })));
  }, []);

  if (tabs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <TerminalIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No open terminals
          </p>
          <button
            onClick={addTab}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Open Terminal
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 标签页栏 */}
      <div className="flex items-center bg-[#252526] border-b border-[#3e3e42]">
        {/* 标签页 */}
        <div className="flex items-center flex-1 overflow-x-auto">
          {tabs.map(tab => (
            <div
              key={tab.id}
              className={`group flex items-center px-4 py-2 border-r border-[#3e3e42] cursor-pointer transition-colors ${
                tab.isActive
                  ? 'bg-[#1e1e1e] text-white'
                  : 'bg-[#2d2d30] text-gray-400 hover:bg-[#333333]'
              }`}
              onClick={() => switchTab(tab.id)}
            >
              <span className="text-sm flex-1">{tab.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab.id);
                }}
                className={`ml-2 p-0.5 rounded transition-colors ${
                  tab.isActive
                    ? 'hover:bg-[#3e3e42] text-gray-300'
                    : 'hover:bg-[#4e4e52] text-gray-500'
                }`}
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* 添加标签页按钮 */}
        <button
          onClick={addTab}
          className="px-3 py-2 text-gray-400 hover:text-white hover:bg-[#3e3e42] transition-colors"
          title="New Terminal"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* 终端内容 - 所有 tab 始终保持挂载，用 CSS 控制显隐 */}
      <div className="flex-1 overflow-hidden relative">
        {tabs.map(tab => (
          <div
            key={tab.id}
            className={`absolute inset-0 ${tab.isActive ? '' : 'hidden'}`}
          >
            <SSHTerminal
              connectionId={tab.connectionId}
              onDisconnect={() => {
                // 可选：断开连接时关闭标签页
                // closeTab(tab.id);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

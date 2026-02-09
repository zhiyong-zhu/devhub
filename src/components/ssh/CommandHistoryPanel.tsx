import { useState, useMemo } from 'react';
import { Clock, Search, Trash2, RotateCcw } from 'lucide-react';
import { useCommandHistoryStore } from '@/stores/useCommandHistoryStore';
import type { CommandHistoryEntry } from '@/stores/useCommandHistoryStore';

interface CommandHistoryPanelProps {
  connectionId: string;
  onExecuteCommand: (command: string) => void;
  onClose?: () => void;
}

export function CommandHistoryPanel({
  connectionId,
  onExecuteCommand,
  onClose
}: CommandHistoryPanelProps) {
  const { history, getHistoryByConnection, searchHistory, deleteCommand, clearHistory } = useCommandHistoryStore();

  const [searchQuery, setSearchQuery] = useState('');

  // 获取当前连接的历史记录
  const filteredHistory = useMemo(() => {
    const connectionHistory = getHistoryByConnection(connectionId);
    if (!searchQuery) {
      return connectionHistory;
    }
    return searchHistory(searchQuery).filter(entry => entry.connectionId === connectionId);
  }, [history, connectionId, searchQuery, getHistoryByConnection, searchHistory]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    // 小于 1 小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m ago`;
    }

    // 小于 1 天
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }

    // 大于 1 天，显示日期
    return date.toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-l border-[#3e3e42]">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#3e3e42]">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-200">Command History</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* 搜索栏 */}
      <div className="px-4 py-2 border-b border-[#3e3e42]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#3c3c3c] border border-[#3e3e42] rounded text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-[#007acc]"
          />
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="px-4 py-2 border-b border-[#3e3e42] flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {filteredHistory.length} command{filteredHistory.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={() => {
            if (confirm('Clear all command history?')) {
              clearHistory();
            }
          }}
          className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center space-x-1"
        >
          <Trash2 size={12} />
          <span>Clear All</span>
        </button>
      </div>

      {/* 历史记录列表 */}
      <div className="flex-1 overflow-y-auto">
        {filteredHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Clock className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              {searchQuery ? 'No commands found' : 'No command history yet'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#3e3e42]">
            {filteredHistory.map((entry) => (
              <div
                key={entry.timestamp}
                className="group px-4 py-3 hover:bg-[#2a2d2e] transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <code className="text-sm text-gray-300 break-all font-mono">
                      {entry.command}
                    </code>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">
                        {formatTime(entry.timestamp)}
                      </span>
                      {entry.workingDirectory && (
                        <span className="text-xs text-gray-600">
                          in {entry.workingDirectory}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onExecuteCommand(entry.command)}
                      className="p-1.5 text-gray-400 hover:text-white hover:bg-[#3e3e42] rounded transition-colors"
                      title="Execute this command"
                    >
                      <RotateCcw size={14} />
                    </button>
                    <button
                      onClick={() => deleteCommand(entry.timestamp)}
                      className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-[#3e3e42] rounded transition-colors"
                      title="Delete from history"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

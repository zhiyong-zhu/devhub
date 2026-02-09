import { useKeybindingListener } from '@/hooks/useKeybindingListener';
import { formatKeybinding, useKeybindingStore } from '@/stores/useKeybindingStore';
import { AlertCircle, Server, SplitSquareHorizontal, SplitSquareVertical } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useTerminalSplit } from '../components/ssh/TerminalSplitLayout';
import { useConnectionStore } from '../stores/useConnectionStore';

export function SSHPage() {
  const { connections, selectedConnection, setSelectedConnection, fetchConnections } = useConnectionStore();
  const [hasActiveTerminal, setHasActiveTerminal] = useState(false);
  const { getKeybinding } = useKeybindingStore();

  // 分屏 hook（必须在顶层无条件调用）
  const splitLayout = useTerminalSplit(
    selectedConnection?.id || '',
    () => setHasActiveTerminal(false),
  );

  // 快捷键绑定
  const isActive = hasActiveTerminal && !!selectedConnection && selectedConnection.type === 'ssh';

  const keybindingHandlers = useMemo(() => ({
    splitHorizontal: () => splitLayout.splitFocused('horizontal'),
    splitVertical: () => splitLayout.splitFocused('vertical'),
    closePanel: () => splitLayout.closeFocused(),
    navigateUp: () => splitLayout.navigatePanel('up'),
    navigateDown: () => splitLayout.navigatePanel('down'),
    navigateLeft: () => splitLayout.navigatePanel('left'),
    navigateRight: () => splitLayout.navigatePanel('right'),
  }), [splitLayout]);

  useKeybindingListener(keybindingHandlers, isActive);

  // 加载连接列表
  useEffect(() => {
    const isBrowser = !window.__TAURI__;
    if (isBrowser) return;
    fetchConnections();
  }, [fetchConnections]);

  // 在浏览器环境中使用模拟数据
  const displayConnections = (() => {
    const isBrowser = !window.__TAURI__;
    if (isBrowser && connections.length === 0) {
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
        }
      ];
    }
    return connections;
  })();

  const sshConnections = displayConnections.filter((conn) => conn.type === 'ssh');

  // 监听 selectedConnection 的变化
  useEffect(() => {
    if (selectedConnection && selectedConnection.type === 'ssh') {
      setHasActiveTerminal(true);
    }
  }, [selectedConnection]);

  if (sshConnections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold text-foreground mb-2">
          暂无 SSH 连接
        </h2>
        <p className="text-muted-foreground mb-4">
          请先在连接管理中创建 SSH 连接
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 连接选择器 + 分屏工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center space-x-4">
          <Server className="w-5 h-5 text-muted-foreground" />
          <select
            value={selectedConnection?.id || ''}
            onChange={(e) => {
              const conn = sshConnections.find((c) => c.id === e.target.value);
              if (conn) {
                setSelectedConnection(conn);
                setHasActiveTerminal(true);
              }
            }}
            className="px-3 py-1.5 bg-background border border-border rounded-md text-foreground text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">选择 SSH 连接...</option>
            {sshConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({(conn.config as any)?.host || 'unknown'})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-2">
          {isActive && (
            <>
              <button
                onClick={() => splitLayout.splitFocused('horizontal')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded transition-colors"
                title={`左右分屏 (${formatKeybinding(getKeybinding('splitHorizontal')?.keys || '')})`}
              >
                <SplitSquareHorizontal className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => splitLayout.splitFocused('vertical')}
                className="flex items-center gap-1 px-2 py-1 text-xs text-muted-foreground hover:text-foreground bg-muted hover:bg-accent rounded transition-colors"
                title={`上下分屏 (${formatKeybinding(getKeybinding('splitVertical')?.keys || '')})`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
              </button>
              {splitLayout.panelCount > 1 && (
                <span className="text-xs text-muted-foreground px-1">
                  {splitLayout.panelCount} 面板
                </span>
              )}
            </>
          )}

          {selectedConnection && (
            <span className="text-xs text-muted-foreground">
              {(selectedConnection.config as any)?.username}@{(selectedConnection.config as any)?.host}
            </span>
          )}
        </div>
      </div>

      {/* 终端内容区 */}
      <div className="flex-1 overflow-hidden">
        {isActive ? (
          splitLayout.element
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Server className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                选择一个 SSH 连接以开始
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

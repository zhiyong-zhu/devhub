import { useEffect, useState } from 'react';
import { useConnectionStore } from '../stores/useConnectionStore';
import { TabbedTerminal } from '../components/ssh/TabbedTerminal';
import { Server, AlertCircle } from 'lucide-react';

export function SSHPage() {
  const { connections, selectedConnection, setSelectedConnection, fetchConnections } = useConnectionStore();
  const [hasActiveTerminal, setHasActiveTerminal] = useState(false);

  // 加载连接列表
  useEffect(() => {
    const isBrowser = !window.__TAURI__;

    if (isBrowser) {
      console.log('🌐 SSHPage: 检测到浏览器环境')
      return; // 在浏览器中不加载连接
    }

    console.log('🖥️ SSHPage: 加载连接列表')
    fetchConnections();
  }, [fetchConnections]);

  // 在浏览器环境中使用模拟数据
  const displayConnections = (() => {
    const isBrowser = !window.__TAURI__;

    if (isBrowser && connections.length === 0) {
      console.log('🌐 SSHPage: 使用模拟数据');
      // 返回模拟数据（注意：auth_method 改为 password 以匹配 SSHTerminal 的 mock）
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

  // 过滤出 SSH 连接
  const sshConnections = displayConnections.filter((conn) => conn.type === 'ssh');

  console.log('📋 SSHPage: 可用的 SSH 连接', sshConnections.length);
  console.log('📌 SSHPage: 当前选中的连接', selectedConnection?.name);

  // 监听 selectedConnection 的变化
  useEffect(() => {
    if (selectedConnection && selectedConnection.type === 'ssh') {
      console.log('✅ SSHPage: 检测到选中的 SSH 连接，激活终端');
      setHasActiveTerminal(true);
    }
  }, [selectedConnection]);

  if (sshConnections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 dark:bg-gray-900">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
          No SSH Connections
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Create an SSH connection first to use the terminal
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go to Connections
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 连接选择器 */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <Server className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <select
            value={selectedConnection?.id || ''}
            onChange={(e) => {
              const conn = sshConnections.find((c) => c.id === e.target.value);
              if (conn) {
                setSelectedConnection(conn);
                setHasActiveTerminal(true);
              }
            }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select SSH Connection...</option>
            {sshConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({(conn.config as any)?.host || 'unknown'})
              </option>
            ))}
          </select>
        </div>

        {selectedConnection && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {(selectedConnection.config as any)?.username}@{(selectedConnection.config as any)?.host}
          </div>
        )}
      </div>

      {/* 终端内容区 */}
      <div className="flex-1 overflow-hidden">
        {hasActiveTerminal && selectedConnection && selectedConnection.type === 'ssh' ? (
          <TabbedTerminal
            connectionId={selectedConnection.id}
            onAllTabsClosed={() => {
              setHasActiveTerminal(false);
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                Select an SSH connection to start
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

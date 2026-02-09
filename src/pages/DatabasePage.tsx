import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { useConnectionStore } from '../stores/useConnectionStore';
import { SQLEditor } from '../components/database/SQLEditor';
import { ResultTable } from '../components/database/ResultTable';
import { Database, Loader2, AlertCircle, Table } from 'lucide-react';

interface QueryResult {
  columns: string[];
  rows: any[][];
  rows_affected: number;
}

export function DatabasePage() {
  const { connections, selectedConnection, setSelectedConnection } = useConnectionStore();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 过滤出数据库连接
  const dbConnections = connections.filter(
    (conn) => conn.type === 'mysql' || conn.type === 'postgresql' || conn.type === 'sqlite'
  );

  // 获取当前连接的语言
  const getCurrentLanguage = () => {
    if (!selectedConnection) return 'mysql';
    const type = selectedConnection.type;
    if (type === 'postgresql') return 'postgresql';
    if (type === 'sqlite') return 'sqlite';
    return 'mysql';
  };

  // 连接数据库
  const connectDatabase = async () => {
    if (!selectedConnection) return;

    try {
      setIsLoading(true);
      setError(null);

      const config = selectedConnection.config as any;
      let resultSessionId: string;

      if (selectedConnection.type === 'mysql') {
        resultSessionId = await invoke('mysql_connect', {
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
        });
      } else if (selectedConnection.type === 'postgresql') {
        resultSessionId = await invoke('postgresql_connect', {
          host: config.host,
          port: config.port,
          username: config.username,
          password: config.password,
          database: config.database,
        });
      } else {
        throw new Error('Unsupported database type');
      }

      setSessionId(resultSessionId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Failed to connect:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 当选择的连接改变时，自动连接
  useEffect(() => {
    if (selectedConnection && selectedConnection.type !== 'ssh') {
      connectDatabase();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConnection?.id]);

  // 执行查询
  const handleExecuteQuery = async (sql: string) => {
    if (!sessionId) {
      setError('No database connection. Please select a connection first.');
      return;
    }

    const startTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);
      setQueryResult(null);

      let result: QueryResult;

      if (selectedConnection?.type === 'mysql') {
        result = await invoke('mysql_query', {
          sessionId,
          query: sql,
        });
      } else if (selectedConnection?.type === 'postgresql') {
        result = await invoke('postgresql_query', {
          sessionId,
          query: sql,
        });
      } else {
        throw new Error('Unsupported database type');
      }

      const executionTime = Date.now() - startTime;
      setQueryResult({ ...result, executionTime } as QueryResult & { executionTime: number });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError(errorMsg);
      console.error('Query failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center">
          <Database className="w-6 h-6 mr-2" />
          Database Manager
        </h1>

        <div className="flex items-center space-x-4">
          {/* 连接选择器 */}
          <select
            value={selectedConnection?.id || ''}
            onChange={(e) => {
              const conn = dbConnections.find((c) => c.id === e.target.value);
              if (conn) {
                setSelectedConnection(conn);
              }
            }}
            className="px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          >
            <option value="">Select Database Connection...</option>
            {dbConnections.map((conn) => (
              <option key={conn.id} value={conn.id}>
                {conn.name} ({(conn.config as any)?.host || 'unknown'})
              </option>
            ))}
          </select>

          {sessionId && (
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Connected</span>
            </div>
          )}
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {!selectedConnection || selectedConnection.type === 'ssh' ? (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No Database Connection
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                Select a database connection to start querying
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* SQL 编辑器 */}
            <div className="w-1/2 flex flex-col border-r border-gray-200 dark:border-gray-700">
              <SQLEditor
                onExecute={handleExecuteQuery}
                isLoading={isLoading}
                language={getCurrentLanguage()}
              />
            </div>

            {/* 结果面板 */}
            <div className="w-1/2 flex flex-col">
              {error && (
                <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
                  <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800 dark:text-red-200">Query Error</p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                  </div>
                </div>
              )}

              {isLoading && !queryResult ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">Executing query...</p>
                  </div>
                </div>
              ) : queryResult ? (
                <ResultTable
                  columns={queryResult.columns}
                  rows={queryResult.rows}
                  rowsAffected={queryResult.rows_affected}
                  executionTime={(queryResult as any).executionTime}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="text-center">
                    <Table className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Execute a query to see results
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import { Download, ChevronLeft, ChevronRight } from 'lucide-react';

interface QueryResultProps {
  columns: string[];
  rows: any[][];
  rowsAffected?: number;
  executionTime?: number;
}

export function ResultTable({ columns, rows, rowsAffected, executionTime }: QueryResultProps) {
  // 每页显示的行数
  const pageSize = 50;
  const [currentPage, setCurrentPage] = useState(0);

  const totalPages = Math.ceil(rows.length / pageSize);
  const startIdx = currentPage * pageSize;
  const endIdx = Math.min(startIdx + pageSize, rows.length);
  const currentRows = rows.slice(startIdx, endIdx);

  // 导出为 CSV
  const exportToCSV = () => {
    const csvContent = [
      columns.join(','),
      ...rows.map((row) =>
        row
          .map((cell) => {
            const cellValue = cell === null ? 'NULL' : String(cell);
            // 如果包含逗号或引号，需要转义
            if (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n')) {
              return `"${cellValue.replace(/"/g, '""')}"`;
            }
            return cellValue;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_result_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 导出为 JSON
  const exportToJSON = () => {
    const jsonData = rows.map((row) => {
      const obj: any = {};
      columns.forEach((col, i) => {
        obj[col] = row[i];
      });
      return obj;
    });

    const jsonContent = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `query_result_${Date.now()}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-900">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p className="text-lg">No results</p>
          <p className="text-sm mt-2">Execute a query to see results here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Results ({rowsAffected !== undefined ? rowsAffected : rows.length} rows)
          </span>

          {executionTime !== undefined && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({executionTime}ms)
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
          >
            <Download className="w-4 h-4" />
            <span>CSV</span>
          </button>
          <button
            onClick={exportToJSON}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
          >
            <Download className="w-4 h-4" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* 表格区域 */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {currentRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-4 py-2 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono"
                  >
                    {cell === null ? (
                      <span className="text-gray-400 italic">NULL</span>
                    ) : typeof cell === 'object' ? (
                      JSON.stringify(cell)
                    ) : (
                      String(cell)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页控件 */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {startIdx + 1}-{endIdx} of {rows.length} rows
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {currentPage + 1} of {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Import useState for the component
import { useState } from 'react';

import Editor from '@monaco-editor/react'
import { Loader2, Play } from 'lucide-react'
import { useRef, useState } from 'react'

interface SQLEditorProps {
  onExecute: (sql: string) => Promise<void>
  isLoading?: boolean
  language?: 'mysql' | 'postgresql' | 'sqlite'
}

export function SQLEditor({
  onExecute,
  isLoading = false,
  language = 'mysql',
}: SQLEditorProps) {
  const editorRef = useRef<any>(null)
  const [sql, setSql] = useState('')

  // 示例 SQL
  const exampleQueries = {
    mysql: 'SELECT * FROM users LIMIT 10;',
    postgresql: 'SELECT * FROM users LIMIT 10;',
    sqlite: 'SELECT * FROM users LIMIT 10;',
  }

  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor

    // 添加快捷键 Ctrl+Enter 执行
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      handleExecute()
    })

    // 设置初始示例
    setSql(exampleQueries[language])
  }

  const handleExecute = async () => {
    if (!sql.trim() || isLoading) return
    await onExecute(sql)
  }

  const insertText = (text: string) => {
    const editor = editorRef.current
    if (editor) {
      const position = editor.getPosition()
      editor.executeEdits('insertText', [
        {
          range: {
            startLineNumber: position.lineNumber,
            startColumn: position.column,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          },
          text,
        },
      ])
      editor.focus()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* 工具栏 */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            SQL Editor
          </span>

          {/* 快捷插入按钮 */}
          <div className="flex items-center space-x-1 ml-4">
            <button
              onClick={() => insertText('SELECT * FROM ')}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              SELECT
            </button>
            <button
              onClick={() => insertText('INSERT INTO ')}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              INSERT
            </button>
            <button
              onClick={() => insertText('UPDATE ')}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              UPDATE
            </button>
            <button
              onClick={() => insertText('DELETE FROM ')}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              DELETE
            </button>
            <button
              onClick={() => insertText('WHERE ')}
              className="px-2 py-1 text-xs text-gray-600 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
            >
              WHERE
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Ctrl+Enter to execute
          </span>
          <button
            onClick={handleExecute}
            disabled={!sql.trim() || isLoading}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Executing...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Execute</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1">
        <Editor
          height="100%"
          language={language}
          value={sql}
          onChange={value => setSql(value || '')}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            formatOnPaste: true,
            formatOnType: true,
          }}
        />
      </div>

      {/* 状态栏 */}
      <div className="flex items-center justify-between px-4 py-1 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Lines: {sql.split('\n').length} | Characters: {sql.length}
        </div>
        <div>{language.toUpperCase()}</div>
      </div>
    </div>
  )
}

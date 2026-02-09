import { useCallback, useEffect, useState } from 'react'
import { Keyboard, RotateCcw } from 'lucide-react'
import {
  useKeybindingStore,
  eventToKeyString,
  formatKeybinding,
  type KeybindingAction,
} from '@/stores/useKeybindingStore'
import { useThemeStore } from '@/stores/useThemeStore'

export function SettingsPage() {
  const { keybindings, updateKeybinding, resetKeybindings } = useKeybindingStore()
  const { theme, setTheme } = useThemeStore()
  const [editingAction, setEditingAction] = useState<KeybindingAction | null>(null)
  const [recordedKeys, setRecordedKeys] = useState<string>('')

  // 录制快捷键
  useEffect(() => {
    if (!editingAction) return

    const handleKeyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      const keyStr = eventToKeyString(e)

      // 忽略只有修饰键的情况
      if (['Ctrl', 'Alt', 'Shift', 'Ctrl+Shift', 'Ctrl+Alt', 'Alt+Shift', 'Ctrl+Alt+Shift'].includes(keyStr)) {
        setRecordedKeys(keyStr + '+...')
        return
      }

      setRecordedKeys(keyStr)
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // 如果已经录制了完整的快捷键（不以 +... 结尾），保存
      if (recordedKeys && !recordedKeys.endsWith('+...')) {
        updateKeybinding(editingAction, recordedKeys)
        setEditingAction(null)
        setRecordedKeys('')
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('keyup', handleKeyUp, true)

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('keyup', handleKeyUp, true)
    }
  }, [editingAction, recordedKeys, updateKeybinding])

  const startEditing = useCallback((action: KeybindingAction) => {
    setEditingAction(action)
    setRecordedKeys('')
  }, [])

  const cancelEditing = useCallback(() => {
    setEditingAction(null)
    setRecordedKeys('')
  }, [])

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-2xl mx-auto p-6 space-y-8">
        <h1 className="text-2xl font-bold text-foreground">设置</h1>

        {/* 主题设置 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            主题
          </h2>
          <div className="flex gap-3">
            {(['light', 'dark', 'system'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                  theme === t
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-card-foreground border-border hover:bg-accent'
                }`}
              >
                {t === 'light' ? '浅色' : t === 'dark' ? '深色' : '跟随系统'}
              </button>
            ))}
          </div>
        </section>

        {/* 快捷键设置 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Keyboard className="w-5 h-5" />
              终端分屏快捷键
            </h2>
            <button
              onClick={resetKeybindings}
              className="flex items-center gap-1 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground bg-card border border-border rounded-lg hover:bg-accent transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              恢复默认
            </button>
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left px-4 py-2.5 text-sm font-medium text-muted-foreground">操作</th>
                  <th className="text-left px-4 py-2.5 text-sm font-medium text-muted-foreground">说明</th>
                  <th className="text-right px-4 py-2.5 text-sm font-medium text-muted-foreground">快捷键</th>
                </tr>
              </thead>
              <tbody>
                {keybindings.map((kb, idx) => (
                  <tr
                    key={kb.action}
                    className={`border-t border-border ${idx % 2 === 0 ? '' : 'bg-muted/20'}`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-foreground">
                      {kb.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {kb.description}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingAction === kb.action ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/50 rounded text-xs font-mono min-w-[120px] text-center animate-pulse">
                            {recordedKeys || '请按下快捷键...'}
                          </span>
                          <button
                            onClick={cancelEditing}
                            className="text-xs text-muted-foreground hover:text-foreground"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEditing(kb.action)}
                          className="px-3 py-1.5 bg-muted text-foreground border border-border rounded text-xs font-mono hover:bg-accent transition-colors min-w-[120px]"
                          title="点击修改快捷键"
                        >
                          {formatKeybinding(kb.keys)}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted-foreground">
            点击快捷键按钮后，按下新的组合键即可修改。快捷键需包含至少一个修饰键（Ctrl/Alt/Shift）。
          </p>
        </section>
      </div>
    </div>
  )
}

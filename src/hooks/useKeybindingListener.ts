import { useEffect } from 'react'
import {
  useKeybindingStore,
  matchKeybinding,
  type KeybindingAction,
} from '@/stores/useKeybindingStore'

type ActionHandlers = Partial<Record<KeybindingAction, () => void>>

/**
 * 监听全局键盘事件，匹配快捷键并执行对应的 action
 */
export function useKeybindingListener(handlers: ActionHandlers, enabled = true) {
  const { keybindings } = useKeybindingStore()

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      for (const kb of keybindings) {
        if (matchKeybinding(e, kb.keys)) {
          const handler = handlers[kb.action]
          if (handler) {
            e.preventDefault()
            e.stopPropagation()
            handler()
            return
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [keybindings, handlers, enabled])
}

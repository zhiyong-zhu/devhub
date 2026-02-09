import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type KeybindingAction =
  | 'splitHorizontal'
  | 'splitVertical'
  | 'closePanel'
  | 'navigateUp'
  | 'navigateDown'
  | 'navigateLeft'
  | 'navigateRight'

export interface Keybinding {
  action: KeybindingAction
  label: string
  keys: string // 格式: "Ctrl+Shift+D"
  description: string
}

const DEFAULT_KEYBINDINGS: Keybinding[] = [
  {
    action: 'splitHorizontal',
    label: '左右分屏',
    keys: 'Ctrl+Shift+D',
    description: '将当前终端左右分屏',
  },
  {
    action: 'splitVertical',
    label: '上下分屏',
    keys: 'Ctrl+Shift+E',
    description: '将当前终端上下分屏',
  },
  {
    action: 'closePanel',
    label: '关闭面板',
    keys: 'Ctrl+Shift+W',
    description: '关闭当前聚焦的终端面板',
  },
  {
    action: 'navigateUp',
    label: '导航到上方面板',
    keys: 'Ctrl+Alt+ArrowUp',
    description: '聚焦到上方的终端面板',
  },
  {
    action: 'navigateDown',
    label: '导航到下方面板',
    keys: 'Ctrl+Alt+ArrowDown',
    description: '聚焦到下方的终端面板',
  },
  {
    action: 'navigateLeft',
    label: '导航到左侧面板',
    keys: 'Ctrl+Alt+ArrowLeft',
    description: '聚焦到左侧的终端面板',
  },
  {
    action: 'navigateRight',
    label: '导航到右侧面板',
    keys: 'Ctrl+Alt+ArrowRight',
    description: '聚焦到右侧的终端面板',
  },
]

interface KeybindingState {
  keybindings: Keybinding[]
  updateKeybinding: (action: KeybindingAction, keys: string) => void
  resetKeybindings: () => void
  getKeybinding: (action: KeybindingAction) => Keybinding | undefined
}

export const useKeybindingStore = create<KeybindingState>()(
  persist(
    (set, get) => ({
      keybindings: DEFAULT_KEYBINDINGS,

      updateKeybinding: (action, keys) => {
        set(state => ({
          keybindings: state.keybindings.map(kb =>
            kb.action === action ? { ...kb, keys } : kb
          ),
        }))
      },

      resetKeybindings: () => {
        set({ keybindings: DEFAULT_KEYBINDINGS })
      },

      getKeybinding: (action) => {
        return get().keybindings.find(kb => kb.action === action)
      },
    }),
    {
      name: 'devhub-keybindings',
    }
  )
)

/**
 * 将键盘事件转换为快捷键字符串
 * 例如: Ctrl+Shift+D, Ctrl+Alt+ArrowUp
 */
export function eventToKeyString(e: KeyboardEvent): string {
  const parts: string[] = []
  if (e.ctrlKey || e.metaKey) parts.push('Ctrl')
  if (e.altKey) parts.push('Alt')
  if (e.shiftKey) parts.push('Shift')

  // 排除修饰键本身
  const key = e.key
  if (!['Control', 'Alt', 'Shift', 'Meta'].includes(key)) {
    // 标准化键名
    if (key.length === 1) {
      parts.push(key.toUpperCase())
    } else {
      parts.push(key)
    }
  }

  return parts.join('+')
}

/**
 * 检查键盘事件是否匹配指定的快捷键字符串
 */
export function matchKeybinding(e: KeyboardEvent, keysStr: string): boolean {
  const eventStr = eventToKeyString(e)
  return eventStr === keysStr
}

/**
 * 将快捷键字符串格式化为显示用的文本
 * macOS 上用 ⌘ 替代 Ctrl 等
 */
export function formatKeybinding(keys: string): string {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
  if (isMac) {
    return keys
      .replace(/Ctrl/g, '⌘')
      .replace(/Alt/g, '⌥')
      .replace(/Shift/g, '⇧')
      .replace(/ArrowUp/g, '↑')
      .replace(/ArrowDown/g, '↓')
      .replace(/ArrowLeft/g, '←')
      .replace(/ArrowRight/g, '→')
      .replace(/\+/g, '')
  }
  return keys
    .replace(/ArrowUp/g, '↑')
    .replace(/ArrowDown/g, '↓')
    .replace(/ArrowLeft/g, '←')
    .replace(/ArrowRight/g, '→')
}

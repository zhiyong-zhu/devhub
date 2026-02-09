import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CommandHistoryEntry {
  command: string
  timestamp: number
  connectionId: string
  workingDirectory?: string
}

interface CommandHistoryStore {
  history: CommandHistoryEntry[]
  maxHistory: number

  // Actions
  addCommand: (command: string, connectionId: string, workingDirectory?: string) => void
  clearHistory: () => void
  getHistoryByConnection: (connectionId: string) => CommandHistoryEntry[]
  searchHistory: (query: string) => CommandHistoryEntry[]
  deleteCommand: (timestamp: number) => void
}

const MAX_HISTORY_SIZE = 1000

export const useCommandHistoryStore = create<CommandHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      maxHistory: MAX_HISTORY_SIZE,

      addCommand: (command: string, connectionId: string, workingDirectory?: string) => {
        // 不要记录空命令或纯空格
        const trimmedCommand = command.trim()
        if (!trimmedCommand) return

        const entry: CommandHistoryEntry = {
          command: trimmedCommand,
          timestamp: Date.now(),
          connectionId,
          workingDirectory,
        }

        set((state) => {
          // 检查是否与上一条命令重复
          const lastEntry = state.history[0]
          if (lastEntry && lastEntry.command === trimmedCommand && lastEntry.connectionId === connectionId) {
            return state
          }

          // 添加到历史记录开头
          const newHistory = [entry, ...state.history]

          // 限制历史记录大小
          if (newHistory.length > state.maxHistory) {
            return { history: newHistory.slice(0, state.maxHistory) }
          }

          return { history: newHistory }
        })
      },

      clearHistory: () => {
        set({ history: [] })
      },

      getHistoryByConnection: (connectionId: string) => {
        return get().history.filter(entry => entry.connectionId === connectionId)
      },

      searchHistory: (query: string) => {
        const lowerQuery = query.toLowerCase()
        return get().history.filter(entry =>
          entry.command.toLowerCase().includes(lowerQuery)
        )
      },

      deleteCommand: (timestamp: number) => {
        set((state) => ({
          history: state.history.filter(entry => entry.timestamp !== timestamp)
        }))
      },
    }),
    {
      name: 'devhub-command-history',
      // 只持久化必要的字段
      partialize: (state) => ({
        history: state.history,
        maxHistory: state.maxHistory,
      }),
    }
  )
)

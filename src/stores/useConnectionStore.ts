import type { Connection } from '@/types'
import { invoke } from '@tauri-apps/api/tauri'
import { create } from 'zustand'

interface ConnectionStore {
  connections: Connection[]
  selectedConnection: Connection | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchConnections: (groupId?: string) => Promise<void>
  addConnection: (
    connection: Omit<Connection, 'id' | 'created_at' | 'updated_at'>
  ) => Promise<string>
  updateConnection: (id: string, connection: Connection) => Promise<void>
  deleteConnection: (id: string) => Promise<void>
  setSelectedConnection: (connection: Connection | null) => void
  exportConnections: () => Promise<string>
  importConnections: (json: string) => Promise<number>
  clearError: () => void
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  selectedConnection: null,
  isLoading: false,
  error: null,

  fetchConnections: async (groupId?: string) => {
    set({ isLoading: true, error: null })
    try {
      const result = await invoke<ConnectionRaw[]>('list_connections', {
        groupId,
      })

      // 转换原始数据为 Connection 类型
      const connections: Connection[] = result.map(raw => {
        const config = JSON.parse(raw.config)
        return {
          id: raw.id,
          name: raw.name,
          type: raw.type as Connection['type'],
          group_id: raw.group_id || undefined,
          config,
          created_at: raw.created_at,
          updated_at: raw.updated_at,
        }
      })

      set({ connections, isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch connections',
        isLoading: false,
      })
    }
  },

  addConnection: async connection => {
    set({ isLoading: true, error: null })
    try {
      const configJson = JSON.stringify(connection.config)
      const id = await invoke<string>('create_connection', {
        name: connection.name,
        connectionType: connection.type,
        groupId: connection.group_id,
        configJson,
      })

      // 刷新列表
      await get().fetchConnections()

      set({ isLoading: false })
      return id
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create connection',
        isLoading: false,
      })
      throw error
    }
  },

  updateConnection: async (id, connection) => {
    set({ isLoading: true, error: null })
    try {
      const configJson = JSON.stringify(connection.config)
      await invoke('update_connection', {
        id,
        name: connection.name,
        connectionType: connection.type,
        groupId: connection.group_id,
        configJson,
      })

      // 刷新列表
      await get().fetchConnections()

      set({ isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to update connection',
        isLoading: false,
      })
      throw error
    }
  },

  deleteConnection: async id => {
    set({ isLoading: true, error: null })
    try {
      await invoke('delete_connection', { id })

      // 刷新列表
      await get().fetchConnections()

      set({ isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete connection',
        isLoading: false,
      })
      throw error
    }
  },

  setSelectedConnection: connection => {
    console.log('🔄 Store: setSelectedConnection 被调用', connection?.name)
    set({ selectedConnection: connection })
    console.log('✅ Store: selectedConnection 已更新')
  },

  exportConnections: async () => {
    try {
      return await invoke<string>('export_connections')
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to export connections',
      })
      throw error
    }
  },

  importConnections: async json => {
    set({ isLoading: true, error: null })
    try {
      const count = await invoke<number>('import_connections', { json })

      // 刷新列表
      await get().fetchConnections()

      set({ isLoading: false })
      return count
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to import connections',
        isLoading: false,
      })
      throw error
    }
  },

  clearError: () => {
    set({ error: null })
  },
}))

// Raw connection type from backend
interface ConnectionRaw {
  id: string
  name: string
  type: string // 后端使用 #[serde(rename = "type")]
  group_id: string | null
  config: string
  created_at: string
  updated_at: string
}

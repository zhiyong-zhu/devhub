/**
 * 连接类型枚举
 */
export type ConnectionType = 'ssh' | 'mysql' | 'postgresql' | 'redis' | 'sqlite'

/**
 * 连接配置接口
 */
export interface Connection {
  id: string
  name: string
  type: ConnectionType
  group_id?: string
  config: SSHConfig | DatabaseConfig
  created_at: string
  updated_at: string
}

/**
 * 分组接口
 */
export interface Group {
  id: string
  name: string
  parent_id?: string
  icon?: string
  created_at?: string
  updated_at?: string
}

/**
 * SSH 连接配置
 */
export interface SSHConfig {
  host: string
  port: number
  username: string
  auth_method: 'password' | 'key'
  password?: string
  private_key_path?: string
  passphrase?: string
  jump_host?: JumpHostConfig
}

/**
 * 数据库连接配置
 */
export interface DatabaseConfig {
  host: string
  port: number
  username: string
  password: string
  database?: string
  ssl?: boolean
}

/**
 * 跳板机配置
 */
export interface JumpHostConfig {
  host: string
  port: number
  username: string
  auth_method: 'password' | 'key'
  password?: string
  private_key_path?: string
}

/**
 * 连接状态
 */
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

/**
 * 连接会话信息
 */
export interface ConnectionSession {
  id: string
  connection_id: string
  status: ConnectionStatus
  connected_at?: string
  error?: string
}

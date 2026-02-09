/**
 * 类型使用示例
 * 这个文件展示如何使用连接类型
 */

import type {
  Connection,
  Group,
  SSHConfig,
  DatabaseConfig,
  ConnectionSession,
} from './index'

// 示例：创建 SSH 连接
function createSSHConnection(): Connection {
  return {
    id: '1',
    name: 'Production Server',
    type: 'ssh',
    group_id: 'group-1',
    config: {
      host: '192.168.1.100',
      port: 22,
      username: 'admin',
      auth_method: 'password',
      password: 'password123',
    },
    created_at: '2025-02-05T00:00:00Z',
    updated_at: '2025-02-05T00:00:00Z',
  }
}

// 示例：创建 MySQL 连接
function createMySQLConnection(): Connection {
  return {
    id: '2',
    name: 'Production Database',
    type: 'mysql',
    config: {
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'password',
      database: 'mydb',
      ssl: true,
    },
    created_at: '2025-02-05T00:00:00Z',
    updated_at: '2025-02-05T00:00:00Z',
  }
}

// 示例：创建带跳板机的 SSH 连接
function createSSHConnectionWithJumpHost(): Connection {
  return {
    id: '3',
    name: 'Bastion Server',
    type: 'ssh',
    config: {
      host: '10.0.0.1',
      port: 22,
      username: 'admin',
      auth_method: 'key',
      private_key_path: '/home/user/.ssh/id_rsa',
      passphrase: 'keypass',
      jump_host: {
        host: 'bastion.example.com',
        port: 22,
        username: 'bastion_user',
        auth_method: 'password',
        password: 'bastion_pass',
      },
    },
    created_at: '2025-02-05T00:00:00Z',
    updated_at: '2025-02-05T00:00:00Z',
  }
}

// 示例：创建分组
function createGroup(): Group {
  return {
    id: 'group-1',
    name: 'Production Servers',
    parent_id: undefined,
    icon: 'folder',
    created_at: '2025-02-05T00:00:00Z',
    updated_at: '2025-02-05T00:00:00Z',
  }
}

// 示例：创建连接会话
function createConnectionSession(): ConnectionSession {
  return {
    id: 'session-1',
    connection_id: '1',
    status: 'connected',
    connected_at: '2025-02-05T00:00:00Z',
  }
}

// 示例：类型守卫函数
function isSSHConfig(config: SSHConfig | DatabaseConfig): config is SSHConfig {
  return 'auth_method' in config
}

function isDatabaseConfig(
  config: SSHConfig | DatabaseConfig,
): config is DatabaseConfig {
  return 'ssl' in config
}

// 示例：使用类型守卫
function processConnection(connection: Connection) {
  if (isSSHConfig(connection.config)) {
    console.log(`SSH Connection: ${connection.config.host}:${connection.config.port}`)
  } else if (isDatabaseConfig(connection.config)) {
    console.log(
      `Database Connection: ${connection.config.host}:${connection.config.port}/${connection.config.database}`,
    )
  }
}

// 导出示例
export {
  createGroup,
  createMySQLConnection,
  createSSHConnection,
  createSSHConnectionWithJumpHost,
  createConnectionSession,
  isSSHConfig,
  isDatabaseConfig,
  processConnection,
}

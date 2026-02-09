use serde::{Deserialize, Serialize};

/**
 * 连接配置结构体
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Connection {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub connection_type: ConnectionType,
    pub group_id: Option<String>,
    pub config: Config,
    pub created_at: String,
    pub updated_at: String,
}

/**
 * 连接类型枚举
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionType {
    Ssh,
    Mysql,
    Postgresql,
    Redis,
    Sqlite,
}

/**
 * 连接配置枚举（使用 untagged 以支持多种配置类型）
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum Config {
    Ssh(SSHConfig),
    Database(DatabaseConfig),
}

/**
 * SSH 连接配置
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SSHConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub private_key_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub passphrase: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub jump_host: Option<JumpHostConfig>,
}

/**
 * 认证方式
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum AuthMethod {
    Password,
    Key,
}

/**
 * 数据库连接配置
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DatabaseConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub database: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub ssl: Option<bool>,
}

/**
 * 跳板机配置
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JumpHostConfig {
    pub host: String,
    pub port: u16,
    pub username: String,
    pub auth_method: AuthMethod,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub password: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub private_key_path: Option<String>,
}

/**
 * 分组结构体
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Group {
    pub id: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub parent_id: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub icon: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<String>,
}

/**
 * 连接状态
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ConnectionStatus {
    Disconnected,
    Connecting,
    Connected,
    Error,
}

/**
 * 连接会话信息
 */
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConnectionSession {
    pub id: String,
    pub connection_id: String,
    pub status: ConnectionStatus,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub connected_at: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_serialize_ssh_config() {
        let config = SSHConfig {
            host: "localhost".to_string(),
            port: 22,
            username: "user".to_string(),
            auth_method: AuthMethod::Password,
            password: Some("pass".to_string()),
            private_key_path: None,
            passphrase: None,
            jump_host: None,
        };

        let json = serde_json::to_string(&config).unwrap();
        println!("SSH Config: {}", json);
        assert!(json.contains("localhost"));
    }

    #[test]
    fn test_serialize_connection() {
        let connection = Connection {
            id: "1".to_string(),
            name: "Test SSH".to_string(),
            connection_type: ConnectionType::Ssh,
            group_id: None,
            config: Config::Ssh(SSHConfig {
                host: "localhost".to_string(),
                port: 22,
                username: "user".to_string(),
                auth_method: AuthMethod::Password,
                password: Some("pass".to_string()),
                private_key_path: None,
                passphrase: None,
                jump_host: None,
            }),
            created_at: "2025-01-01T00:00:00Z".to_string(),
            updated_at: "2025-01-01T00:00:00Z".to_string(),
        };

        let json = serde_json::to_string(&connection).unwrap();
        println!("Connection: {}", json);
        assert!(json.contains("\"type\":\"ssh\""));
    }
}

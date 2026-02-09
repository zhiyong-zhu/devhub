// 模块使用示例文件
// 这个文件展示了如何使用我们定义的类型
// 在实际实现 commands 时会被使用

use crate::models::connection::*;

#[allow(dead_code)]
fn example_create_ssh_connection() -> Connection {
    Connection {
        id: "1".to_string(),
        name: "Production Server".to_string(),
        connection_type: ConnectionType::Ssh,
        group_id: Some("group-1".to_string()),
        config: Config::Ssh(SSHConfig {
            host: "192.168.1.100".to_string(),
            port: 22,
            username: "admin".to_string(),
            auth_method: AuthMethod::Password,
            password: Some("password123".to_string()),
            private_key_path: None,
            passphrase: None,
            jump_host: None,
        }),
        created_at: "2025-02-05T00:00:00Z".to_string(),
        updated_at: "2025-02-05T00:00:00Z".to_string(),
    }
}

#[allow(dead_code)]
fn example_create_mysql_connection() -> Connection {
    Connection {
        id: "2".to_string(),
        name: "Production Database".to_string(),
        connection_type: ConnectionType::Mysql,
        group_id: None,
        config: Config::Database(DatabaseConfig {
            host: "localhost".to_string(),
            port: 3306,
            username: "root".to_string(),
            password: "password".to_string(),
            database: Some("mydb".to_string()),
            ssl: Some(true),
        }),
        created_at: "2025-02-05T00:00:00Z".to_string(),
        updated_at: "2025-02-05T00:00:00Z".to_string(),
    }
}

#[allow(dead_code)]
fn example_create_group() -> Group {
    Group {
        id: "group-1".to_string(),
        name: "Production Servers".to_string(),
        parent_id: None,
        icon: Some("folder".to_string()),
        created_at: Some("2025-02-05T00:00:00Z".to_string()),
        updated_at: Some("2025-02-05T00:00:00Z".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ssh_connection_serialization() {
        let conn = example_create_ssh_connection();
        let json = serde_json::to_string(&conn).unwrap();

        // 验证序列化结果
        assert!(json.contains("\"type\":\"ssh\""));
        assert!(json.contains("192.168.1.100"));
        assert!(json.contains("admin"));

        // 反序列化测试
        let _deserialized: Connection = serde_json::from_str(&json).unwrap();
    }

    #[test]
    fn test_mysql_connection_serialization() {
        let conn = example_create_mysql_connection();
        let json = serde_json::to_string(&conn).unwrap();

        // 验证序列化结果
        assert!(json.contains("\"type\":\"mysql\""));
        assert!(json.contains("localhost"));
        assert!(json.contains("3306"));

        // 反序列化测试
        let _deserialized: Connection = serde_json::from_str(&json).unwrap();
    }

    #[test]
    fn test_group_serialization() {
        let group = example_create_group();
        let json = serde_json::to_string(&group).unwrap();

        // 验证序列化结果
        assert!(json.contains("Production Servers"));

        // 反序列化测试
        let _deserialized: Group = serde_json::from_str(&json).unwrap();
    }
}

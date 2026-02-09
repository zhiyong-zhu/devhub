use crate::modules::database::get_db;
use chrono::Utc;
use uuid::Uuid;

/// 创建连接
#[tauri::command]
pub async fn create_connection(
    name: String,
    connection_type: String,
    group_id: Option<String>,
    config_json: String,
) -> Result<String, String> {
    let db = get_db();

    // 生成 UUID
    let id = Uuid::new_v4().to_string();

    // 如果是密码认证，加密密码
    let encrypted_config = if config_json.contains("\"password\"") {
        // TODO: 实现密码加密（需要先解析 JSON，加密后重新序列化）
        config_json.clone()
    } else {
        config_json.clone()
    };

    let now = Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        INSERT INTO connections (id, name, type, group_id, config, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        "#,
    )
    .bind(&id)
    .bind(&name)
    .bind(&connection_type)
    .bind(&group_id)
    .bind(&encrypted_config)
    .bind(&now)
    .bind(&now)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to create connection: {}", e))?;

    Ok(id)
}

/// 更新连接
#[tauri::command]
pub async fn update_connection(
    id: String,
    name: String,
    connection_type: String,
    group_id: Option<String>,
    config_json: String,
) -> Result<(), String> {
    let db = get_db();

    let now = Utc::now().to_rfc3339();

    sqlx::query(
        r#"
        UPDATE connections
        SET name = ?, type = ?, group_id = ?, config = ?, updated_at = ?
        WHERE id = ?
        "#,
    )
    .bind(&name)
    .bind(&connection_type)
    .bind(&group_id)
    .bind(&config_json)
    .bind(&now)
    .bind(&id)
    .execute(db.pool())
    .await
    .map_err(|e| format!("Failed to update connection: {}", e))?;

    Ok(())
}

/// 删除连接
#[tauri::command]
pub async fn delete_connection(id: String) -> Result<(), String> {
    let db = get_db();

    sqlx::query("DELETE FROM connections WHERE id = ?")
        .bind(&id)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to delete connection: {}", e))?;

    Ok(())
}

/// 列出所有连接（可按分组过滤）
#[tauri::command]
pub async fn list_connections(group_id: Option<String>) -> Result<Vec<ConnectionRaw>, String> {
    let db = get_db();

    let rows = if let Some(gid) = group_id {
        sqlx::query_as::<_, (String, String, String, Option<String>, String, String, String)>(
            "SELECT id, name, type, group_id, config, created_at, updated_at FROM connections WHERE group_id = ?"
        )
        .bind(&gid)
        .fetch_all(db.pool())
        .await
        .map_err(|e| format!("Failed to list connections: {}", e))?
    } else {
        sqlx::query_as::<_, (String, String, String, Option<String>, String, String, String)>(
            "SELECT id, name, type, group_id, config, created_at, updated_at FROM connections"
        )
        .fetch_all(db.pool())
        .await
        .map_err(|e| format!("Failed to list connections: {}", e))?
    };

    let connections: Vec<ConnectionRaw> = rows
        .into_iter()
        .map(|(id, name, conn_type, group_id, config, created_at, updated_at)| {
            ConnectionRaw {
                id,
                name,
                connection_type: conn_type,
                group_id,
                config,
                created_at,
                updated_at,
            }
        })
        .collect();

    Ok(connections)
}

/// 导出所有连接（JSON 格式）
#[tauri::command]
pub async fn export_connections() -> Result<String, String> {
    let connections = list_connections(None).await?;

    serde_json::to_string_pretty(&connections)
        .map_err(|e| format!("Failed to serialize connections: {}", e))
}

/// 导入连接（JSON 格式）
#[tauri::command]
pub async fn import_connections(json: String) -> Result<usize, String> {
    let db = get_db();

    let connections: Vec<ImportConnection> = serde_json::from_str(&json)
        .map_err(|e| format!("Invalid JSON format: {}", e))?;

    let mut count = 0;
    for conn in connections {
        let id = Uuid::new_v4().to_string();
        let now = Utc::now().to_rfc3339();

        sqlx::query(
            r#"
            INSERT INTO connections (id, name, type, group_id, config, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            "#,
        )
        .bind(&id)
        .bind(&conn.name)
        .bind(&conn.connection_type)
        .bind(&conn.group_id)
        .bind(&conn.config)
        .bind(&now)
        .bind(&now)
        .execute(db.pool())
        .await
        .map_err(|e| format!("Failed to import connection: {}", e))?;

        count += 1;
    }

    Ok(count)
}

/// 原始连接数据（从数据库查询）
#[derive(Debug, serde::Serialize)]
pub struct ConnectionRaw {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub connection_type: String,
    pub group_id: Option<String>,
    pub config: String,
    pub created_at: String,
    pub updated_at: String,
}

/// 导入用的连接数据（没有 id）
#[derive(Debug, serde::Deserialize)]
struct ImportConnection {
    pub name: String,
    #[serde(rename = "type")]
    pub connection_type: String,
    pub group_id: Option<String>,
    pub config: String,
}

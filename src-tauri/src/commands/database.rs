use sqlx::{MySql, Postgres, Pool, Row, Column};
use tauri::command;
use std::collections::HashMap;
use serde::{Serialize, Deserialize};

/// 数据库会话类型
pub enum DatabaseSession {
    MySQL(Pool<MySql>),
    PostgreSQL(Pool<Postgres>),
}

/// 查询结果
#[derive(Debug, Serialize, Deserialize)]
pub struct QueryResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<serde_json::Value>>,
    pub rows_affected: u64,
}

/// MySQL 连接
#[command]
pub async fn mysql_connect(
    host: String,
    port: u16,
    username: String,
    password: String,
    database: Option<String>,
) -> Result<String, String> {
    let connection_string = if let Some(db) = database {
        format!("mysql://{}:{}@{}:{}/{}", username, password, host, port, db)
    } else {
        format!("mysql://{}:{}@{}:{}", username, password, host, port)
    };

    let pool = sqlx::mysql::MySqlPoolOptions::new()
        .connect(&connection_string)
        .await
        .map_err(|e| format!("Failed to connect to MySQL: {}", e))?;

    let session_id = uuid::Uuid::new_v4().to_string();

    // 保存连接到全局管理器
    crate::commands::database::save_db_session_async(session_id.clone(), DatabaseSession::MySQL(pool)).await;

    Ok(session_id)
}

/// PostgreSQL 连接
#[command]
pub async fn postgresql_connect(
    host: String,
    port: u16,
    username: String,
    password: String,
    database: Option<String>,
) -> Result<String, String> {
    let connection_string = if let Some(db) = database {
        format!("postgres://{}:{}@{}:{}/{}", username, password, host, port, db)
    } else {
        format!("postgres://{}:{}@{}:{}", username, password, host, port)
    };

    let pool = sqlx::postgres::PgPoolOptions::new()
        .connect(&connection_string)
        .await
        .map_err(|e| format!("Failed to connect to PostgreSQL: {}", e))?;

    let session_id = uuid::Uuid::new_v4().to_string();

    // 保存连接到全局管理器
    crate::commands::database::save_db_session_async(session_id.clone(), DatabaseSession::PostgreSQL(pool)).await;

    Ok(session_id)
}

/// MySQL 查询
#[command]
pub async fn mysql_query(session_id: String, query: String) -> Result<QueryResult, String> {
    let pool = crate::commands::database::get_mysql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let result = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if result.is_empty() {
        return Ok(QueryResult {
            columns: vec![],
            rows: vec![],
            rows_affected: 0,
        });
    }

    // 获取列名
    let columns = result[0]
        .columns()
        .iter()
        .map(|c| c.name().to_string())
        .collect();

    // 转换行数据
    let rows: Vec<Vec<serde_json::Value>> = result
        .iter()
        .map(|row| {
            row.columns()
                .iter()
                .enumerate()
                .map(|(i, _col)| {
                    // 尝试获取不同类型的值
                    if let Ok(val) = row.try_get::<String, _>(i) {
                        serde_json::Value::String(val)
                    } else if let Ok(val) = row.try_get::<i32, _>(i) {
                        serde_json::Value::Number(val.into())
                    } else if let Ok(val) = row.try_get::<i64, _>(i) {
                        serde_json::Value::Number(val.into())
                    } else if let Ok(val) = row.try_get::<f64, _>(i) {
                        serde_json::Value::Number(serde_json::Number::from_f64(val).unwrap_or(serde_json::Number::from(0)))
                    } else if let Ok(val) = row.try_get::<bool, _>(i) {
                        serde_json::Value::Bool(val)
                    } else {
                        serde_json::Value::Null
                    }
                })
                .collect()
        })
        .collect();

    let rows_affected = rows.len() as u64;

    Ok(QueryResult {
        columns,
        rows,
        rows_affected,
    })
}

/// PostgreSQL 查询
#[command]
pub async fn postgresql_query(session_id: String, query: String) -> Result<QueryResult, String> {
    let pool = crate::commands::database::get_postgresql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let result = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Query failed: {}", e))?;

    if result.is_empty() {
        return Ok(QueryResult {
            columns: vec![],
            rows: vec![],
            rows_affected: 0,
        });
    }

    // PostgreSQL 列信息获取方式略有不同
    let columns = result[0]
        .columns()
        .iter()
        .map(|c| c.name().to_string())
        .collect();

    let rows: Vec<Vec<serde_json::Value>> = result
        .iter()
        .map(|row| {
            row.columns()
                .iter()
                .enumerate()
                .map(|(i, _)| {
                    if let Ok(val) = row.try_get::<String, _>(i) {
                        serde_json::Value::String(val)
                    } else if let Ok(val) = row.try_get::<i32, _>(i) {
                        serde_json::Value::Number(val.into())
                    } else if let Ok(val) = row.try_get::<i64, _>(i) {
                        serde_json::Value::Number(val.into())
                    } else if let Ok(val) = row.try_get::<f64, _>(i) {
                        serde_json::Value::Number(serde_json::Number::from_f64(val).unwrap_or(serde_json::Number::from(0)))
                    } else if let Ok(val) = row.try_get::<bool, _>(i) {
                        serde_json::Value::Bool(val)
                    } else {
                        serde_json::Value::Null
                    }
                })
                .collect()
        })
        .collect();

    let rows_affected = rows.len() as u64;

    Ok(QueryResult {
        columns,
        rows,
        rows_affected,
    })
}

/// MySQL 列出数据库
#[command]
pub async fn mysql_list_databases(session_id: String) -> Result<Vec<String>, String> {
    let pool = crate::commands::database::get_mysql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let result = sqlx::query("SHOW DATABASES")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to list databases: {}", e))?;

    let databases = result
        .iter()
        .filter_map(|row| row.try_get::<String, _>(0).ok())
        .collect();

    Ok(databases)
}

/// PostgreSQL 列出数据库
#[command]
pub async fn postgresql_list_databases(session_id: String) -> Result<Vec<String>, String> {
    let pool = crate::commands::database::get_postgresql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let result = sqlx::query("SELECT datname FROM pg_database WHERE datistemplate = false")
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to list databases: {}", e))?;

    let databases = result
        .iter()
        .filter_map(|row| row.try_get::<String, _>(0).ok())
        .collect();

    Ok(databases)
}

/// MySQL 列出表
#[command]
pub async fn mysql_list_tables(session_id: String, database: Option<String>) -> Result<Vec<String>, String> {
    let pool = crate::commands::database::get_mysql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let query = if let Some(db) = database {
        format!("SHOW TABLES FROM `{}`", db)
    } else {
        "SHOW TABLES".to_string()
    };

    let result = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to list tables: {}", e))?;

    let tables = result
        .iter()
        .filter_map(|row| row.try_get::<String, _>(0).ok())
        .collect();

    Ok(tables)
}

/// PostgreSQL 列出表
#[command]
pub async fn postgresql_list_tables(session_id: String) -> Result<Vec<String>, String> {
    let pool = crate::commands::database::get_postgresql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let result = sqlx::query(
        "SELECT tablename FROM pg_tables WHERE schemaname = 'public'"
    )
    .fetch_all(&pool)
    .await
    .map_err(|e| format!("Failed to list tables: {}", e))?;

    let tables = result
        .iter()
        .filter_map(|row| row.try_get::<String, _>(0).ok())
        .collect();

    Ok(tables)
}

/// MySQL 描述表结构
#[command]
pub async fn mysql_describe_table(session_id: String, table: String, database: Option<String>) -> Result<Vec<HashMap<String, String>>, String> {
    let pool = crate::commands::database::get_mysql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let query = if let Some(db) = database {
        format!("DESCRIBE `{}`.`{}`", db, table)
    } else {
        format!("DESCRIBE `{}`", table)
    };

    let result = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to describe table: {}", e))?;

    let columns = result
        .iter()
        .map(|row| {
            let mut map = HashMap::new();
            if let Ok(field) = row.try_get::<String, _>(0) { map.insert("field".to_string(), field); }
            if let Ok(typ) = row.try_get::<String, _>(1) { map.insert("type".to_string(), typ); }
            if let Ok(null) = row.try_get::<String, _>(2) { map.insert("null".to_string(), null); }
            if let Ok(key) = row.try_get::<String, _>(3) { map.insert("key".to_string(), key); }
            if let Ok(default) = row.try_get::<Option<String>, _>(4) { map.insert("default".to_string(), default.unwrap_or_default()); }
            if let Ok(extra) = row.try_get::<String, _>(5) { map.insert("extra".to_string(), extra); }
            map
        })
        .collect();

    Ok(columns)
}

/// PostgreSQL 描述表结构
#[command]
pub async fn postgresql_describe_table(session_id: String, table: String) -> Result<Vec<HashMap<String, String>>, String> {
    let pool = crate::commands::database::get_postgresql_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    let query = format!(
        "SELECT column_name, data_type, is_nullable, column_default
         FROM information_schema.columns
         WHERE table_name = '{}'
         ORDER BY ordinal_position",
        table
    );

    let result = sqlx::query(&query)
        .fetch_all(&pool)
        .await
        .map_err(|e| format!("Failed to describe table: {}", e))?;

    let columns = result
        .iter()
        .map(|row| {
            let mut map = HashMap::new();
            if let Ok(name) = row.try_get::<String, _>(0) { map.insert("column_name".to_string(), name); }
            if let Ok(typ) = row.try_get::<String, _>(1) { map.insert("data_type".to_string(), typ); }
            if let Ok(nullable) = row.try_get::<String, _>(2) { map.insert("is_nullable".to_string(), nullable); }
            if let Ok(default) = row.try_get::<Option<String>, _>(3) { map.insert("column_default".to_string(), default.unwrap_or_default()); }
            map
        })
        .collect();

    Ok(columns)
}

/// 数据库断开连接
#[command]
pub async fn database_disconnect(session_id: String) -> Result<(), String> {
    crate::commands::database::remove_db_session_async(&session_id)
        .await
        .ok_or_else(|| format!("Session not found: {}", session_id))?;

    Ok(())
}

// ============ 全局会话管理器 ============

use std::sync::Arc;
use tokio::sync::Mutex;
use once_cell::sync::Lazy;

static DB_SESSIONS: Lazy<Arc<Mutex<HashMap<String, DatabaseSession>>>> =
    Lazy::new(|| Arc::new(Mutex::new(HashMap::new())));

pub async fn save_db_session_async(session_id: String, session: DatabaseSession) {
    DB_SESSIONS.lock().await.insert(session_id, session);
}

pub async fn get_mysql_session_async(session_id: &str) -> Option<Pool<MySql>> {
    match DB_SESSIONS.lock().await.get(session_id)? {
        DatabaseSession::MySQL(pool) => Some(pool.clone()),
        _ => None,
    }
}

pub async fn get_postgresql_session_async(session_id: &str) -> Option<Pool<Postgres>> {
    match DB_SESSIONS.lock().await.get(session_id)? {
        DatabaseSession::PostgreSQL(pool) => Some(pool.clone()),
        _ => None,
    }
}

pub async fn remove_db_session_async(session_id: &str) -> Option<DatabaseSession> {
    DB_SESSIONS.lock().await.remove(session_id)
}

use sqlx::SqlitePool;
use anyhow::Result;
use tauri::AppHandle;

/// 数据库连接池
pub struct Database {
    pool: SqlitePool,
}

impl Database {
    /// 创建新的数据库实例
    pub async fn new(app_handle: &AppHandle) -> Result<Self> {
        // 获取应用数据目录
        let app_dir = app_handle.path_resolver().app_data_dir()
            .ok_or_else(|| anyhow::anyhow!("Failed to get app data dir"))?;

        // 确保目录存在
        std::fs::create_dir_all(&app_dir)
            .map_err(|e| anyhow::anyhow!("Failed to create app dir: {}", e))?;

        let db_path = app_dir.join("devhub.db");

        // 构建数据库连接字符串
        let connection_string = format!(
            "sqlite:{}?mode=rwc",
            db_path.to_string_lossy().replace('\\', "\\\\")
        );

        // 创建连接池
        let pool = SqlitePool::connect(&connection_string)
            .await
            .map_err(|e| anyhow::anyhow!("Failed to connect to database: {}", e))?;

        let db = Database { pool };

        // 初始化数据库表
        db.init_tables().await?;

        Ok(db)
    }

    /// 初始化数据库表
    async fn init_tables(&self) -> Result<()> {
        // 创建分组表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS groups (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                parent_id TEXT,
                icon TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (parent_id) REFERENCES groups(id) ON DELETE CASCADE
            );
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create groups table: {}", e))?;

        // 创建连接表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS connections (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT NOT NULL,
                group_id TEXT,
                config TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE SET NULL
            );
            "#,
        )
        .execute(&self.pool)
        .await
        .map_err(|e| anyhow::anyhow!("Failed to create connections table: {}", e))?;

        // 创建索引
        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_connections_type
            ON connections(type);
            "#,
        )
        .execute(&self.pool)
        .await
        .ok(); // 索引创建失败不影响功能

        sqlx::query(
            r#"
            CREATE INDEX IF NOT EXISTS idx_connections_group_id
            ON connections(group_id);
            "#,
        )
        .execute(&self.pool)
        .await
        .ok();

        Ok(())
    }

    /// 获取连接池引用
    pub fn pool(&self) -> &SqlitePool {
        &self.pool
    }
}

/// 全局数据库实例（使用 Once_cell）
use once_cell::sync::OnceCell;
static DB: OnceCell<Database> = OnceCell::new();

/// 初始化全局数据库
pub async fn init_database(app_handle: &AppHandle) -> Result<()> {
    let db = Database::new(app_handle).await?;
    DB.set(db)
        .map_err(|_| anyhow::anyhow!("Failed to set global database"))?;
    Ok(())
}

/// 获取全局数据库实例
pub fn get_db() -> &'static Database {
    DB.get()
        .expect("Database not initialized. Call init_database first.")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    #[ignore = "requires app handle"]
    async fn test_database_creation() {
        // 这个测试需要 AppHandle，在实际运行测试时会被跳过
        // 可以在集成测试中使用
    }
}

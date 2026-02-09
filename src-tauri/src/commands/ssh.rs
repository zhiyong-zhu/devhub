use crate::modules::ssh::client::get_ssh_manager;
use tauri::{command, AppHandle};

/// 初始化 SSH 管理器（在应用启动时调用）
#[command]
pub fn init_ssh_manager(app_handle: AppHandle) {
    let manager = get_ssh_manager();
    manager.set_app_handle(app_handle);
}

/// SSH 连接
#[command]
pub async fn ssh_connect(
    host: String,
    port: u16,
    username: String,
    auth_method: String,
    password: Option<String>,
    key_path: Option<String>,
    passphrase: Option<String>,
) -> Result<String, String> {
    let manager = get_ssh_manager();

    let session_id = manager
        .create_session(
            host,
            port,
            username,
            &auth_method,
            password.as_deref(),
            key_path.as_deref(),
            passphrase.as_deref(),
        )
        .await
        .map_err(|e| format!("Failed to connect: {}", e))?;

    Ok(session_id)
}

/// SSH 断开连接
#[command]
pub async fn ssh_disconnect(session_id: String) -> Result<(), String> {
    let manager = get_ssh_manager();

    manager
        .remove_session(&session_id)
        .await
        .map_err(|e| format!("Failed to disconnect: {}", e))?;

    Ok(())
}

/// SSH 写入数据
#[command]
pub async fn ssh_write(session_id: String, data: String) -> Result<(), String> {
    let manager = get_ssh_manager();

    manager
        .write_to_session(&session_id, data.as_bytes())
        .await
        .map_err(|e| format!("Failed to write: {}", e))?;

    Ok(())
}

/// 列出所有活跃的 SSH 会话
#[command]
pub async fn ssh_list_sessions() -> Result<Vec<String>, String> {
    let manager = get_ssh_manager();
    Ok(manager.list_sessions().await)
}

/// 调整 SSH 终端窗口大小
#[command]
pub async fn ssh_resize_window(
    session_id: String,
    cols: u32,
    rows: u32,
    width: u32,
    height: u32,
) -> Result<(), String> {
    let manager = get_ssh_manager();

    manager
        .resize_window(&session_id, cols, rows, width, height)
        .await
        .map_err(|e| format!("Failed to resize window: {}", e))?;

    Ok(())
}

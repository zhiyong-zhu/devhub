use anyhow::{anyhow, Result};
use async_trait::async_trait;
use base64::Engine;
use once_cell::sync::Lazy;
use russh::client::{self, Config, Handle, Msg};
use russh::keys::key::PublicKey;
use russh::{Channel, ChannelId, ChannelMsg, CryptoVec, Disconnect};
use serde_json::json;
use std::collections::HashMap;
use std::sync::Arc;
use tauri::Manager;
use tokio::sync::Mutex;
use uuid::Uuid;

/// SSH 客户端 Handler 实现
struct SSHClientHandler;

#[async_trait]
impl client::Handler for SSHClientHandler {
    type Error = russh::Error;

    async fn check_server_key(
        &mut self,
        _server_public_key: &PublicKey,
    ) -> std::result::Result<bool, Self::Error> {
        // 接受所有服务器密钥（生产环境应该验证）
        Ok(true)
    }
}

/// SSH 会话句柄
/// - Handle + ChannelId: 用于写入数据和断开连接
/// - Arc<Mutex<Channel>>: 共享 Channel，读取任务用 wait()，resize 用 window_change()
pub struct SSHSessionHandle {
    pub id: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    handle: Handle<SSHClientHandler>,
    channel_id: ChannelId,
    channel: Arc<Mutex<Channel<Msg>>>,
}

impl SSHSessionHandle {
    /// 写入数据到 SSH channel
    pub async fn write(&self, data: &[u8]) -> Result<()> {
        self.handle
            .data(self.channel_id, CryptoVec::from_slice(data))
            .await
            .map_err(|_| anyhow!("Failed to write to SSH channel"))?;
        Ok(())
    }

    /// 调整窗口大小
    pub async fn resize(&self, cols: u32, rows: u32, width: u32, height: u32) -> Result<()> {
        let ch = self.channel.lock().await;
        ch.window_change(cols, rows, width, height)
            .await
            .map_err(|e| anyhow!("Failed to resize window: {}", e))?;
        Ok(())
    }

    /// 关闭会话
    pub async fn close(&self) -> Result<()> {
        self.handle
            .disconnect(Disconnect::ByApplication, "", "English")
            .await
            .map_err(|e| anyhow!("Failed to disconnect: {}", e))?;
        Ok(())
    }
}

/// SSH 会话管理器
pub struct SSHSessionManager {
    sessions: Arc<Mutex<HashMap<String, SSHSessionHandle>>>,
    app_handle: Arc<Mutex<Option<tauri::AppHandle>>>,
}

impl SSHSessionManager {
    pub fn new() -> Self {
        Self {
            sessions: Arc::new(Mutex::new(HashMap::new())),
            app_handle: Arc::new(Mutex::new(None)),
        }
    }

    pub fn set_app_handle(&self, handle: tauri::AppHandle) {
        let mut guard = self.app_handle.blocking_lock();
        *guard = Some(handle);
    }

    /// 创建新的 SSH 会话
    pub async fn create_session(
        &self,
        host: String,
        port: u16,
        username: String,
        auth_method: &str,
        password: Option<&str>,
        key_path: Option<&str>,
        passphrase: Option<&str>,
    ) -> Result<String> {
        let session_id = Uuid::new_v4().to_string();
        let app_handle = self
            .app_handle
            .lock()
            .await
            .as_ref()
            .ok_or_else(|| anyhow!("App handle not set"))?
            .clone();

        // 创建客户端配置
        let config = Arc::new(Config::default());

        // 创建 Handler
        let handler = SSHClientHandler;

        // 连接到 SSH 服务器
        let mut handle = client::connect(config, (host.as_str(), port), handler)
            .await
            .map_err(|e| anyhow!("Failed to connect to SSH server: {}", e))?;

        // 进行认证
        let authenticated = match auth_method {
            "password" => {
                let pwd = password.ok_or_else(|| anyhow!("Password not provided"))?;
                handle
                    .authenticate_password(&username, pwd)
                    .await
                    .map_err(|e| anyhow!("Password authentication failed: {}", e))?
            }
            "key" => {
                let key_file = key_path.ok_or_else(|| anyhow!("Key path not provided"))?;
                let key_pair = if let Some(pass) = passphrase {
                    russh_keys::load_secret_key(key_file, Some(pass))
                        .map_err(|e| anyhow!("Failed to load key with passphrase: {}", e))?
                } else {
                    russh_keys::load_secret_key(key_file, None)
                        .map_err(|e| anyhow!("Failed to load key: {}", e))?
                };

                handle
                    .authenticate_publickey(&username, Arc::new(key_pair))
                    .await
                    .map_err(|e| anyhow!("Public key authentication failed: {}", e))?
            }
            _ => return Err(anyhow!("Unsupported auth method: {}", auth_method)),
        };

        if !authenticated {
            return Err(anyhow!("Authentication failed"));
        }

        // 打开 session channel
        let channel = handle
            .channel_open_session()
            .await
            .map_err(|e| anyhow!("Failed to open session channel: {}", e))?;

        // 请求 PTY
        channel
            .request_pty(
                false,
                "xterm-256color",
                80,  // 列数
                24,  // 行数
                640, // 像素宽度
                480, // 像素高度
                &[],
            )
            .await
            .map_err(|e| anyhow!("Failed to request PTY: {}", e))?;

        // 请求 shell
        channel
            .request_shell(false)
            .await
            .map_err(|e| anyhow!("Failed to request shell: {}", e))?;

        // 用 Arc<Mutex> 共享 Channel：读取任务用 wait()，resize 用 window_change()
        let channel_id = channel.id();
        let shared_channel = Arc::new(Mutex::new(channel));

        // 创建会话句柄
        let session = SSHSessionHandle {
            id: session_id.clone(),
            host: host.clone(),
            port,
            username: username.clone(),
            handle,
            channel_id,
            channel: shared_channel.clone(),
        };

        // 保存会话
        self.sessions
            .lock()
            .await
            .insert(session_id.clone(), session);

        // 启动数据读取任务
        let session_id_clone = session_id.clone();
        let app_handle_clone = app_handle.clone();
        let read_channel = shared_channel;

        tokio::spawn(async move {
            loop {
                let msg = {
                    let mut ch = read_channel.lock().await;
                    ch.wait().await
                };
                match msg {
                    Some(ChannelMsg::Data { ref data }) => {
                        let encoded =
                            base64::engine::general_purpose::STANDARD.encode(&data[..]);
                        let _ = app_handle_clone
                            .emit_all(&format!("ssh-data-{}", session_id_clone), encoded);
                    }
                    Some(ChannelMsg::ExtendedData { ref data, .. }) => {
                        let encoded =
                            base64::engine::general_purpose::STANDARD.encode(&data[..]);
                        let _ = app_handle_clone
                            .emit_all(&format!("ssh-data-{}", session_id_clone), encoded);
                    }
                    Some(ChannelMsg::Eof) | Some(ChannelMsg::Close) | None => {
                        let _ = app_handle_clone.emit_all(
                            &format!("ssh-disconnected-{}", session_id_clone),
                            json!({ "session_id": session_id_clone }),
                        );
                        break;
                    }
                    _ => {}
                }
            }
        });

        // 发送连接成功事件
        let _ = app_handle.emit_all(
            &format!("ssh-connected-{}", session_id),
            json!({
                "session_id": session_id,
                "host": host,
                "port": port,
                "username": username,
            }),
        );

        Ok(session_id)
    }

    /// 写入数据到会话
    pub async fn write_to_session(&self, session_id: &str, data: &[u8]) -> Result<()> {
        let sessions = self.sessions.lock().await;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| anyhow!("Session not found: {}", session_id))?;

        session.write(data).await
    }

    /// 调整窗口大小
    pub async fn resize_window(
        &self,
        session_id: &str,
        cols: u32,
        rows: u32,
        width: u32,
        height: u32,
    ) -> Result<()> {
        let sessions = self.sessions.lock().await;
        let session = sessions
            .get(session_id)
            .ok_or_else(|| anyhow!("Session not found: {}", session_id))?;

        session.resize(cols, rows, width, height).await
    }

    /// 删除会话
    pub async fn remove_session(&self, session_id: &str) -> Result<()> {
        let mut sessions = self.sessions.lock().await;
        if let Some(session) = sessions.remove(session_id) {
            let _ = session.close().await;
        }
        Ok(())
    }

    /// 列出所有会话
    pub async fn list_sessions(&self) -> Vec<String> {
        self.sessions.lock().await.keys().cloned().collect()
    }
}

/// 全局 session 管理器
static SSH_MANAGER: Lazy<SSHSessionManager> = Lazy::new(|| SSHSessionManager::new());

pub fn get_ssh_manager() -> &'static SSHSessionManager {
    &SSH_MANAGER
}

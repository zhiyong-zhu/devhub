pub mod connection;
pub mod ssh;
pub mod database;

pub use connection::*;
pub use ssh::*;
pub use database::*;

// Tauri Commands
#[cfg_attr(not(test), allow(unused_variables))]
#[tauri::command]
pub fn greet(name: &str) -> Result<String, String> {
    Ok(format!("Hello, {}! You've been greeted from Rust!", name))
}

// SFTP 相关命令
// TODO: Task 3.1
// - sftp_list_dir
// - sftp_upload
// - sftp_download
// - sftp_delete
// - sftp_rename
// - sftp_read_file
// - sftp_write_file

// 数据库相关命令
// TODO: Task 2.2
// - mysql_connect
// - mysql_query
// - mysql_list_databases
// - mysql_list_tables
// - mysql_describe_table

// 系统命令
// TODO: Task 1.7
// - get_app_info
// - get_app_version

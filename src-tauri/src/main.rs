// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod models;
mod utils;
mod modules;
mod commands;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // 初始化 SSH 管理器
            commands::init_ssh_manager(app.handle());

            // 初始化数据库
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                modules::database::init_database(&handle)
                    .await
                    .expect("Failed to initialize database");
            });

            // 自动打开开发者工具（仅在开发模式下）
            #[cfg(debug_assertions)]
            {
                use tauri::Manager;
                if let Some(window) = app.get_window("main") {
                    window.open_devtools();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::init_ssh_manager,
            commands::create_connection,
            commands::update_connection,
            commands::delete_connection,
            commands::list_connections,
            commands::export_connections,
            commands::import_connections,
            commands::ssh_connect,
            commands::ssh_disconnect,
            commands::ssh_write,
            commands::ssh_list_sessions,
            commands::ssh_resize_window,
            commands::mysql_connect,
            commands::postgresql_connect,
            commands::mysql_query,
            commands::postgresql_query,
            commands::mysql_list_databases,
            commands::postgresql_list_databases,
            commands::mysql_list_tables,
            commands::postgresql_list_tables,
            commands::mysql_describe_table,
            commands::postgresql_describe_table,
            commands::database_disconnect,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

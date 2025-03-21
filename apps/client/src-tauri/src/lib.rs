mod commands;
mod db;
mod models;
mod repositories;
mod schema;
mod services;

use crate::models::User;
use std::sync::Mutex;
use std::path::PathBuf;

// 将数据库连接池和资源路径作为应用状态
pub struct AppState {
    db_pool: Mutex<db::DbPool>,
    current_user: Mutex<User>,
    app_resource_path: PathBuf,  // 应用资源目录路径
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化数据库连接池
    let db_pool = db::establish_connection().expect("数据库初始化失败");

    // 获取应用资源目录路径
    let app_resource_path = db::get_app_resource_path().expect("获取资源目录失败");

    // 获取默认用户
    let current_user = {
        let mut conn = db_pool.get().expect("无法获取数据库连接");
        services::user_service::UserService::get_default_user(&mut conn).expect("无法获取默认用户")
    };

    tauri::Builder::default()
        .manage(AppState {
            db_pool: Mutex::new(db_pool),
            current_user: Mutex::new(current_user),
            app_resource_path,
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_version,
            commands::create_ai_user,
            commands::get_current_user,
            commands::get_current_user_chat_list,
            commands::add_current_user_contact,
            commands::remove_current_user_contact,
            commands::create_current_user_ai_contact,
            commands::get_current_user_contacts,
            commands::upload_image,
            commands::get_image_url
        ])
        .run(tauri::generate_context!())
        .expect("运行应用失败");
}

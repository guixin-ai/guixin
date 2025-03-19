mod commands;
mod db;
mod models;
mod repositories;
mod schema;
mod services;

use crate::models::User;
use std::sync::Mutex;

// 将数据库连接池作为应用状态
pub struct AppState {
    db_pool: Mutex<db::DbPool>,
    current_user: Mutex<User>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // 初始化数据库连接池
    let db_pool = db::establish_connection().expect("数据库初始化失败");

    // 获取默认用户
    let current_user = {
        let mut conn = db_pool.get().expect("无法获取数据库连接");
        services::user_service::UserService::get_default_user(&mut conn).expect("无法获取默认用户")
    };

    tauri::Builder::default()
        .manage(AppState {
            db_pool: Mutex::new(db_pool),
            current_user: Mutex::new(current_user),
        })
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // 用户命令
            commands::user_commands::get_current_user,
            commands::user_commands::create_user,
            commands::user_commands::get_all_users,
            commands::user_commands::get_user_by_id,
            commands::user_commands::update_user,
            commands::user_commands::delete_user,
            // 联系人分组命令
            commands::contact_group_commands::create_contact_group,
            commands::contact_group_commands::get_all_contact_groups,
            commands::contact_group_commands::get_contact_group_by_id,
            commands::contact_group_commands::update_contact_group,
            commands::contact_group_commands::delete_contact_group,
            // 联系人命令
            commands::contact_commands::create_contact,
            commands::contact_commands::create_ai_contact,
            commands::contact_commands::get_all_contacts,
            commands::contact_commands::get_contact_by_id,
            commands::contact_commands::get_contacts_by_user_id,
            commands::contact_commands::get_contacts_by_group_id,
            commands::contact_commands::get_contacts_by_contact_user_id,
            commands::contact_commands::update_contact,
            commands::contact_commands::delete_contact,
            commands::contact_commands::get_all_contacts_with_group,
            commands::contact_commands::get_contact_by_id_with_group,
            commands::contact_commands::get_contacts_by_user_id_with_group,
            commands::contact_commands::get_contacts_by_group_id_with_group,
            // 聊天命令
            commands::chat_commands::create_chat,
            commands::chat_commands::get_all_chats,
            commands::chat_commands::get_chat_by_id,
            commands::chat_commands::get_chats_by_type,
            commands::chat_commands::update_chat,
            commands::chat_commands::delete_chat,
            commands::chat_commands::add_chat_participant,
            commands::chat_commands::get_chat_participants,
            commands::chat_commands::remove_chat_participant,
            commands::chat_commands::create_individual_chat,
            commands::chat_commands::get_chats_by_user_id,
            commands::chat_commands::get_chats_with_details_by_user_id,
            commands::chat_commands::get_user_chats,
            // 联系人用户链接命令
            commands::contact_user_link_commands::get_contact_user_link_by_id,
            commands::contact_user_link_commands::get_user_id_by_contact_user_link,
        ])
        .run(tauri::generate_context!())
        .expect("运行应用失败");
}

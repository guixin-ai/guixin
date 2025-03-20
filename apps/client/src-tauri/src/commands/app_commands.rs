use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct AppVersion {
    pub version: String,
    pub build_date: String,
}

/// 获取应用版本信息
/// 
/// 此命令主要用于端到端测试，返回固定的版本号信息
#[tauri::command]
pub fn get_app_version() -> AppVersion {
    AppVersion {
        version: "1.0.0".to_string(),
        build_date: "2023-10-01".to_string(),
    }
} 
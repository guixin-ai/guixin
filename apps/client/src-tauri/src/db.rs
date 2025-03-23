use anyhow::{anyhow, Result};
use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dirs::data_dir;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

// 应用和资源目录常量
pub const APP_DIR_NAME: &str = "guixin";
pub const RESOURCES_DIR_NAME: &str = "resources";
pub const IMAGES_DIR_NAME: &str = "images";
pub const TEXTS_DIR_NAME: &str = "texts";

// 嵌入迁移文件
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

// 定义连接池类型
pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<SqliteConnection>>;

// 获取数据库路径
fn get_database_path() -> Result<PathBuf> {
    let data_dir = data_dir().ok_or_else(|| anyhow!("无法确定数据目录"))?;
    let app_dir = data_dir.join(APP_DIR_NAME);
    
    // 确保应用数据目录存在
    std::fs::create_dir_all(&app_dir)
        .map_err(|e| anyhow!("无法创建应用数据目录: {}", e))?;
    
    let db_path = app_dir.join("chat.db");
    Ok(db_path)
}

// 获取应用资源目录路径
pub fn get_app_resource_path() -> Result<PathBuf> {
    let data_dir = data_dir().ok_or_else(|| anyhow!("无法确定数据目录"))?;
    let app_dir = data_dir.join(APP_DIR_NAME);
    let resource_dir = app_dir.join(RESOURCES_DIR_NAME);
    
    // 确保资源目录存在
    std::fs::create_dir_all(&resource_dir)
        .map_err(|e| anyhow!("无法创建资源目录: {}", e))?;
    
    Ok(resource_dir)
}

// 获取图片目录路径
pub fn get_images_dir_path() -> Result<PathBuf> {
    let resource_dir = get_app_resource_path()?;
    let images_dir = resource_dir.join(IMAGES_DIR_NAME);
    
    // 确保图片目录存在
    std::fs::create_dir_all(&images_dir)
        .map_err(|e| anyhow!("无法创建图片目录: {}", e))?;
    
    Ok(images_dir)
}

// 获取文本目录路径
pub fn get_texts_dir_path() -> Result<PathBuf> {
    let resource_dir = get_app_resource_path()?;
    let texts_dir = resource_dir.join(TEXTS_DIR_NAME);
    
    // 确保文本目录存在
    std::fs::create_dir_all(&texts_dir)
        .map_err(|e| anyhow!("无法创建文本目录: {}", e))?;
    
    Ok(texts_dir)
}

// 创建数据库连接池
pub fn establish_connection() -> Result<DbPool> {
    let database_path = get_database_path()?;
    let database_url = database_path
        .to_str()
        .ok_or_else(|| anyhow!("路径转换失败"))?;

    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .map_err(|e| anyhow!("无法创建数据库连接池: {}", e))?;

    // 运行迁移
    let mut conn = pool.get()?;
    run_migrations(&mut conn)?;

    Ok(pool)
}

// 运行数据库迁移
fn run_migrations(conn: &mut DbConnection) -> Result<()> {
    // 使用 diesel_migrations 运行迁移
    conn.run_pending_migrations(MIGRATIONS)
        .map_err(|e| anyhow!("无法运行数据库迁移: {}", e))?;

    Ok(())
}

// 从应用状态中获取数据库连接池的辅助函数
pub fn get_connection_pool(app_handle: &AppHandle) -> DbPool {
    let state = app_handle.state::<crate::AppState>();
    let pool = state.db_pool.lock().expect("无法获取数据库连接池锁");
    pool.clone()
}

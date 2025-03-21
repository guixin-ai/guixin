use anyhow::{anyhow, Result};
use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dirs::data_dir;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

// 嵌入迁移文件
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

// 定义连接池类型
pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<SqliteConnection>>;

// 获取数据库路径
fn get_database_path() -> Result<PathBuf> {
    let data_dir = data_dir().ok_or_else(|| anyhow!("无法确定数据目录"))?;
    let app_dir = data_dir.join("guixin");
    
    // 确保应用数据目录存在
    std::fs::create_dir_all(&app_dir)
        .map_err(|e| anyhow!("无法创建应用数据目录: {}", e))?;
    
    let db_path = app_dir.join("chat.db");
    Ok(db_path)
}

// 获取应用资源目录路径
pub fn get_app_resource_path() -> Result<PathBuf> {
    let data_dir = data_dir().ok_or_else(|| anyhow!("无法确定数据目录"))?;
    let app_dir = data_dir.join("guixin");
    let resource_dir = app_dir.join("resources");
    
    // 确保资源目录存在
    std::fs::create_dir_all(&resource_dir)
        .map_err(|e| anyhow!("无法创建资源目录: {}", e))?;
    
    Ok(resource_dir)
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

use anyhow::{anyhow, Result};
use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use dirs::data_dir;
use std::path::PathBuf;

// 嵌入迁移文件
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

// 定义连接池类型
pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;
pub type DbConnection = r2d2::PooledConnection<ConnectionManager<SqliteConnection>>;

// 获取数据库文件路径
fn get_database_path() -> Result<PathBuf> {
    let mut path = data_dir().ok_or_else(|| anyhow!("无法获取数据目录"))?;
    path.push("guixin");
    std::fs::create_dir_all(&path)?;
    path.push("database.sqlite");
    Ok(path)
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

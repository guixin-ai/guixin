use thiserror::Error;

#[derive(Error, Debug)]
pub enum RepositoryError {
    #[error("数据库错误: {0}")]
    DatabaseError(#[from] diesel::result::Error),

    #[error("连接池错误: {0}")]
    ConnectionError(#[from] r2d2::Error),

    #[error("实体未找到: {0}")]
    NotFound(String),

    #[error("实体已存在: {0}")]
    AlreadyExists(String),

    #[error("无效的输入: {0}")]
    InvalidInput(String),

    #[error("未知错误: {0}")]
    Unknown(String),
}

pub type RepositoryResult<T> = Result<T, RepositoryError>;

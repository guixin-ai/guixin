use diesel::result::Error as DieselError;
use r2d2::Error as R2D2Error;
use thiserror::Error;

/// 仓库错误类型
#[derive(Debug, Error)]
pub enum RepositoryError {
    #[error("数据库连接错误: {0}")]
    ConnectionError(#[from] R2D2Error),

    #[error("数据库操作错误: {0}")]
    DatabaseError(#[from] DieselError),

    #[error("未找到资源")]
    NotFound,

    #[error("参数错误: {0}")]
    InvalidArgument(String),

    #[error("内部错误: {0}")]
    InternalError(String),
}

/// 仓库结果类型
pub type RepositoryResult<T> = Result<T, RepositoryError>; 
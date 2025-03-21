// 导出所有仓储模块
pub mod chat_participant_repository;
pub mod chat_repository;
pub mod message_repository;
pub mod user_repository;
pub mod user_contact_repository;

// 导出错误类型
pub mod error;
pub use error::RepositoryError;

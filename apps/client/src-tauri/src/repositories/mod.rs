// 导出所有仓储模块
pub mod agent_repository;
pub mod attachment_repository;
pub mod chat_participant_repository;
pub mod chat_repository;
pub mod contact_group_repository;
pub mod contact_repository;
pub mod contact_user_link_repository;
pub mod conversation_repository;
pub mod message_receipt_repository;
pub mod message_repository;
pub mod user_repository;

// 导出错误类型
pub mod error;
pub use error::RepositoryError;

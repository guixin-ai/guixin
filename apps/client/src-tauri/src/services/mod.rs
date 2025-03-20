pub mod chat_service;
pub mod message_service;
pub mod user_service;

pub type ServiceResult<T> = Result<T, anyhow::Error>;

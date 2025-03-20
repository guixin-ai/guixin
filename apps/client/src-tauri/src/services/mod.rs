pub mod chat_service;
pub mod message_service;
pub mod user_service;

pub use chat_service::ChatService;
pub use message_service::MessageService;
pub use user_service::UserService;

pub type ServiceResult<T> = Result<T, anyhow::Error>;

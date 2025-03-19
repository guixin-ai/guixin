use crate::db::DbPool;
use crate::models::{NewUser, User};
use crate::repositories::error::{RepositoryError, RepositoryResult};
use crate::repositories::user_repository::UserRepository;
use crate::schema::users;
use diesel::prelude::*;

pub struct UserService {
    repository: UserRepository,
}

impl UserService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            repository: UserRepository::new(pool),
        }
    }

    // 获取默认用户（静态方法）
    pub fn get_default_user(conn: &mut diesel::SqliteConnection) -> RepositoryResult<User> {
        // 直接使用Diesel查询默认用户
        users::table
            .filter(users::id.eq("default-user"))
            .first::<User>(conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("默认用户不存在"))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 创建新用户
    pub fn create_user(&self, name: String, email: Option<String>) -> RepositoryResult<User> {
        self.repository.create_with_defaults(name, email)
    }

    // 获取所有用户
    pub fn get_all_users(&self) -> RepositoryResult<Vec<User>> {
        self.repository.find_all()
    }

    // 根据ID获取用户
    pub fn get_user_by_id(&self, id: &str) -> RepositoryResult<User> {
        self.repository.find_by_id(id)
    }

    // 更新用户
    pub fn update_user(&self, id: &str, user: User) -> RepositoryResult<User> {
        // 检查用户是否存在
        self.repository.find_by_id(id)?;

        self.repository.update(id, user)
    }

    // 删除用户
    pub fn delete_user(&self, id: &str) -> RepositoryResult<usize> {
        // 检查用户是否存在
        self.repository.find_by_id(id)?;

        self.repository.delete(id)
    }
}

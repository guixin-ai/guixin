use chrono::Utc;
use diesel::prelude::*;
use uuid::Uuid;

use super::error::{RepositoryError, RepositoryResult};
use crate::db::DbPool;
use crate::models::{Agent, NewAgent};
use crate::schema::agents;

pub struct AgentRepository {
    pool: DbPool,
}

impl AgentRepository {
    pub fn new(pool: DbPool) -> Self {
        Self { pool }
    }

    // 创建新 Agent
    pub fn create(&self, new_agent: NewAgent) -> RepositoryResult<Agent> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::insert_into(agents::table)
            .values(&new_agent)
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        agents::table
            .filter(agents::id.eq(&new_agent.id))
            .first(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据ID查找 Agent
    pub fn find_by_id(&self, id: &str) -> RepositoryResult<Agent> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        agents::table
            .filter(agents::id.eq(id))
            .first(&mut conn)
            .map_err(|e| match e {
                diesel::result::Error::NotFound => {
                    RepositoryError::NotFound(format!("Agent ID: {}", id))
                }
                _ => RepositoryError::DatabaseError(e),
            })
    }

    // 查找所有 Agent
    pub fn find_all(&self) -> RepositoryResult<Vec<Agent>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        agents::table
            .load::<Agent>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 根据用户ID查找 Agent
    pub fn find_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<Agent>> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        agents::table
            .filter(agents::user_id.eq(user_id))
            .load::<Agent>(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 更新 Agent
    pub fn update(&self, id: &str, agent: Agent) -> RepositoryResult<Agent> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::update(agents::table.filter(agents::id.eq(id)))
            .set((
                agents::name.eq(&agent.name),
                agents::model_name.eq(&agent.model_name),
                agents::system_prompt.eq(&agent.system_prompt),
                agents::temperature.eq(agent.temperature),
                agents::max_tokens.eq(agent.max_tokens),
                agents::top_p.eq(agent.top_p),
                agents::avatar_url.eq(&agent.avatar_url),
                agents::description.eq(&agent.description),
                agents::is_streaming.eq(agent.is_streaming),
                agents::updated_at.eq(Utc::now().naive_utc()),
                agents::user_id.eq(&agent.user_id),
            ))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)?;

        self.find_by_id(id)
    }

    // 删除 Agent
    pub fn delete(&self, id: &str) -> RepositoryResult<usize> {
        let mut conn = self.pool.get().map_err(RepositoryError::PoolError)?;

        diesel::delete(agents::table.filter(agents::id.eq(id)))
            .execute(&mut conn)
            .map_err(RepositoryError::DatabaseError)
    }

    // 创建新 Agent（自动生成ID和时间戳）
    pub fn create_with_defaults(
        &self,
        name: String,
        model_name: String,
        system_prompt: String,
        temperature: f32,
        user_id: Option<String>,
    ) -> RepositoryResult<Agent> {
        let now = Utc::now().naive_utc();
        let new_agent = NewAgent {
            id: Uuid::new_v4().to_string(),
            name,
            model_name,
            system_prompt,
            temperature,
            max_tokens: None,
            top_p: None,
            avatar_url: None,
            description: None,
            is_streaming: true,
            created_at: now,
            updated_at: now,
            user_id,
        };

        self.create(new_agent)
    }
}

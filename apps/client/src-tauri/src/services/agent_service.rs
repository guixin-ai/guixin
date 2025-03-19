use crate::db::DbPool;
use crate::models::{Agent, NewAgent};
use crate::repositories::agent_repository::AgentRepository;
use crate::repositories::error::{RepositoryError, RepositoryResult};

pub struct AgentService {
    repository: AgentRepository,
}

impl AgentService {
    pub fn new(pool: DbPool) -> Self {
        Self {
            repository: AgentRepository::new(pool),
        }
    }

    // 创建新Agent
    pub fn create_agent(
        &self,
        name: String,
        model_name: String,
        system_prompt: String,
        temperature: f32,
        max_tokens: Option<i32>,
        top_p: Option<f32>,
        avatar_url: Option<String>,
        description: Option<String>,
        is_streaming: bool,
        user_id: Option<String>,
    ) -> RepositoryResult<Agent> {
        self.repository
            .create_with_defaults(name, model_name, system_prompt, temperature, user_id)
    }

    // 获取所有Agent
    pub fn get_all_agents(&self) -> RepositoryResult<Vec<Agent>> {
        self.repository.find_all()
    }

    // 根据ID获取Agent
    pub fn get_agent_by_id(&self, id: &str) -> RepositoryResult<Agent> {
        self.repository.find_by_id(id)
    }

    // 根据用户ID获取Agent
    pub fn get_agents_by_user_id(&self, user_id: &str) -> RepositoryResult<Vec<Agent>> {
        self.repository.find_by_user_id(user_id)
    }

    // 更新Agent
    pub fn update_agent(&self, id: &str, agent: Agent) -> RepositoryResult<Agent> {
        // 检查Agent是否存在
        self.repository.find_by_id(id)?;

        self.repository.update(id, agent)
    }

    // 删除Agent
    pub fn delete_agent(&self, id: &str) -> RepositoryResult<usize> {
        // 检查Agent是否存在
        self.repository.find_by_id(id)?;

        self.repository.delete(id)
    }
}

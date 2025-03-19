use serde::{Deserialize, Serialize};
use tauri::{command, State};

use crate::models::Agent;
use crate::repositories::error::RepositoryError;
use crate::services::AgentService;
use crate::AppState;

#[derive(Debug, Deserialize)]
pub struct CreateAgentRequest {
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
}

#[derive(Debug, Deserialize)]
pub struct UpdateAgentRequest {
    id: String,
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
}

// 创建Agent
#[command]
pub fn create_agent(state: State<AppState>, request: CreateAgentRequest) -> Result<Agent, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    service
        .create_agent(
            request.name,
            request.model_name,
            request.system_prompt,
            request.temperature,
            request.max_tokens,
            request.top_p,
            request.avatar_url,
            request.description,
            request.is_streaming,
            request.user_id,
        )
        .map_err(|e| format!("创建Agent失败: {}", e))
}

// 获取所有Agent
#[command]
pub fn get_all_agents(state: State<AppState>) -> Result<Vec<Agent>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    service
        .get_all_agents()
        .map_err(|e| format!("获取Agent失败: {}", e))
}

// 根据ID获取Agent
#[command]
pub fn get_agent_by_id(state: State<AppState>, id: String) -> Result<Agent, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    service.get_agent_by_id(&id).map_err(|e| match e {
        RepositoryError::NotFound(_) => format!("Agent不存在: {}", id),
        _ => format!("获取Agent失败: {}", e),
    })
}

// 根据用户ID获取Agent
#[command]
pub fn get_agents_by_user_id(
    state: State<AppState>,
    user_id: String,
) -> Result<Vec<Agent>, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    service
        .get_agents_by_user_id(&user_id)
        .map_err(|e| format!("获取用户Agent失败: {}", e))
}

// 更新Agent
#[command]
pub fn update_agent(state: State<AppState>, request: UpdateAgentRequest) -> Result<Agent, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    // 先获取现有Agent
    let agent_result = service.get_agent_by_id(&request.id);
    if let Err(e) = agent_result {
        return Err(match e {
            RepositoryError::NotFound(_) => format!("Agent不存在: {}", request.id),
            _ => format!("获取Agent失败: {}", e),
        });
    }

    let mut agent = agent_result.unwrap();

    // 更新字段
    agent.name = request.name;
    agent.model_name = request.model_name;
    agent.system_prompt = request.system_prompt;
    agent.temperature = request.temperature;
    agent.max_tokens = request.max_tokens;
    agent.top_p = request.top_p;
    agent.avatar_url = request.avatar_url;
    agent.description = request.description;
    agent.is_streaming = request.is_streaming;
    agent.user_id = request.user_id;

    service
        .update_agent(&request.id, agent)
        .map_err(|e| format!("更新Agent失败: {}", e))
}

// 删除Agent
#[command]
pub fn delete_agent(state: State<AppState>, id: String) -> Result<bool, String> {
    let pool = state.db_pool.lock().unwrap();
    let service = AgentService::new(pool.clone());

    service
        .delete_agent(&id)
        .map(|_| true)
        .map_err(|e| match e {
            RepositoryError::NotFound(_) => format!("Agent不存在: {}", id),
            _ => format!("删除Agent失败: {}", e),
        })
}

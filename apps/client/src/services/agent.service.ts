/**
 * Agent服务 - 提供与Agent相关的操作方法
 * 使用 Tauri 的 invoke 调用后端 API
 */

import { invoke } from '@tauri-apps/api/core';
import { Agent, CreateAgentRequest, UpdateAgentRequest } from '../types';

class AgentService {
  /**
   * 获取所有Agent
   * @returns Agent列表
   */
  async getAllAgents(): Promise<Agent[]> {
    return await invoke<Agent[]>('get_all_agents');
  }

  /**
   * 根据ID获取Agent
   * @param id Agent ID
   * @returns Agent信息
   */
  async getAgentById(id: string): Promise<Agent> {
    return await invoke<Agent>('get_agent_by_id', { id });
  }

  /**
   * 根据用户ID获取Agent
   * @param userId 用户ID
   * @returns Agent列表
   */
  async getAgentsByUserId(userId: string): Promise<Agent[]> {
    return await invoke<Agent[]>('get_agents_by_user_id', { userId });
  }

  /**
   * 创建Agent
   * @param request 创建Agent请求
   * @returns 创建的Agent信息
   */
  async createAgent(request: CreateAgentRequest): Promise<Agent> {
    return await invoke<Agent>('create_agent', { request });
  }

  /**
   * 更新Agent
   * @param request 更新Agent请求
   * @returns 更新后的Agent信息
   */
  async updateAgent(request: UpdateAgentRequest): Promise<Agent> {
    return await invoke<Agent>('update_agent', { request });
  }

  /**
   * 删除Agent
   * @param id Agent ID
   * @returns 操作结果
   */
  async deleteAgent(id: string): Promise<boolean> {
    return await invoke<boolean>('delete_agent', { id });
  }
}

// 导出单例实例
export const agentService = new AgentService();

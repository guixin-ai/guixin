import { ActionFunctionArgs, data } from "react-router-dom";
import { z } from "zod";
import { chatCommands } from "@/commands";

/**
 * 创建群聊的action
 */
export async function createGroupChatAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理创建群聊请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData.entries());
    
    console.log('接收到的表单数据:', rawData);
    
    // 使用Zod验证数据
    const validatedData = z.object({
      contactIds: z.string().transform(ids => ids.split(',').filter(id => id.trim() !== ''))
    }).parse(rawData);
    
    console.log('验证后的数据:', validatedData);
    
    // 检查是否有选中的联系人
    if (validatedData.contactIds.length === 0) {
      return data({
        success: false,
        error: '请至少选择一个联系人',
      }, { status: 400 });
    }
    
    // 调用指令层创建群聊
    const response = await chatCommands.createGroupChat(validatedData.contactIds);
    const chatId = response.chatId;
    
    console.log('群聊创建成功:', chatId);
    
    // 返回成功响应
    return data({ 
      success: true, 
      chatId,
      message: '群聊创建成功'
    }, { status: 200 });
  } catch (error) {
    // 返回错误信息
    console.error('创建群聊失败:', error);
    
    if (error instanceof z.ZodError) {
      // 返回验证错误信息
      return data({
        success: false,
        error: error.errors.map(e => e.message).join(", "),
        fieldErrors: error.format(),
      }, { status: 400 });
    }
    
    // 返回通用错误信息
    return data({
      success: false,
      error: `创建群聊失败: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
}

/**
 * 发送聊天消息的action
 */
export async function sendChatMessageAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理发送消息请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    
    // 使用Zod验证数据
    const validatedData = z.object({
      chatId: z.string().min(1, "聊天ID不能为空"),
      content: z.string().min(1, "消息内容不能为空"),
      tempId: z.string().optional(),
    }).parse(Object.fromEntries(formData.entries()));
    
    console.log('验证后的数据:', validatedData);
    
    // 调用指令层发送消息
    const response = await chatCommands.sendMessage(
      validatedData.chatId, 
      validatedData.content,
      validatedData.tempId
    );
    
    // 返回成功响应
    return data({ 
      success: true, 
      messageId: response.messageId,
      timestamp: response.timestamp,
      tempId: validatedData.tempId
    }, { status: 200 });
  } catch (error) {
    // 返回错误信息
    console.error('发送消息失败:', error);
    
    if (error instanceof z.ZodError) {
      // 返回验证错误信息
      return data({
        success: false,
        error: error.errors.map(e => e.message).join(", "),
      }, { status: 400 });
    }
    
    // 返回通用错误信息
    return data({
      success: false,
      error: `发送消息失败: ${error instanceof Error ? error.message : String(error)}`,
    }, { status: 500 });
  }
} 
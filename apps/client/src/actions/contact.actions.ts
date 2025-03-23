import { ActionFunctionArgs, data } from "react-router-dom";
import { z } from "zod";
import { contactCommands } from "@/commands/contact.commands";

// 创建联系人的schema
const createContactSchema = z.object({
  name: z.string().min(1, "联系人名称不能为空").max(50, "联系人名称不能超过50个字符"),
  description: z.string().optional(),
  isAi: z.boolean().optional().default(false),
});

// 删除联系人的schema
const deleteContactSchema = z.object({
  id: z.string().min(1, "联系人ID不能为空"),
});

/**
 * 创建联系人的action
 */
export async function createContactAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理联系人创建请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    
    console.log('接收到的表单数据:', rawData);
    
    // 使用Zod验证数据
    const validatedData = createContactSchema.parse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
      isAi: formData.get("isAi") === "true",
    });
    
    console.log('验证后的数据:', validatedData);
    
    let contactResponse;
    
    // 根据是否是AI联系人调用不同的指令
    if (validatedData.isAi) {
      // 创建AI联系人
      contactResponse = await contactCommands.createCurrentUserAiContact(
        validatedData.name,
        validatedData.description
      );
    } else {
      // 如果是普通联系人，需要实现相应的创建逻辑
      // 由于后端可能还没有此功能，这里需要根据实际情况调整
      return data({
        success: false,
        error: "普通联系人创建功能尚未实现"
      }, { status: 400 });
    }
    
    console.log('联系人创建成功');
    
    // 返回成功响应
    return data({
      success: true,
      message: '联系人创建成功',
      contact: {
        id: contactResponse.id,
        name: contactResponse.name,
        description: contactResponse.description,
        isAi: contactResponse.is_ai
      }
    });
  } catch (error) {
    console.error('创建联系人失败:', error);
    
    if (error instanceof z.ZodError) {
      return data({
        success: false,
        error: error.errors.map(e => e.message).join(", "),
        fieldErrors: error.format(),
      }, { status: 400 });
    }
    
    return data({
      success: false,
      error: `创建联系人失败: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
}

/**
 * 删除联系人的action
 */
export async function deleteContactAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理联系人删除请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const contactId = formData.get('id');
    
    console.log('要删除的联系人ID:', contactId);
    
    // 验证联系人ID
    const { id } = deleteContactSchema.parse({ id: contactId });
    
    // 调用指令层删除联系人
    await contactCommands.removeCurrentUserContact(id);
    
    console.log('联系人删除成功');
    
    // 返回成功响应
    return data({
      success: true,
      message: '联系人删除成功'
    });
  } catch (error) {
    console.error('删除联系人失败:', error);
    
    if (error instanceof z.ZodError) {
      return data({
        success: false,
        error: error.errors.map(e => e.message).join(", "),
      }, { status: 400 });
    }
    
    return data({
      success: false,
      error: `删除联系人失败: ${error instanceof Error ? error.message : String(error)}`
    }, { status: 500 });
  }
} 
import { ActionFunctionArgs, redirect, data } from "react-router-dom";
import { z } from "zod";
import { resourceCommands } from "@/commands/resource.commands";
import { NewTextFormData } from "@/pages/resources/new-text";

/**
 * 添加文本资源的action
 */
export async function createTextResourceAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理文本资源创建请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const rawData = Object.fromEntries(formData);
    
    console.log('接收到的表单数据:', rawData);
    
    // 使用Zod验证数据
    const validatedData = z.object({
      name: z.string().min(1).max(50),
      description: z.string().optional(),
      content: z.string().min(1),
    }).parse(rawData);
    
    console.log('验证后的数据:', validatedData);
    
    // 调用指令层创建文本资源
    await resourceCommands.uploadCurrentUserText({
      name: validatedData.name,
      description: validatedData.description || "",
      content: validatedData.content,
    });
    
    console.log('文本资源创建成功');
    // 返回成功响应，不再重定向
    return data({ 
      success: true, 
      message: '文本资源创建成功',
      id: validatedData.name  // 返回一些可能有用的信息
    });
  } catch (error) {
    // 返回错误信息
    console.error('创建文本资源失败:', error);
    
    if (error instanceof z.ZodError) {
      // 返回验证错误信息 - 使用400状态码表示客户端输入错误
      return data({
        success: false,
        error: error.errors.map(e => e.message).join(", "),
        fieldErrors: error.format(),
      }, { status: 400 });
    }
    
    // 返回通用错误信息 - 使用500状态码表示服务器内部错误
    return data({
      success: false,
      error: '创建文本资源失败，请稍后再试',
    }, { status: 500 });
  }
}

/**
 * 上传图片资源的action
 */
export async function uploadImageResourceAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理图片资源上传请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const name = formData.get('name') as string;
    const fileName = formData.get('file_name') as string;
    
    console.log('接收到的图片数据:', { name, fileName, fileSize: imageFile?.size });
    
    if (!imageFile) {
      return data({ error: '没有提供图片文件' }, { status: 400 });
    }
    
    // 读取文件为ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 调用指令层上传图片
    await resourceCommands.uploadCurrentUserImage({
      imageData: Array.from(uint8Array),
      name: name || imageFile.name.split('.')[0],  // 使用提供的名称或文件名
      file_name: fileName || imageFile.name
    });
    
    console.log('图片上传成功');
    // 返回成功响应
    return data({ success: true, message: '图片上传成功' }, { status: 200 });
  } catch (error) {
    // 返回错误信息
    console.error('上传图片资源失败:', error);
    
    // 返回通用错误信息
    return data(
      { 
        success: false,
        error: `上传图片资源失败: ${error instanceof Error ? error.message : String(error)}` 
      },
      { status: 500 }
    );
  }
}

/**
 * 删除资源的action
 */
export async function deleteResourceAction({ request }: ActionFunctionArgs) {
  console.log('Action触发: 开始处理资源删除请求');
  
  try {
    // 从请求中获取表单数据
    const formData = await request.formData();
    const resourceId = formData.get('id') as string;
    
    console.log('要删除的资源ID:', resourceId);
    
    if (!resourceId || typeof resourceId !== 'string') {
      return data({
        success: false,
        error: '无效的资源ID',
      }, { status: 400 });
    }
    
    // 调用指令层删除资源
    await resourceCommands.deleteResource({ id: resourceId });
    
    console.log('资源删除成功');
    // 返回成功响应
    return data({ success: true, message: '资源删除成功' }, { status: 200 });
  } catch (error) {
    // 返回错误信息
    console.error('删除资源失败:', error);
    
    // 返回通用错误信息
    return data(
      { 
        success: false,
        error: `删除资源失败: ${error instanceof Error ? error.message : String(error)}`
      },
      { status: 500 }
    );
  }
}
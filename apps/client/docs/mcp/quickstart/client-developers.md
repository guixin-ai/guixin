# 客户端开发者

开始构建您自己的客户端，以与所有MCP服务器集成。

在本教程中，您将学习如何构建一个由LLM驱动的聊天机器人客户端，该客户端可以连接到MCP服务器。最好先完成服务器快速入门教程，该教程会指导您了解构建第一个服务器的基础知识。

## 系统要求

在开始之前，请确保您的系统满足以下要求：

* Mac或Windows计算机
* 安装了最新的Python版本
* 安装了最新版本的`uv`

## 设置您的环境

首先，使用`uv`创建一个新的Python项目：

```bash
# 创建项目目录
uv init mcp-client
cd mcp-client

# 创建虚拟环境
uv venv

# 激活虚拟环境
# 在Windows上：
.venv\Scripts\activate
# 在Unix或MacOS上：
source .venv/bin/activate

# 安装所需的包
uv add mcp anthropic python-dotenv

# 删除样板文件
rm hello.py

# 创建我们的主文件
touch client.py
```

## 设置您的API密钥

您需要从Anthropic控制台获取Anthropic API密钥。

创建一个`.env`文件来存储它：

```bash
# 创建.env文件
touch .env
```

将您的密钥添加到`.env`文件中：

```bash
ANTHROPIC_API_KEY=<在此处输入您的密钥>
```

将`.env`添加到您的`.gitignore`：

```bash
echo ".env" >> .gitignore
```

确保保持您的`ANTHROPIC_API_KEY`安全！

## 创建客户端

### 基本客户端结构

首先，让我们设置导入并创建基本客户端类：

```python
import asyncio
from typing import Optional
from contextlib import AsyncExitStack

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from anthropic import Anthropic
from dotenv import load_dotenv

load_dotenv()  # 从.env加载环境变量

class MCPClient:
    def __init__(self):
        # 初始化会话和客户端对象
        self.session: Optional[ClientSession] = None
        self.exit_stack = AsyncExitStack()
        self.anthropic = Anthropic()
    # 方法将在这里添加
```

### 服务器连接管理

接下来，我们将实现连接到MCP服务器的方法：

```python
async def connect_to_server(self, server_script_path: str):
    """连接到MCP服务器

    Args:
        server_script_path: 服务器脚本的路径（.py或.js）
    """
    is_python = server_script_path.endswith('.py')
    is_js = server_script_path.endswith('.js')
    if not (is_python or is_js):
        raise ValueError("服务器脚本必须是.py或.js文件")

    command = "python" if is_python else "node"
    server_params = StdioServerParameters(
        command=command,
        args=[server_script_path],
        env=None
    )

    stdio_transport = await self.exit_stack.enter_async_context(stdio_client(server_params))
    self.stdio, self.write = stdio_transport
    self.session = await self.exit_stack.enter_async_context(ClientSession(self.stdio, self.write))

    await self.session.initialize()

    # 列出可用工具
    response = await self.session.list_tools()
    tools = response.tools
    print("\n已连接到具有以下工具的服务器:", [tool.name for tool in tools])
```

### 查询处理逻辑

现在，让我们添加用于处理查询和处理工具调用的核心功能：

```python
async def process_query(self, query: str) -> str:
    """使用Claude和可用工具处理查询"""
    messages = [
        {
            "role": "user",
            "content": query
        }
    ]

    response = await self.session.list_tools()
    available_tools = [{
        "name": tool.name,
        "description": tool.description,
        "input_schema": tool.inputSchema
    } for tool in response.tools]

    # 初始Claude API调用
    response = self.anthropic.messages.create(
        model="claude-3-5-sonnet-20241022",
        max_tokens=1000,
        messages=messages,
        tools=available_tools
    )

    # 处理响应并处理工具调用
    final_text = []

    assistant_message_content = []
    for content in response.content:
        if content.type == 'text':
            final_text.append(content.text)
            assistant_message_content.append(content)
        elif content.type == 'tool_use':
            tool_name = content.name
            tool_args = content.input

            # 执行工具调用
            result = await self.session.call_tool(tool_name, tool_args)
            final_text.append(f"[调用工具 {tool_name}，参数为 {tool_args}]")

            assistant_message_content.append(content)
            messages.append({
                "role": "assistant",
                "content": assistant_message_content
            })
            messages.append({
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": content.id,
                        "content": result.content
                    }
                ]
            })

            # 从Claude获取下一个响应
            response = self.anthropic.messages.create(
                model="claude-3-5-sonnet-20241022",
                max_tokens=1000,
                messages=messages,
                tools=available_tools
            )

            final_text.append(response.content[0].text)

    return "\n".join(final_text)
```

### 交互式聊天界面

现在，我们将添加聊天循环和清理功能：

```python
async def chat_loop(self):
    """运行交互式聊天循环"""
    print("\nMCP客户端已启动！")
    print("输入您的查询或输入'quit'退出。")

    while True:
        try:
            query = input("\n查询: ").strip()

            if query.lower() == 'quit':
                break

            response = await self.process_query(query)
            print("\n" + response)

        except Exception as e:
            print(f"\n错误: {str(e)}")

async def cleanup(self):
    """清理资源"""
    await self.exit_stack.aclose()
```

### 主入口点

最后，我们将添加主执行逻辑：

```python
async def main():
    if len(sys.argv) < 2:
        print("用法: python client.py <服务器脚本路径>")
        sys.exit(1)

    client = MCPClient()
    try:
        await client.connect_to_server(sys.argv[1])
        await client.chat_loop()
    finally:
        await client.cleanup()

if __name__ == "__main__":
    import sys
    asyncio.run(main())
```

## 关键组件解释

### 1. 客户端初始化

* `MCPClient`类使用会话管理和API客户端初始化
* 使用`AsyncExitStack`进行适当的资源管理
* 配置Anthropic客户端以进行Claude交互

### 2. 服务器连接

* 支持Python和Node.js服务器
* 验证服务器脚本类型
* 设置适当的通信通道
* 初始化会话并列出可用工具

### 3. 查询处理

* 维护对话上下文
* 处理Claude的响应和工具调用
* 管理Claude和工具之间的消息流
* 将结果组合成连贯的响应

### 4. 交互式界面

* 提供简单的命令行界面
* 处理用户输入并显示响应
* 包括基本错误处理
* 允许优雅退出

### 5. 资源管理

* 适当清理资源
* 连接问题的错误处理
* 优雅关闭程序

## 常见自定义点

1. **工具处理**  
   * 修改`process_query()`以处理特定工具类型  
   * 为工具调用添加自定义错误处理  
   * 实现工具特定的响应格式化
2. **响应处理**  
   * 自定义工具结果的格式化方式  
   * 添加响应过滤或转换  
   * 实现自定义日志记录
3. **用户界面**  
   * 添加GUI或Web界面  
   * 实现丰富的控制台输出  
   * 添加命令历史记录或自动完成

## 运行客户端

要使用任何MCP服务器运行您的客户端：

```bash
uv run client.py path/to/server.py # python服务器
uv run client.py path/to/build/index.js # node服务器
```

如果您继续使用服务器快速入门中的天气教程，您的命令可能看起来像这样：`python client.py .../weather/src/weather/server.py`

客户端将：

1. 连接到指定的服务器
2. 列出可用工具
3. 启动交互式聊天会话，您可以：  
   * 输入查询  
   * 查看工具执行  
   * 获取Claude的响应

## 工作原理

当您提交查询时：

1. 客户端从服务器获取可用工具列表
2. 您的查询连同工具描述一起发送给Claude
3. Claude决定使用哪些工具（如果有）
4. 客户端通过服务器执行任何请求的工具调用
5. 结果发送回Claude
6. Claude提供自然语言响应
7. 响应显示给您

## 最佳实践

1. **错误处理**  
   * 始终在try-catch块中包装工具调用  
   * 提供有意义的错误消息  
   * 优雅地处理连接问题
2. **资源管理**  
   * 使用`AsyncExitStack`进行适当的清理  
   * 完成后关闭连接  
   * 处理服务器断开连接
3. **安全性**  
   * 在`.env`中安全存储API密钥  
   * 验证服务器响应  
   * 谨慎对待工具权限

## 故障排除

### 服务器路径问题

* 仔细检查服务器脚本的路径是否正确
* 如果相对路径不起作用，请使用绝对路径
* 对于Windows用户，确保在路径中使用正斜杠(/)或转义的反斜杠(\\)
* 验证服务器文件具有正确的扩展名（.py表示Python或.js表示Node.js）

正确路径使用的示例：

```bash
# 相对路径
uv run client.py ./server/weather.py

# 绝对路径
uv run client.py /Users/username/projects/mcp-server/weather.py

# Windows路径（两种格式都有效）
uv run client.py C:/projects/mcp-server/weather.py
uv run client.py C:\\projects\\mcp-server\\weather.py
```

### 响应时间

* 第一个响应可能需要长达30秒的时间
* 这是正常的，发生在：  
   * 服务器初始化  
   * Claude处理查询  
   * 工具正在执行
* 后续响应通常更快
* 在初始等待期间不要中断进程

### 常见错误消息

如果您看到：

* `FileNotFoundError`：检查您的服务器路径
* `Connection refused`：确保服务器正在运行并且路径正确
* `Tool execution failed`：验证工具所需的环境变量已设置
* `Timeout error`：考虑在客户端配置中增加超时时间

## 下一步

查看我们的官方MCP服务器和实现示例库。查看支持MCP集成的客户端列表。了解如何使用像Claude这样的LLM加速您的MCP开发。了解MCP如何连接客户端、服务器和LLM。

## 给小朋友的解释

想象一下，你正在制作一个特殊的电话📱，这个电话可以连接到不同的魔法工具箱🧰！

**什么是MCP客户端？**就像是一个神奇的电话，可以和Claude（一个聪明的AI助手）交谈，还能连接到各种魔法工具箱（MCP服务器）来帮助Claude了解更多信息。

在这个教程中，我们会像搭建积木一样，一步步创建这个神奇的电话：

1. 首先，我们需要收集所有的零件（安装工具和创建文件）
2. 然后，我们会写一些魔法咒语（代码），让我们的电话能够：
   - 连接到各种不同的魔法工具箱
   - 向Claude传递我们的问题
   - 告诉Claude可以使用哪些魔法工具
   - 帮助Claude使用这些工具

3. 最后，我们会创建一个简单的对话界面，这样你就可以直接通过这个神奇的电话和Claude聊天了！

当你通过这个电话问问题时，发生了这些神奇的事情：
1. 电话先检查连接了哪些魔法工具箱
2. 然后把你的问题和可用的工具告诉Claude
3. Claude决定是否需要使用某些工具
4. 如果需要使用工具，电话会帮助Claude打开工具箱并使用工具
5. 工具找到的信息会回传给Claude
6. Claude思考后给你一个聪明的回答

如果电话出了问题（比如连接不上工具箱），我们还学习了如何当小修理工👨‍🔧，找出问题并修复它！

通过这个神奇的项目，你可以创建一个强大的通信工具，让Claude变得更加聪明和有用！✨ 
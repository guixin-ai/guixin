# 服务端开发者

开始构建您自己的服务器，以在Claude桌面应用和其他客户端中使用。

在本教程中，我们将构建一个简单的MCP天气服务器并将其连接到Claude桌面应用程序。我们将从基本设置开始，然后逐步深入到更复杂的用例。

### 我们将构建什么

许多大型语言模型目前还没有获取天气预报和严重天气警报的能力。让我们使用MCP来解决这个问题！

我们将构建一个服务器，提供两个工具：`get-alerts`和`get-forecast`。然后，我们将服务器连接到MCP主机（在本例中是Claude桌面应用）。

服务器可以连接到任何客户端。我们在这里选择Claude桌面应用是为了简单起见，但我们也有关于构建自己的客户端的指南以及其他客户端列表。

为什么是Claude桌面应用而不是Claude.ai？

因为服务器是本地运行的，MCP目前只支持桌面主机。远程主机正在积极开发中。

### MCP核心概念

MCP服务器可以提供三种主要类型的功能：

1. **资源**：客户端可以读取的类文件数据（如API响应或文件内容）
2. **工具**：可以由LLM调用的函数（需要用户批准）
3. **提示**：帮助用户完成特定任务的预先编写的模板

本教程将主要关注工具。

让我们开始构建我们的天气服务器！您可以在此处找到我们将要构建的完整代码。

### 前提知识

此快速入门假设您熟悉：

* Python
* 类似Claude的大型语言模型

### 系统要求

* 安装Python 3.10或更高版本。
* 您必须使用Python MCP SDK 1.2.0或更高版本。

### 设置您的环境

首先，让我们安装`uv`并设置我们的Python项目和环境：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

确保之后重启您的终端，以确保`uv`命令被正确识别。

现在，让我们创建并设置我们的项目：

```bash
# 为我们的项目创建一个新目录
uv init weather
cd weather

# 创建虚拟环境并激活它
uv venv
source .venv/bin/activate

# 安装依赖
uv add "mcp[cli]" httpx

# 创建我们的服务器文件
touch weather.py
```

现在让我们深入构建您的服务器。

## 构建您的服务器

### 导入包并设置实例

将这些添加到您的`weather.py`的顶部：

```python
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

# 初始化FastMCP服务器
mcp = FastMCP("weather")

# 常量
NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"
```

FastMCP类使用Python类型提示和文档字符串自动生成工具定义，使创建和维护MCP工具变得容易。

### 辅助函数

接下来，让我们添加辅助函数来查询和格式化来自国家气象服务API的数据：

```python
async def make_nws_request(url: str) -> dict[str, Any] | None:
    """带有适当错误处理的NWS API请求。"""
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/geo+json"
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, headers=headers, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception:
            return None

def format_alert(feature: dict) -> str:
    """将警报特性格式化为可读字符串。"""
    props = feature["properties"]
    return f"""
事件: {props.get('event', '未知')}
区域: {props.get('areaDesc', '未知')}
严重程度: {props.get('severity', '未知')}
描述: {props.get('description', '无可用描述')}
指示: {props.get('instruction', '未提供具体指示')}
"""
```

### 实现工具执行

工具执行处理程序负责实际执行每个工具的逻辑。让我们添加它：

```python
@mcp.tool()
async def get_alerts(state: str) -> str:
    """获取美国州的天气警报。

    Args:
        state: 两个字母的美国州代码（例如CA，NY）
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)

    if not data or "features" not in data:
        return "无法获取警报或未找到警报。"

    if not data["features"]:
        return "该州没有活动警报。"

    alerts = [format_alert(feature) for feature in data["features"]]
    return "\n---\n".join(alerts)

@mcp.tool()
async def get_forecast(latitude: float, longitude: float) -> str:
    """获取位置的天气预报。

    Args:
        latitude: 位置的纬度
        longitude: 位置的经度
    """
    # 首先获取预报网格端点
    points_url = f"{NWS_API_BASE}/points/{latitude},{longitude}"
    points_data = await make_nws_request(points_url)

    if not points_data:
        return "无法获取此位置的预报数据。"

    # 从点响应获取预报URL
    forecast_url = points_data["properties"]["forecast"]
    forecast_data = await make_nws_request(forecast_url)

    if not forecast_data:
        return "无法获取详细预报。"

    # 将时段格式化为可读的预报
    periods = forecast_data["properties"]["periods"]
    forecasts = []
    for period in periods[:5]:  # 只显示接下来的5个时段
        forecast = f"""
{period['name']}:
温度: {period['temperature']}°{period['temperatureUnit']}
风: {period['windSpeed']} {period['windDirection']}
预报: {period['detailedForecast']}
"""
        forecasts.append(forecast)

    return "\n---\n".join(forecasts)
```

### 运行服务器

最后，让我们初始化并运行服务器：

```python
if __name__ == "__main__":
    # 初始化并运行服务器
    mcp.run(transport='stdio')
```

您的服务器已完成！运行`uv run weather.py`确认一切正常工作。

现在让我们使用Claude桌面应用测试您的服务器。

## 使用Claude桌面应用测试您的服务器

Claude桌面应用在Linux上尚不可用。Linux用户可以前往"构建客户端"教程，构建连接到我们刚刚构建的服务器的MCP客户端。

首先，确保您已安装Claude桌面应用。您可以在此处安装最新版本。如果您已经有Claude桌面应用，**确保将其更新到最新版本。**

我们需要为您想使用的任何MCP服务器配置Claude桌面应用。为此，请在文本编辑器中打开Claude桌面应用配置文件`~/Library/Application Support/Claude/claude_desktop_config.json`。如果该文件不存在，请创建它。

例如，如果您安装了VS Code：

```bash
code ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

然后，您将在`mcpServers`键中添加您的服务器。只有在至少一个服务器正确配置的情况下，MCP UI元素才会显示在Claude桌面应用中。

在这种情况下，我们将添加我们的单个天气服务器，如下所示：

```json
{
    "mcpServers": {
        "weather": {
            "command": "uv",
            "args": [
                "--directory",
                "/ABSOLUTE/PATH/TO/PARENT/FOLDER/weather",
                "run",
                "weather.py"
            ]
        }
    }
}
```

您可能需要在`command`字段中填入`uv`可执行文件的完整路径。您可以通过在MacOS/Linux上运行`which uv`或在Windows上运行`where uv`获取此信息。

确保传入您服务器的绝对路径。

这告诉Claude桌面应用：

1. 有一个名为"weather"的MCP服务器
2. 通过运行`uv --directory /ABSOLUTE/PATH/TO/PARENT/FOLDER/weather run weather.py`来启动它

保存文件，并重启**Claude桌面应用**。

### 使用命令测试

让我们确保Claude桌面应用能够识别我们在`weather`服务器中暴露的两个工具。您可以通过查找锤子图标来完成此操作：

点击锤子图标后，您应该看到列出的两个工具：

如果您的服务器未被Claude桌面应用识别，请前往故障排除部分获取调试提示。

如果锤子图标已显示，您现在可以通过在Claude桌面应用中运行以下命令来测试您的服务器：

* 萨克拉门托的天气如何？
* 德克萨斯州有哪些活动的天气警报？

由于这是美国国家气象服务，查询只对美国地点有效。

## 幕后发生的事情

当您提出问题时：

1. 客户端将您的问题发送给Claude
2. Claude分析可用的工具并决定使用哪个工具
3. 客户端通过MCP服务器执行所选工具
4. 结果被发送回Claude
5. Claude制定自然语言响应
6. 响应显示给您！

## 故障排除

Claude桌面应用集成问题

**从Claude桌面应用获取日志**

与MCP相关的Claude.app日志写入`~/Library/Logs/Claude`中的日志文件：

* `mcp.log`将包含有关MCP连接和连接失败的一般日志。
* 名为`mcp-server-SERVERNAME.log`的文件将包含来自命名服务器的错误（stderr）日志。

您可以运行以下命令列出最近的日志并跟踪任何新日志：

```bash
# 检查Claude的日志是否有错误
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

**服务器在Claude中未显示**

1. 检查您的`claude_desktop_config.json`文件语法
2. 确保项目的路径是绝对路径而不是相对路径
3. 完全重启Claude桌面应用

**工具调用静默失败**

如果Claude尝试使用工具但它们失败：

1. 检查Claude的日志是否有错误
2. 验证您的服务器构建和运行没有错误
3. 尝试重启Claude桌面应用

**这些都不起作用。我该怎么办？**

请参阅我们的调试指南，以获取更好的调试工具和更详细的指导。

天气API问题

**错误：无法检索网格点数据**

这通常意味着：

1. 坐标在美国境外
2. NWS API出现问题
3. 您受到速率限制

解决方法：

* 验证您使用的是美国坐标
* 在请求之间添加小延迟
* 检查NWS API状态页面

**错误：[STATE]没有活动警报**

这不是错误 - 这只是意味着该州目前没有天气警报。尝试不同的州或在恶劣天气期间检查。

更高级的故障排除，请查看我们的MCP调试指南

## 下一步

学习如何构建自己的MCP客户端，可以连接到您的服务器。查看我们的官方MCP服务器和实现示例库。了解如何有效地调试MCP服务器和集成。了解如何使用像Claude这样的LLM加速您的MCP开发。

## 给小朋友的解释

想象一下，你正在建造一个神奇的机器人助手👨‍🔧，这个助手可以告诉人们天气情况！

**什么是MCP服务器？**就像是一座神奇的桥梁，让Claude（一个聪明的AI朋友）能够了解外面的天气🌦️。

在这个教程中，我们会像搭积木一样，一步步建造这座桥梁：

1. 首先，我们需要准备好所有的积木（安装工具和创建文件）
2. 然后，我们会写一些魔法咒语（代码），让我们的桥梁能够：
   - 查看某个地方会不会有暴风雨或者洪水（天气警报）
   - 告诉人们明天是否需要带伞（天气预报）

3. 最后，我们会把这座桥梁连接到Claude的房子（Claude桌面应用），这样当有人问Claude"今天会下雨吗？"时，Claude就能穿过这座桥梁，查看天气，然后告诉人们答案！

当有人问天气问题时，发生了这些神奇的事情：
1. 问题先到达Claude
2. Claude决定需要使用天气工具
3. 消息穿过我们建造的桥梁
4. 桥梁找到天气信息
5. 信息返回给Claude
6. Claude用简单的话告诉人们天气情况

如果桥梁出了问题（比如不能正常工作），我们还学习了如何当小侦探🕵️‍♂️，找出问题所在并修复它！

通过这个魔法项目，你就能让Claude变得更聪明，知道更多关于外面世界的事情！✨ 
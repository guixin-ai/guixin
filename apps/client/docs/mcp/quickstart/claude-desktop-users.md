# Claude桌面用户

开始在Claude桌面应用中使用预构建的服务器。

在本教程中，您将扩展Claude桌面应用，使其能够读取计算机文件系统、编写新文件、移动文件，甚至搜索文件。

不用担心 — 在执行这些操作之前，它会征求您的许可！

## 1. 下载Claude桌面

首先下载Claude桌面应用，选择macOS或Windows版本。（Claude桌面应用目前不支持Linux。）

按照安装说明进行操作。

如果您已经安装了Claude桌面应用，请确保它是最新版本，方法是点击计算机上的Claude菜单并选择"检查更新..."

为什么是Claude桌面应用而不是Claude.ai？

因为服务器是本地运行的，MCP目前只支持桌面主机。远程主机正在积极开发中。

## 2. 添加文件系统MCP服务器

要添加此文件系统功能，我们将在Claude桌面应用中安装预构建的文件系统MCP服务器。这是Anthropic和社区创建的数十个服务器之一。

首先打开计算机上的Claude菜单，选择"设置..."。请注意，这些不是应用窗口本身中的Claude账户设置。

在Mac上，它应该是这样的：

点击设置窗格左侧栏中的"开发者"，然后点击"编辑配置"：

如果您还没有配置文件，这将在以下位置创建一个配置文件：

* macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
* Windows: `%APPDATA%\Claude\claude_desktop_config.json`

并在文件系统中显示该文件。

在任何文本编辑器中打开配置文件。用以下内容替换文件内容：

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/用户名/Desktop",
        "/Users/用户名/Downloads"
      ]
    }
  }
}
```

确保将"用户名"替换为您计算机的用户名。路径应指向您希望Claude能够访问和修改的有效目录。默认设置适用于桌面和下载文件夹，但您也可以添加更多路径。

您还需要在计算机上安装Node.js才能正常运行。要验证是否已安装Node，请打开计算机上的命令行。

* 在macOS上，从应用程序文件夹打开终端
* 在Windows上，按Windows + R，输入"cmd"，然后按Enter

进入命令行后，通过输入以下命令验证是否已安装Node：

```bash
node --version
```

如果出现"command not found"或"node is not recognized"错误，请从nodejs.org下载Node。

**配置文件是如何工作的？**

此配置文件告诉Claude桌面应用在每次启动应用程序时启动哪些MCP服务器。在这种情况下，我们添加了一个名为"filesystem"的服务器，它将使用Node的`npx`命令安装并运行`@modelcontextprotocol/server-filesystem`。这个服务器将允许您在Claude桌面应用中访问文件系统。

**命令权限**

Claude桌面应用将以您的用户账户的权限运行配置文件中的命令，并访问您的本地文件。仅添加您理解并信任来源的命令。

## 3. 重启Claude

更新配置文件后，您需要重启Claude桌面应用。

重启后，您应该在输入框的右下角看到一个锤子图标：

点击锤子图标后，您应该看到随文件系统MCP服务器一起提供的工具：

如果Claude桌面应用未检测到您的服务器，请参阅故障排除部分获取调试提示。

## 4. 尝试使用！

现在您可以与Claude交谈并询问有关文件系统的问题。它应该知道何时调用相关工具。

您可以尝试询问Claude的问题：

* 你能写一首诗并保存到我的桌面吗？
* 我的下载文件夹中有哪些与工作相关的文件？
* 你能把我桌面上的所有图片移动到一个名为"图片"的新文件夹吗？

根据需要，Claude将调用相关工具并在采取行动前征求您的批准：

## 故障排除

服务器未在Claude中显示/锤子图标缺失

1. 完全重启Claude桌面应用
2. 检查您的`claude_desktop_config.json`文件语法
3. 确保`claude_desktop_config.json`中包含的文件路径有效，并且是绝对路径而非相对路径
4. 查看日志以了解为什么服务器未连接
5. 在命令行中，尝试手动运行服务器（替换您在`claude_desktop_config.json`中使用的"用户名"）以查看是否出现任何错误：

```bash
npx -y @modelcontextprotocol/server-filesystem /Users/用户名/Desktop /Users/用户名/Downloads
```

从Claude桌面应用获取日志

与MCP相关的Claude.app日志写入以下位置的日志文件：

* macOS: `~/Library/Logs/Claude`
* Windows: `%APPDATA%\Claude\logs`
* `mcp.log`将包含有关MCP连接和连接失败的一般日志。
* 名为`mcp-server-SERVERNAME.log`的文件将包含来自命名服务器的错误（stderr）日志。

您可以运行以下命令列出最近的日志并跟踪任何新日志（在Windows上，它只会显示最近的日志）：

```bash
# 检查Claude的日志是否有错误
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

工具调用静默失败

如果Claude尝试使用工具但它们失败：

1. 检查Claude的日志是否有错误
2. 验证您的服务器构建和运行没有错误
3. 尝试重启Claude桌面应用

这些都不起作用。我该怎么办？

请参阅我们的调试指南，以获取更好的调试工具和更详细的指导。

Windows上的ENOENT错误和路径中的`${APPDATA}`

如果您配置的服务器无法加载，并且在其日志中看到引用路径中`${APPDATA}`的错误，您可能需要在`claude_desktop_config.json`的`env`键中添加`%APPDATA%`的展开值：

```json
{
  "brave-search": {
    "command": "npx",
    "args": ["-y", "@modelcontextprotocol/server-brave-search"],
    "env": {
      "APPDATA": "C:\\Users\\user\\AppData\\Roaming\\",
      "BRAVE_API_KEY": "..."
    }
  }
}
```

进行此更改后，再次启动Claude桌面应用。

**应全局安装NPM**

如果您尚未全局安装NPM，`npx`命令可能会继续失败。如果已全局安装NPM，您的系统上将存在`%APPDATA%\npm`。如果没有，您可以通过运行以下命令全局安装NPM：

```bash
npm install -g npm
```

## 下一步

探索其他服务器：查看我们的官方MCP服务器和实现示例库。
构建您自己的服务器：现在构建您自己的自定义服务器，以在Claude桌面应用和其他客户端中使用。

## 给小朋友的解释

想象一下，Claude是一个很聪明的机器人朋友👨‍🚀，但是它有时候看不到你电脑里的东西，就像是戴着眼罩一样。

**什么是MCP服务器？**这就像是给Claude戴上特殊的魔法眼镜👓，让它能够看到并帮助你处理电脑里的文件和文件夹！

在这个教程中，我们会教Claude如何：
1. 读取你电脑上的文件（就像是学会阅读你的故事书📚）
2. 创建新的文件（就像是画新的图画🎨）
3. 移动文件（就像是整理你的玩具箱🧸）
4. 搜索文件（就像是寻宝游戏🔍）

但是别担心，Claude是个有礼貌的机器人！在它碰你的任何文件之前，它总是会先问你："我可以这样做吗？"，你说"好"它才会行动。

如何给Claude戴上这副魔法眼镜：
1. 首先，我们需要下载并安装Claude（就像是把机器人朋友请到家里）
2. 然后，我们告诉Claude在哪里可以找到魔法眼镜（通过写一个特殊的纸条给它）
3. 重新启动Claude（就像是让机器人小睡一会儿再醒来）
4. 醒来后，Claude就能看到你的文件了！

你可以尝试让Claude做这些事：
- "请把我今天的冒险故事写下来，保存在桌面上"
- "帮我找找我下载文件夹里的所有图片"
- "把我桌面上的所有音乐文件整理到一个新文件夹里"

如果魔法眼镜出了问题（不能正常工作），我们还学习了如何当小修理工🔧，找出问题并修复它！

有了这副魔法眼镜，Claude就变成了一个更加有用的机器人助手，可以帮你完成更多有趣的任务！✨ 
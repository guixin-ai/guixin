# 安装配置 Ollama

在硅信中使用本地大语言模型前，您需要先安装并配置 Ollama。本指南将帮助您完成从零开始的 Ollama 设置。

## 安装 Ollama

### Windows 系统安装

1. 访问 [Ollama 官网](https://ollama.ai/download/windows) 下载最新版 Windows 安装包
2. 双击下载的 `.exe` 文件运行安装程序
3. 按照安装向导提示完成安装
4. 安装完成后，Ollama 会自动在后台运行，并在系统托盘显示图标

### macOS 系统安装

1. 访问 [Ollama 官网](https://ollama.ai/download/mac) 下载最新版 macOS 安装包
2. 打开下载的 `.dmg` 文件
3. 将 Ollama 拖拽到应用程序文件夹
4. 从应用程序文件夹或 Launchpad 启动 Ollama
5. 首次启动时，可能需要授权访问权限

### Linux 系统安装

使用官方安装脚本安装：

```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

或参考 [Ollama GitHub 页面](https://github.com/ollama/ollama) 获取更多 Linux 安装选项。

## 验证安装

安装完成后，Ollama 会自动以服务形式在后台运行。您可以通过以下方式验证安装是否成功：

1. 打开浏览器，访问 [:globe_with_meridians: http://localhost:11434](http://localhost:11434)
2. 如果看到 Ollama 的欢迎信息，表示服务已成功运行

## 在硅信中查看 Ollama

1. 打开硅信应用
2. 进入"设置" > "Ollama 本地模型管理"

在此页面可实时查看服务状态：

- :green_circle: 在线：服务正常运行
- :red_circle: 离线：服务未运行或无法连接

## 故障排除

如果 Ollama 服务无法正常启动，请尝试：

1. 重新安装 Ollama
2. 检查系统是否满足最低要求（4GB 内存，2GB 磁盘空间）
3. 检查是否有其他程序占用 11434 端口

## 下一步

Ollama 安装配置完成后，您可以：

1. [下载模型](/ollama/download) - 获取适合您需求的模型
2. [管理模型](/ollama/manage) - 查看和管理已安装模型

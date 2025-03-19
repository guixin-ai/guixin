# 安装指南

本指南将详细介绍如何在不同平台上安装和配置硅信应用。

## Windows 安装

### 系统要求

- Windows 10/11 (64位)
- 4GB RAM 以上
- 500MB 可用磁盘空间

### 安装步骤

1. 从[官方网站](https://硅信.com/download)下载最新的 Windows 安装包
2. 双击下载的 `.exe` 文件启动安装程序
3. 按照安装向导的提示完成安装
4. 安装完成后，从开始菜单或桌面快捷方式启动硅信

## macOS 安装

### 系统要求

- macOS 10.15 (Catalina) 或更高版本
- 4GB RAM 以上
- 500MB 可用磁盘空间

### 安装步骤

1. 从[官方网站](https://硅信.com/download)下载最新的 macOS 安装包
2. 打开下载的 `.dmg` 文件
3. 将硅信应用拖动到应用程序文件夹
4. 从启动台或应用程序文件夹启动硅信

## Linux 安装

### 系统要求

- Ubuntu 20.04+, Debian 10+, Fedora 34+ 或其他主流发行版
- 4GB RAM 以上
- 500MB 可用磁盘空间

### 安装步骤

#### Debian/Ubuntu

```bash
# 添加硅信软件源
curl -s https://硅信.com/linux/debian.gpg | sudo apt-key add -
echo "deb [arch=amd64] https://硅信.com/linux/debian stable main" | sudo tee /etc/apt/sources.list.d/guixin.list

# 更新软件包列表并安装
sudo apt update
sudo apt install guixin
```

#### Fedora/RHEL

```bash
# 添加硅信软件源
sudo rpm --import https://硅信.com/linux/rpm.gpg
sudo dnf config-manager --add-repo https://硅信.com/linux/guixin.repo

# 安装
sudo dnf install guixin
```

## 移动设备安装

### iOS

1. 在 App Store 中搜索"硅信"
2. 点击"获取"按钮下载并安装
3. 安装完成后，点击应用图标启动

### Android

1. 在 Google Play 商店中搜索"硅信"
2. 点击"安装"按钮下载并安装
3. 或者从[官方网站](https://硅信.com/download)下载 APK 文件直接安装
4. 安装完成后，点击应用图标启动

## 企业部署

对于企业用户，我们提供了更多部署选项：

- **企业服务器部署**：可以在企业内部服务器上部署硅信服务
- **私有云部署**：支持在私有云环境中部署
- **定制化部署**：根据企业需求提供定制化的部署方案

详情请联系我们的[企业支持团队](/support/contact)。

## 常见问题

如果在安装过程中遇到问题，请查看[常见问题](/faq)页面或联系[技术支持](/support/contact)。

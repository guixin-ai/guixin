# API工具配置

本页面详细介绍如何在硅信平台上配置和使用API工具，让您的智能联系人能够连接和使用外部服务。

## API工具概述

API工具允许智能联系人通过HTTP/HTTPS请求与外部服务和系统进行交互，极大地扩展了联系人的能力范围。通过API工具，您可以：

- 连接第三方服务和平台
- 获取实时数据和信息
- 在外部系统中执行操作
- 整合专业服务功能
- 构建定制化解决方案

## 创建API工具

### 基本步骤

1. 进入硅信平台的"智能工具"部分
2. 选择"创建自定义工具" > "API工具"
3. 填写基本信息：
   - 工具名称：简洁明了的名称
   - 描述：详细说明工具功能和用途
   - 图标：选择合适的图标（可选）
4. 进入API配置界面

### API配置详情

设置API请求的核心参数：

#### 请求基本设置

1. **请求URL**：

   - 输入API的完整URL
   - 支持使用变量：`https://api.example.com/data/{variable}`
   - 可配置基础URL和路径分离

2. **请求方法**：

   - GET：获取数据
   - POST：创建或提交数据
   - PUT：更新数据
   - DELETE：删除数据
   - PATCH：部分更新数据
   - OPTIONS：获取支持的操作信息
   - HEAD：只获取头信息

3. **超时设置**：
   - 设置请求超时时间（秒）
   - 默认为30秒

#### 请求头配置

添加HTTP请求头信息：

1. **内容类型**：

   - Content-Type: application/json
   - Content-Type: application/x-www-form-urlencoded
   - Content-Type: multipart/form-data

2. **认证头**：

   - Authorization: Bearer {token}
   - Authorization: Basic {credentials}
   - X-API-Key: {apikey}

3. **自定义头**：
   - 添加其他所需的HTTP头信息
   - 支持使用变量和表达式

#### 请求参数

根据请求方法配置参数：

1. **查询参数**：

   - 适用于GET请求或其他方法的URL参数
   - 参数名称和值的键值对
   - 支持默认值和动态参数

2. **请求体**：

   - 适用于POST、PUT、PATCH请求
   - JSON格式：结构化数据
   - 表单格式：键值对数据
   - 文本格式：纯文本内容
   - 二进制格式：文件上传

3. **路径参数**：
   - URL路径中的动态部分
   - 在URL中使用`{parameter}`标记

#### 认证配置

设置API认证方式：

1. **无认证**：

   - 适用于公开API

2. **API密钥**：

   - 在URL参数或请求头中添加密钥
   - 密钥名称和值配置
   - 密钥位置：请求头、查询参数或请求体

3. **基本认证**：

   - 用户名和密码组合
   - 自动编码为Base64格式

4. **OAuth 2.0**：

   - 客户端ID和密钥
   - 授权URL和令牌URL
   - 授权流程类型
   - 令牌刷新设置

5. **自定义认证**：
   - 自定义认证参数和位置
   - 支持预处理脚本

### 响应处理配置

设置如何处理API返回的响应：

1. **响应格式**：

   - JSON：自动解析JSON响应
   - XML：解析并转换XML为结构化数据
   - 文本：原始文本处理
   - 二进制：文件和二进制数据

2. **响应解析**：

   - 使用JSONPath或XPath提取数据
   - 结果映射和转换
   - 条件处理不同状态码

3. **错误处理**：
   - 定义错误识别条件
   - 自定义错误消息
   - 重试策略配置

### 参数定义

定义联系人调用此工具时需提供的参数：

1. **参数属性**：

   - 名称：参数的标识符
   - 类型：参数的数据类型
   - 描述：参数的详细说明
   - 必需：是否为必填参数
   - 默认值：未提供时的默认值

2. **参数验证**：

   - 范围检查：数值范围限制
   - 格式验证：如Email、URL、日期格式
   - 枚举值：预定义的可选值列表
   - 自定义验证规则

3. **参数映射**：
   - 定义参数如何映射到API请求
   - 支持多参数组合和转换
   - 条件逻辑和格式转换

## API工具类型示例

### 天气API工具

获取特定城市的天气信息：

```
名称：城市天气查询
URL：https://api.weather.com/forecast
方法：GET
参数：
  - city（城市名，必需）
  - days（预报天数，可选，默认3）
响应处理：
  - 提取温度、湿度、天气状况
  - 格式化为易读文本
```

### 股票查询工具

查询股票价格和市场信息：

```
名称：股票市场查询
URL：https://api.finance.com/stocks/{symbol}
方法：GET
参数：
  - symbol（股票代码，必需）
  - fields（需要的字段，可选，默认"price,change,volume"）
认证：
  - API密钥（请求头：X-API-Key）
响应处理：
  - 提取当前价格、涨跌幅、交易量
  - 计算关键指标
  - 格式化为结构化数据
```

### 内容翻译工具

翻译文本内容到不同语言：

```
名称：文本翻译
URL：https://api.translate.com/v2/translate
方法：POST
参数：
  - text（要翻译的文本，必需）
  - source（源语言，可选，默认自动检测）
  - target（目标语言，必需）
请求体：
  - JSON格式
  - {"text":"[text]","source":"[source]","target":"[target]"}
响应处理：
  - 提取翻译结果
  - 可能的错误和建议处理
```

### 新闻搜索工具

搜索新闻文章和报道：

```
名称：新闻搜索
URL：https://api.news.com/search
方法：GET
参数：
  - query（搜索关键词，必需）
  - category（新闻类别，可选）
  - date（日期范围，可选，格式"YYYY-MM-DD,YYYY-MM-DD"）
  - limit（结果数量，可选，默认10）
认证：
  - OAuth 2.0
响应处理：
  - 提取标题、来源、日期、摘要
  - 生成结果列表
  - 处理分页信息
```

## 安全最佳实践

### API密钥管理

保护您的API凭据安全：

1. **安全存储**：

   - 平台使用加密方式存储API密钥
   - 避免在工具描述或参数中暴露密钥

2. **权限限制**：

   - 为API工具设置"询问后使用"或"仅指令使用"权限
   - 限制可使用该工具的联系人范围

3. **密钥轮换**：
   - 定期更新API密钥
   - 支持无缝密钥轮换，不影响工具使用

### 数据安全

保护通过API传输的数据：

1. **仅HTTPS**：

   - 只允许使用HTTPS加密连接
   - 拒绝不安全的HTTP请求

2. **数据过滤**：

   - 在响应处理中过滤敏感信息
   - 限制返回给联系人的数据范围

3. **参数验证**：
   - 严格验证用户提供的参数
   - 防止注入攻击和恶意输入

### 访问控制

控制API工具的访问范围：

1. **IP限制**：

   - 配置允许访问API的IP范围
   - 记录和监控访问位置

2. **使用频率限制**：

   - 设置每日或每小时请求限制
   - 监控异常使用模式

3. **功能限制**：
   - 仅开放必要的API功能
   - 限制可执行的操作类型

## 高级功能

### 预处理脚本

在发送请求前处理参数和数据：

```javascript
// 示例：将多个参数组合为一个查询字符串
function preprocessRequest(params) {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}:${value}`)
    .join(' AND ');

  return {
    ...params,
    combinedQuery: query,
  };
}
```

### 后处理脚本

处理API响应结果：

```javascript
// 示例：格式化天气响应
function postprocessResponse(response) {
  const data = response.data;

  return {
    current: {
      temperature: `${data.current.temp_c}°C (${data.current.temp_f}°F)`,
      condition: data.current.condition.text,
      humidity: `${data.current.humidity}%`,
      wind: `${data.current.wind_kph} km/h, ${data.current.wind_dir}`,
    },
    forecast: data.forecast.forecastday.map(day => ({
      date: day.date,
      maxTemp: `${day.day.maxtemp_c}°C`,
      minTemp: `${day.day.mintemp_c}°C`,
      condition: day.day.condition.text,
    })),
  };
}
```

### 条件请求

根据条件动态调整请求：

```javascript
// 示例：基于参数选择不同端点
function determineEndpoint(params) {
  if (params.type === 'historical') {
    return 'https://api.example.com/historical';
  } else if (params.type === 'forecast') {
    return 'https://api.example.com/forecast';
  } else {
    return 'https://api.example.com/current';
  }
}
```

### 链式API调用

配置多个连续API调用：

1. **主从调用**：

   - 第一个API调用的结果作为第二个调用的输入
   - 支持条件分支和错误处理

2. **并行调用**：

   - 同时执行多个API请求
   - 合并结果为单一响应

3. **聚合调用**：
   - 从多个API获取数据
   - 组合和处理来自不同来源的信息

## 测试与调试

### 测试工具

在配置过程中测试API工具：

1. **请求测试**：

   - 输入测试参数值
   - 执行请求并查看完整响应
   - 验证响应处理结果

2. **参数测试**：

   - 测试不同参数组合
   - 验证参数验证规则
   - 测试默认值和可选参数

3. **错误测试**：
   - 模拟错误条件
   - 验证错误处理机制
   - 测试重试功能

### 调试功能

问题排查工具：

1. **请求日志**：

   - 查看发送的完整请求详情
   - 包括URL、头信息、参数和请求体

2. **响应日志**：

   - 查看原始API响应
   - 包括状态码、头信息和响应体

3. **执行追踪**：
   - 跟踪请求处理的每个步骤
   - 查看参数转换和脚本执行过程

## 使用实例

### 联系人使用API工具

配置好API工具后，智能联系人可以通过以下方式使用：

1. **自然对话**：

   ```
   用户：今天北京的天气怎么样？

   联系人：[使用天气API工具]
   根据最新天气数据，北京今天多云，气温23°C，湿度45%，东北风3级。
   ```

2. **明确指令**：

   ```
   用户：请使用股票查询工具查看苹果公司的股票价格。

   联系人：[使用股票API工具]
   苹果公司(AAPL)当前股价为148.32美元，较昨日上涨2.15(1.47%)，今日交易量为5840万股。
   ```

3. **复杂查询**：

   ```
   用户：找一下最近关于人工智能在医疗领域的新闻报道。

   联系人：我将使用新闻搜索API查找相关信息。
   [使用新闻API工具]

   以下是近期关于人工智能在医疗领域的主要新闻：
   1. "AI系统在早期癌症检测中取得突破" - 科技时报，2天前
   2. "医院采用人工智能辅助诊断系统" - 健康报道，5天前
   ...
   ```

## 问题排查

### 常见问题与解决方案

1. **API连接失败**：

   - 检查API URL是否正确
   - 验证网络连接和防火墙设置
   - 确认API服务是否可用

2. **认证错误**：

   - 验证API密钥或凭据是否正确
   - 检查认证方式配置
   - 确认API密钥未过期

3. **参数错误**：

   - 检查必需参数是否提供
   - 验证参数格式和类型
   - 确认特殊字符已正确编码

4. **响应解析错误**：
   - 检查响应格式配置
   - 验证JSONPath或XPath表达式
   - 检查API响应结构是否变更

## 下一步

- 了解[内置工具](/tools/built-in)的功能和特性
- 探索[工作流编排](/tools/workflows/)与API工具集成
- 设置[工具权限](/tools/permissions)确保API安全使用
- 了解如何创建其他类型的[自定义工具](/tools/custom)
- 配置[联系人调用工作流](/tools/workflows/contact-integration)与API工具交互

# 前端架构分层设计文档

## 概述

本文档描述了我们项目中采用的前端架构分层设计，明确每一层的职责范围、应该做什么和不应该做什么，以便团队成员在开发过程中能够遵循一致的架构原则。前端架构分层的目的是实现关注点分离，提高代码的可维护性、可测试性和复用性。

## 分层架构图

```
+------------------------+     +------------------------+
|       模型层           |<----|       组件层           |
|    (Model Layer)       |     |   (Component Layer)    |
+------------------------+     |                        |
                               |                        |
                               |                        |
                               +------------------------+
                                          |
                                          v
                               +------------------------+
                               |       服务层           |
                               |   (Service Layer)      |
                               +------------------------+
                                          |
                                          v
                               +------------------------+
                               |       指令层           |
                               |   (Command Layer)      |
                               +------------------------+
```

## 详细分层说明

### 1. 组件层 (Component Layer)

#### 职责：
- 构建用户界面
- 处理用户交互
- 管理组件内部状态
- **协调模型层和服务层** (核心协调职责)
- 实现页面路由和导航
- 处理UI相关的副作用

#### 应该做的：
- 从模型层获取数据并展示
- 响应用户操作并更新UI
- 调用服务层处理复杂业务逻辑
- 调用模型层更新全局状态
- 管理UI组件的生命周期
- 处理组件特定的状态
- **充当模型层和服务层之间的协调者**

#### 不应该做的：
- 不应包含复杂业务逻辑
- 不应直接发起API请求
- 不应直接操作数据库或持久化
- 不应处理数据格式转换

#### 示例代码：
```tsx
// 组件层示例
function ChatList({ chatStore, chatService }) {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    async function loadChats() {
      setIsLoading(true);
      try {
        // 调用服务层获取数据
        const chats = await chatService.fetchChats();
        // 组件负责协调，将服务层获取的数据更新到模型层
        chatStore.setChats(chats);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadChats();
  }, [chatService, chatStore]);
  
  const handleCreateChat = async (name) => {
    // 调用服务层创建聊天
    const newChat = await chatService.createChat(name);
    // 组件负责将新创建的聊天添加到模型层
    chatStore.addChat(newChat);
  };
  
  return (
    <div>
      <NewChatForm onSubmit={handleCreateChat} />
      {isLoading ? (
        <Loading />
      ) : (
        <div>
          {/* 从模型层读取数据进行展示 */}
          {chatStore.chats.map(chat => (
            <ChatItem key={chat.id} chat={chat} />
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2. 模型层 (Model Layer)

#### 职责：
- 管理全局应用状态
- 提供状态读取和更新方法
- 处理状态之间的依赖关系
- 通知状态变化
- 持久化状态（如必要）
- **管理多种类型的状态（UI状态、业务状态、程序状态等）**

#### 应该做的：
- 定义清晰的状态结构
- 提供状态访问接口
- 实现状态更新逻辑
- 处理状态之间的派生关系
- 管理状态的生命周期
- **结构化和抽象化不同类型的状态**

#### 不应该做的：
- **不应直接调用服务层**
- 不应直接调用API或指令层
- 不应包含复杂的业务逻辑
- 不应直接操作UI或DOM
- 不应处理路由逻辑

#### 模型层的状态类型

模型层可以存储和管理多种类型的状态，不仅限于UI相关状态：

1. **UI状态**
   - 页面显示状态（如折叠/展开）
   - 主题设置
   - 用户界面偏好
   - 列表排序和过滤条件

2. **业务领域状态**
   - 用户数据
   - 业务实体（聊天、消息、用户等）
   - 业务关系（朋友关系、群组成员等）
   - 业务规则状态

3. **程序状态**
   - 消息队列
   - 任务状态
   - 后台进程状态
   - 同步状态管理

4. **系统状态**
   - 认证状态
   - 网络连接状态
   - 权限状态
   - 系统配置

#### 示例代码：
```tsx
// 模型层示例 - 基本UI相关状态
class ChatStore {
  chats = [];
  currentChatId = null;
  
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  setChats(chats) {
    this.chats = chats;
  }
  
  addChat(chat) {
    this.chats.push(chat);
  }
  
  setCurrentChat(chatId) {
    this.currentChatId = chatId;
  }
  
  get currentChat() {
    return this.chats.find(chat => chat.id === this.currentChatId);
  }
}

// 程序状态示例 - 消息队列
class MessageQueueStore {
  pendingMessages = [];
  processingMessage = null;
  failedMessages = [];
  
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }
  
  enqueue(message) {
    this.pendingMessages.push(message);
  }
  
  dequeue() {
    if (this.pendingMessages.length === 0) return null;
    
    this.processingMessage = this.pendingMessages.shift();
    return this.processingMessage;
  }
  
  markAsProcessed() {
    this.processingMessage = null;
  }
  
  markAsFailed() {
    if (this.processingMessage) {
      this.failedMessages.push(this.processingMessage);
      this.processingMessage = null;
    }
  }
  
  retryAll() {
    this.pendingMessages = [...this.failedMessages, ...this.pendingMessages];
    this.failedMessages = [];
  }
  
  get hasPendingMessages() {
    return this.pendingMessages.length > 0;
  }
}

// 系统状态示例
class SystemStore {
  isOnline = navigator.onLine;
  lastSyncTime = null;
  syncInProgress = false;
  
  constructor(rootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    
    // 监听在线状态变化
    window.addEventListener('online', () => this.setOnlineStatus(true));
    window.addEventListener('offline', () => this.setOnlineStatus(false));
  }
  
  setOnlineStatus(status) {
    this.isOnline = status;
  }
  
  startSync() {
    this.syncInProgress = true;
  }
  
  endSync(success = true) {
    this.syncInProgress = false;
    if (success) {
      this.lastSyncTime = new Date();
    }
  }
}
```

### 3. 服务层 (Service Layer)

#### 职责：
- 实现业务逻辑
- 数据处理和转换
- 协调多个指令调用
- 错误处理和重试逻辑
- 缓存管理

#### 应该做的：
- 封装业务操作
- 调用指令层与后端通信
- 转换数据格式
- 处理业务错误
- 实现数据验证
- **保持无状态设计**
- **提供纯函数式的服务**

#### 不应该做的：
- **不应直接修改模型层状态**
- **不应保存或维护自身的状态**
- 不应直接操作UI状态
- 不应包含UI渲染逻辑
- 不应处理路由导航
- **不应依赖上下文环境**

#### 示例代码：
```tsx
// 服务层示例 - 无状态设计
class ChatService {
  constructor(chatCommands) {
    this.chatCommands = chatCommands;
  }
  
  async fetchChats() {
    try {
      // 调用指令层获取数据
      const chats = await this.chatCommands.getChats();
      // 返回数据，不直接更新模型层，不维护内部状态
      return chats;
    } catch (error) {
      console.error('Failed to fetch chats', error);
      throw error;
    }
  }
  
  async createChat(name, participants = []) {
    try {
      // 调用指令层创建聊天
      const chat = await this.chatCommands.createChat({
        name,
        participantIds: participants
      });
      
      // 返回创建的聊天，不直接更新模型层，不保存状态
      return chat;
    } catch (error) {
      console.error('Failed to create chat', error);
      throw error;
    }
  }
  
  // 纯函数示例 - 不依赖任何实例状态
  filterValidChats(chats, criteria) {
    return chats.filter(chat => 
      chat.name && 
      (!criteria.minParticipants || chat.participants.length >= criteria.minParticipants)
    );
  }
}
```

### 4. 指令层 (Command Layer)

#### 职责：
- 与后端API通信
- 实现API请求和响应处理
- 请求参数组装
- 处理认证和授权
- 网络错误处理

#### 应该做的：
- 封装API调用
- 处理HTTP请求细节
- 格式化请求参数
- 处理通用错误
- 管理请求头和认证信息
- **保持无状态设计**
- **提供纯粹的API调用接口**

#### 不应该做的：
- 不应包含业务逻辑
- 不应直接修改应用状态
- 不应处理UI更新
- 不应包含路由逻辑
- **不应保存数据或维护自身状态**
- **不应缓存请求结果**

#### 示例代码：
```tsx
// 指令层示例 - 无状态设计
class ChatCommands {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  
  async getChats() {
    // 纯粹的API调用，不维护状态
    return this.httpClient.get('/api/chats');
  }
  
  async createChat(params) {
    // 纯粹的API调用，不维护状态
    return this.httpClient.post('/api/chats', params);
  }
  
  async getChatMessages(chatId, options = {}) {
    // 纯粹的API调用，不维护状态
    return this.httpClient.get(`/api/chats/${chatId}/messages`, { 
      params: options 
    });
  }
  
  async sendMessage(chatId, content) {
    // 纯粹的API调用，不维护状态
    return this.httpClient.post(`/api/chats/${chatId}/messages`, { 
      content 
    });
  }
}
```

## 跨层通信原则

1. **组件层作为协调者**：组件层负责协调模型层和服务层，模型层不直接与服务层通信
2. **单向数据流**：数据流向遵循 组件层→服务层→指令层→后端 的路径，而状态更新遵循 服务层返回数据→组件层→模型层 的路径
3. **依赖注入**：通过依赖注入使用各层服务，便于测试和解耦
4. **接口分离**：各层之间通过明确的接口通信，不依赖实现细节
5. **状态隔离**：UI状态与业务状态分离，组件内部状态与全局状态分离
6. **无状态服务**：服务层和指令层应保持无状态设计，提高可测试性和可维护性

## 最佳实践

1. **单一职责**：每个组件、服务或模型只负责单一的功能领域
2. **组合优于继承**：使用组合模式而非继承来复用代码
3. **保持组件纯净**：尽可能使用受控组件，减少副作用
4. **状态提升**：将共享状态提升到最近的共同祖先或全局状态
5. **使用钩子抽象**：将复杂逻辑抽象为自定义钩子
6. **按功能组织代码**：按功能或领域而非技术角色组织文件结构
7. **懒加载**：对大型模块实施代码分割和按需加载
8. **性能优化**：使用记忆化、虚拟列表等技术优化性能
9. **无状态设计**：服务层和指令层应尽量保持无状态，所有状态应当存储在模型层
10. **状态结构化**：在模型层中对不同类型的状态进行明确的结构化和分类管理

## 灵活处理的场景

在某些情况下，可以灵活处理层次间的严格边界：

1. **小型应用**：对于简单应用，模型层和服务层可能合并
2. **原型开发**：早期原型可能简化层次结构，后续再重构
3. **特殊需求**：某些高性能要求的场景可能需要跨层优化
4. **缓存策略**：在特定情况下，服务层可能需要实现缓存机制，但应通过专门的缓存组件而非内部状态

## 结论

遵循这种以组件层为协调中心的架构设计，我们能够构建可维护、可扩展的前端应用。它帮助我们实现关注点分离，使得代码组织更加清晰，便于团队协作和长期维护。组件层作为连接用户界面、应用状态和业务逻辑的枢纽，确保了各层责任明确且协调有序。模型层负责管理多样化的状态类型，从UI状态到业务状态再到程序状态，提供集中统一的状态管理机制。服务层和指令层保持无状态设计，增强了代码的可测试性和可预测性。虽然在实际开发中可能需要根据具体情况做出调整，但总体架构原则应当得到尊重，以确保系统的健壮性和可维护性。 
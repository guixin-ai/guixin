-- Your SQL goes here

-- 创建用户表 - 简化版
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  description TEXT,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建AI代理表
CREATE TABLE agents (
  id TEXT PRIMARY KEY NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  system_prompt TEXT,
  temperature REAL DEFAULT 0.7,
  top_p REAL DEFAULT 0.9,
  top_k INTEGER DEFAULT 40,
  repeat_penalty REAL DEFAULT 1.1,
  stop_sequences TEXT,
  max_tokens INTEGER DEFAULT 2048,
  presence_penalty REAL DEFAULT 0.0,
  frequency_penalty REAL DEFAULT 0.0,
  user_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 创建用户联系人关系表
CREATE TABLE user_contacts (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  contact_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (contact_id) REFERENCES users (id),
  UNIQUE (user_id, contact_id)
);

-- 创建聊天表 - 简化版
CREATE TABLE chats (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  avatar_urls TEXT NOT NULL,
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_message TEXT,
  last_message_time TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建聊天参与者表（用户与聊天的多对多关系）
CREATE TABLE chat_participants (
  id TEXT PRIMARY KEY NOT NULL,
  nickname TEXT,
  description TEXT,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (chat_id) REFERENCES chats (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (chat_id, user_id)
);

-- 创建消息表 - 简化版
CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  chat_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  FOREIGN KEY (chat_id) REFERENCES chats (id),
  FOREIGN KEY (sender_id) REFERENCES users (id)
);

-- 创建触发器，用于自动更新 updated_at 字段
CREATE TRIGGER update_users_updated_at
AFTER UPDATE ON users
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_agents_updated_at
AFTER UPDATE ON agents
BEGIN
  UPDATE agents SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_user_contacts_updated_at
AFTER UPDATE ON user_contacts
BEGIN
  UPDATE user_contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_chats_updated_at
AFTER UPDATE ON chats
BEGIN
  UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_chat_participants_updated_at
AFTER UPDATE ON chat_participants
BEGIN
  UPDATE chat_participants SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_messages_updated_at
AFTER UPDATE ON messages
BEGIN
  UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 创建触发器，用于在插入或更新消息时自动更新聊天的最后消息信息
CREATE TRIGGER update_chat_last_message
AFTER INSERT ON messages
BEGIN
  UPDATE chats 
  SET last_message = NEW.content,
      last_message_time = NEW.created_at
  WHERE id = NEW.chat_id;
END;

-- 在所有表和触发器创建完成后，添加一个默认用户
INSERT INTO users (
  id,
  name,
  avatar_url,
  description,
  is_ai,
  created_at,
  updated_at
) VALUES (
  'default-user',
  '默认用户',
  NULL,
  '客户端默认用户',
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_user_contacts_user_id ON user_contacts(user_id);
CREATE INDEX idx_user_contacts_contact_id ON user_contacts(contact_id);
CREATE INDEX idx_agents_user_id ON agents(user_id);
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

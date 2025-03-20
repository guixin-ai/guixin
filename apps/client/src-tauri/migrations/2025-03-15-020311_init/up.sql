-- Your SQL goes here

-- 创建用户表 - 简化版
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建聊天表 - 简化版
CREATE TABLE chats (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建聊天参与者表（用户与聊天的多对多关系）
CREATE TABLE chat_participants (
  id TEXT PRIMARY KEY NOT NULL,
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

CREATE TRIGGER update_chats_updated_at
AFTER UPDATE ON chats
BEGIN
  UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_messages_updated_at
AFTER UPDATE ON messages
BEGIN
  UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 在所有表和触发器创建完成后，添加一个默认用户
INSERT INTO users (
  id,
  name,
  description,
  is_ai,
  created_at,
  updated_at
) VALUES (
  'default-user',
  '默认用户',
  '客户端默认用户',
  FALSE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

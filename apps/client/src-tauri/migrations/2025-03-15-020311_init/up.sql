-- Your SQL goes here

-- 创建用户表
CREATE TABLE users (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  description TEXT,
  is_ai BOOLEAN NOT NULL DEFAULT FALSE,
  cloud_id TEXT,
  sync_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  last_sync_time TIMESTAMP,
  theme TEXT NOT NULL DEFAULT 'light',
  language TEXT NOT NULL DEFAULT 'zh-CN',
  font_size INTEGER NOT NULL DEFAULT 14,
  custom_settings TEXT DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建联系人分组表
CREATE TABLE contact_groups (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT
);

-- 创建Agent表
CREATE TABLE agents (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  model_name TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  temperature REAL NOT NULL,
  max_tokens INTEGER,
  top_p REAL,
  avatar_url TEXT,
  description TEXT,
  is_streaming BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_id TEXT UNIQUE,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 创建联系人用户链接表（中间表）
CREATE TABLE contact_user_links (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- 创建联系人表
CREATE TABLE contacts (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  group_id TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  user_link_id TEXT NOT NULL,
  FOREIGN KEY (group_id) REFERENCES contact_groups (id),
  FOREIGN KEY (owner_id) REFERENCES users (id),
  FOREIGN KEY (user_link_id) REFERENCES contact_user_links (id)
);

-- 创建聊天表
CREATE TABLE chats (
  id TEXT PRIMARY KEY NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'individual',
  last_message_id TEXT,
  last_message_content TEXT,
  last_message_time TIMESTAMP,
  last_message_sender_id TEXT,
  last_message_sender_name TEXT,
  last_message_type TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 创建聊天参与者表
CREATE TABLE chat_participants (
  id TEXT PRIMARY KEY NOT NULL,
  joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  role TEXT NOT NULL DEFAULT 'member',
  unread_count INTEGER NOT NULL DEFAULT 0,
  last_read_message_id TEXT,
  chat_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  FOREIGN KEY (chat_id) REFERENCES chats (id),
  FOREIGN KEY (user_id) REFERENCES users (id),
  UNIQUE (chat_id, user_id)
);

-- 创建会话表
CREATE TABLE conversations (
  id TEXT PRIMARY KEY NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  chat_id TEXT NOT NULL UNIQUE,
  FOREIGN KEY (chat_id) REFERENCES chats (id)
);

-- 创建消息表
CREATE TABLE messages (
  id TEXT PRIMARY KEY NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text',
  status TEXT NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conversation_id TEXT NOT NULL,
  sender_id TEXT NOT NULL,
  FOREIGN KEY (conversation_id) REFERENCES conversations (id),
  FOREIGN KEY (sender_id) REFERENCES users (id)
);

-- 创建消息接收记录表（中间表）
CREATE TABLE message_receipts (
  id TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL DEFAULT 'delivered',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_id TEXT NOT NULL,
  receiver_id TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages (id),
  FOREIGN KEY (receiver_id) REFERENCES users (id),
  UNIQUE (message_id, receiver_id)
);

-- 创建附件表
CREATE TABLE attachments (
  id TEXT PRIMARY KEY NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  message_id TEXT NOT NULL,
  FOREIGN KEY (message_id) REFERENCES messages (id)
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

CREATE TRIGGER update_contacts_updated_at
AFTER UPDATE ON contacts
BEGIN
  UPDATE contacts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_chats_updated_at
AFTER UPDATE ON chats
BEGIN
  UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_conversations_updated_at
AFTER UPDATE ON conversations
BEGIN
  UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_messages_updated_at
AFTER UPDATE ON messages
BEGIN
  UPDATE messages SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_message_receipts_updated_at
AFTER UPDATE ON message_receipts
BEGIN
  UPDATE message_receipts SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_attachments_updated_at
AFTER UPDATE ON attachments
BEGIN
  UPDATE attachments SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 在所有表和触发器创建完成后，添加一个默认用户
INSERT INTO users (
  id,
  name,
  email,
  description,
  is_ai,
  sync_enabled,
  theme,
  language,
  font_size,
  created_at,
  updated_at
) VALUES (
  'default-user',
  '默认用户',
  NULL,
  '客户端默认用户',
  FALSE,
  FALSE,
  'light',
  'zh-CN',
  14,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);

-- 创建索引以提高查询性能
CREATE INDEX idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX idx_chats_last_message_time ON chats(last_message_time);

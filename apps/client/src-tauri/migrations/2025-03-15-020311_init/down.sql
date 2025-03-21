-- This file should undo anything in `up.sql`

-- 删除索引
DROP INDEX IF EXISTS idx_messages_sender_id;
DROP INDEX IF EXISTS idx_messages_chat_id;
DROP INDEX IF EXISTS idx_chat_participants_chat_id;
DROP INDEX IF EXISTS idx_chat_participants_user_id;
DROP INDEX IF EXISTS idx_user_contacts_contact_id;
DROP INDEX IF EXISTS idx_user_contacts_user_id;

-- 删除触发器
DROP TRIGGER IF EXISTS update_messages_updated_at;
DROP TRIGGER IF EXISTS update_chats_updated_at;
DROP TRIGGER IF EXISTS update_user_contacts_updated_at;
DROP TRIGGER IF EXISTS update_users_updated_at;
DROP TRIGGER IF EXISTS update_chat_last_message;

-- 删除表（注意顺序：先删除有外键约束的表）
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chat_participants;
DROP TABLE IF EXISTS chats;
DROP TABLE IF EXISTS user_contacts;
DROP TABLE IF EXISTS users;

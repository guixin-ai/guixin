// @generated automatically by Diesel CLI.

diesel::table! {
    agents (id) {
        id -> Text,
        name -> Text,
        model_name -> Text,
        system_prompt -> Text,
        temperature -> Float,
        max_tokens -> Nullable<Integer>,
        top_p -> Nullable<Float>,
        avatar_url -> Nullable<Text>,
        description -> Nullable<Text>,
        is_streaming -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        user_id -> Nullable<Text>,
    }
}

diesel::table! {
    attachments (id) {
        id -> Text,
        file_name -> Text,
        file_type -> Text,
        file_size -> Integer,
        file_path -> Text,
        thumbnail_path -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        message_id -> Text,
    }
}

diesel::table! {
    chat_participants (id) {
        id -> Text,
        joined_at -> Timestamp,
        role -> Text,
        unread_count -> Integer,
        last_read_message_id -> Nullable<Text>,
        chat_id -> Text,
        user_id -> Text,
    }
}

diesel::table! {
    chats (id) {
        id -> Text,
        title -> Text,
        #[sql_name = "type"]
        type_ -> Text,
        last_message_id -> Nullable<Text>,
        last_message_content -> Nullable<Text>,
        last_message_time -> Nullable<Timestamp>,
        last_message_sender_id -> Nullable<Text>,
        last_message_sender_name -> Nullable<Text>,
        last_message_type -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    contact_groups (id) {
        id -> Text,
        name -> Text,
        description -> Nullable<Text>,
    }
}

diesel::table! {
    contact_user_links (id) {
        id -> Text,
        user_id -> Text,
        created_at -> Timestamp,
    }
}

diesel::table! {
    contacts (id) {
        id -> Text,
        name -> Text,
        description -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        group_id -> Text,
        owner_id -> Text,
        user_link_id -> Text,
    }
}

diesel::table! {
    conversations (id) {
        id -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        chat_id -> Text,
    }
}

diesel::table! {
    message_receipts (id) {
        id -> Text,
        status -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        message_id -> Text,
        receiver_id -> Text,
    }
}

diesel::table! {
    messages (id) {
        id -> Text,
        content -> Text,
        content_type -> Text,
        status -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        conversation_id -> Text,
        sender_id -> Text,
    }
}

diesel::table! {
    users (id) {
        id -> Text,
        name -> Text,
        email -> Nullable<Text>,
        avatar_url -> Nullable<Text>,
        description -> Nullable<Text>,
        is_ai -> Bool,
        cloud_id -> Nullable<Text>,
        sync_enabled -> Bool,
        last_sync_time -> Nullable<Timestamp>,
        theme -> Text,
        language -> Text,
        font_size -> Integer,
        custom_settings -> Nullable<Text>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(agents -> users (user_id));
diesel::joinable!(attachments -> messages (message_id));
diesel::joinable!(chat_participants -> chats (chat_id));
diesel::joinable!(chat_participants -> users (user_id));
diesel::joinable!(contact_user_links -> users (user_id));
diesel::joinable!(contacts -> contact_groups (group_id));
diesel::joinable!(contacts -> contact_user_links (user_link_id));
diesel::joinable!(contacts -> users (owner_id));
diesel::joinable!(conversations -> chats (chat_id));
diesel::joinable!(message_receipts -> messages (message_id));
diesel::joinable!(message_receipts -> users (receiver_id));
diesel::joinable!(messages -> conversations (conversation_id));
diesel::joinable!(messages -> users (sender_id));

diesel::allow_tables_to_appear_in_same_query!(
    agents,
    attachments,
    chat_participants,
    chats,
    contact_groups,
    contact_user_links,
    contacts,
    conversations,
    message_receipts,
    messages,
    users,
);

// @generated automatically by Diesel CLI.

diesel::table! {
    agents (id) {
        id -> Text,
        provider -> Text,
        model_name -> Text,
        system_prompt -> Nullable<Text>,
        temperature -> Nullable<Float>,
        top_p -> Nullable<Float>,
        top_k -> Nullable<Integer>,
        repeat_penalty -> Nullable<Float>,
        stop_sequences -> Nullable<Text>,
        max_tokens -> Nullable<Integer>,
        presence_penalty -> Nullable<Float>,
        frequency_penalty -> Nullable<Float>,
        user_id -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    chat_participants (id) {
        id -> Text,
        nickname -> Nullable<Text>,
        description -> Nullable<Text>,
        joined_at -> Timestamp,
        chat_id -> Text,
        user_id -> Text,
    }
}

diesel::table! {
    chats (id) {
        id -> Text,
        name -> Text,
        avatar_urls -> Text,
        unread_count -> Integer,
        last_message -> Nullable<Text>,
        last_message_time -> Nullable<Timestamp>,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    messages (id) {
        id -> Text,
        content -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        chat_id -> Text,
        sender_id -> Text,
    }
}

diesel::table! {
    user_contacts (id) {
        id -> Text,
        user_id -> Text,
        contact_id -> Text,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    users (id) {
        id -> Text,
        name -> Text,
        avatar_url -> Nullable<Text>,
        description -> Nullable<Text>,
        is_ai -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(agents -> users (user_id));
diesel::joinable!(chat_participants -> chats (chat_id));
diesel::joinable!(chat_participants -> users (user_id));
diesel::joinable!(messages -> chats (chat_id));
diesel::joinable!(messages -> users (sender_id));

diesel::allow_tables_to_appear_in_same_query!(
    agents,
    chat_participants,
    chats,
    messages,
    user_contacts,
    users,
);

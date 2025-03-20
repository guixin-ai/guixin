// @generated automatically by Diesel CLI.

diesel::table! {
    chat_participants (id) {
        id -> Text,
        joined_at -> Timestamp,
        chat_id -> Text,
        user_id -> Text,
    }
}

diesel::table! {
    chats (id) {
        id -> Text,
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
    users (id) {
        id -> Text,
        name -> Text,
        description -> Nullable<Text>,
        is_ai -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::joinable!(chat_participants -> chats (chat_id));
diesel::joinable!(chat_participants -> users (user_id));
diesel::joinable!(messages -> chats (chat_id));
diesel::joinable!(messages -> users (sender_id));

diesel::allow_tables_to_appear_in_same_query!(
    chat_participants,
    chats,
    messages,
    users,
);

// ============================================================
// Odaklio — Veritabanı Tip Tanımları
// ============================================================
// Bu dosya Supabase veritabanındaki tüm tabloların TypeScript
// tiplerini tanımlar. Yeni tablo eklendiğinde burası güncellenir.
// ============================================================

// ---------- Enum tipler ----------

export type MessageRole = "user" | "assistant";

export type ChatStyle = "standard" | "mindmap";

export type MentorType = "coach" | "psychologist" | "friend" | "expert";

// ---------- Metadata tipleri ----------

export interface ConversationMetadata {
  tags?: string[];
  chat_style?: ChatStyle;
  mentor_type?: MentorType;
}

export interface MessageMetadata {
  tokens?: number;
  model?: string;
  duration_ms?: number;
}

// ---------- Tablo tipleri ----------

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  is_archived: boolean;
  metadata: ConversationMetadata;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata: MessageMetadata;
  created_at: string;
}

// ---------- Insert / Update tipleri ----------

export interface ConversationInsert {
  title?: string;
  metadata?: ConversationMetadata;
}

export interface ConversationUpdate {
  title?: string;
  is_archived?: boolean;
  metadata?: ConversationMetadata;
}

export interface MessageInsert {
  conversation_id: string;
  role: MessageRole;
  content: string;
  metadata?: MessageMetadata;
}

export interface MessageBatchInsert {
  conversation_id: string;
  messages: {
    role: MessageRole;
    content: string;
    metadata?: MessageMetadata;
  }[];
}

// ---------- API Response tipleri ----------

export interface ConversationListItem {
  id: string;
  title: string;
  is_archived: boolean;
  metadata: ConversationMetadata;
  created_at: string;
  updated_at: string;
  message_count: number;
  last_message_preview: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  count: number;
}

export interface ApiError {
  error: string;
  code: string;
}

// ---------- Supabase Database tipi ----------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      conversations: {
        Row: Conversation;
        Insert: Omit<Conversation, "id" | "created_at" | "updated_at"> & { id?: string };
        Update: Partial<Omit<Conversation, "id" | "user_id" | "created_at">>;
      };
      messages: {
        Row: Message;
        Insert: Omit<Message, "id" | "created_at"> & { id?: string };
        Update: never;
      };
    };
  };
}

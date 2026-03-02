import { supabase } from "@/lib/supabase";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface ConversationWithPreview extends Conversation {
  messages: { content: string }[];
}

export async function createConversation(userId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserConversations(
  userId: string,
  limit = 50,
  offset = 0
): Promise<ConversationWithPreview[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, messages(content)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(offset, offset + limit - 1)
    .limit(1, { foreignTable: "messages" });
  if (error) throw error;
  return data || [];
}

export async function getRecentConversations(
  userId: string,
  limit = 10
): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("id, user_id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ title })
    .eq("id", conversationId);
  if (error) throw error;
}

export async function deleteConversation(conversationId: string): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);
  if (error) throw error;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function insertMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role, content, metadata })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateMessageContent(
  messageId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ content })
    .eq("id", messageId);
  if (error) throw error;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Message } from "../types/database";
import type {
  CreateMessageInput,
  CreateMessageBatchInput,
  ListMessagesQuery,
} from "../validators/chat";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, "public", any>;

/**
 * Bir konuşmadaki mesajları listeler.
 */
export async function listMessages(
  supabase: Client,
  conversationId: string,
  query: ListMessagesQuery
): Promise<{ data: Message[]; count: number; error: string | null }> {
  const { data, count, error } = await supabase
    .from("messages")
    .select("*", { count: "exact" })
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .range(query.offset, query.offset + query.limit - 1);

  if (error) {
    console.error("[listMessages]", error);
    return { data: [], count: 0, error: error.message };
  }

  return { data: data || [], count: count || 0, error: null };
}

/**
 * Tek bir mesaj ekler.
 */
export async function createMessage(
  supabase: Client,
  conversationId: string,
  input: CreateMessageInput
): Promise<{ data: Message | null; error: string | null }> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: input.role,
      content: input.content,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("[createMessage]", error);
    return { data: null, error: error.message };
  }

  // Konuşmanın updated_at alanını güncelle
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { data, error: null };
}

/**
 * Birden fazla mesajı toplu ekler (user + assistant mesaj çifti).
 * Konuşma geçmişi kaydetmek için idealdir.
 */
export async function createMessageBatch(
  supabase: Client,
  conversationId: string,
  input: CreateMessageBatchInput
): Promise<{ data: Message[]; error: string | null }> {
  const rows = input.messages.map((msg) => ({
    conversation_id: conversationId,
    role: msg.role,
    content: msg.content,
    metadata: msg.metadata || {},
  }));

  const { data, error } = await supabase
    .from("messages")
    .insert(rows)
    .select();

  if (error) {
    console.error("[createMessageBatch]", error);
    return { data: [], error: error.message };
  }

  // Konuşmanın updated_at alanını güncelle
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  return { data: data || [], error: null };
}

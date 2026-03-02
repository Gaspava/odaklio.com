import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  Conversation,
  ConversationListItem,
} from "../types/database";
import type {
  CreateConversationInput,
  UpdateConversationInput,
  ListConversationsQuery,
} from "../validators/chat";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<any, "public", any>;

/**
 * Yeni bir konuşma oluşturur.
 */
export async function createConversation(
  supabase: Client,
  userId: string,
  input: CreateConversationInput
): Promise<{ data: Conversation | null; error: string | null }> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      title: input.title,
      is_archived: false,
      metadata: input.metadata || {},
    })
    .select()
    .single();

  if (error) {
    console.error("[createConversation]", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Kullanıcının konuşmalarını listeler (sayfalama ve arama destekli).
 */
export async function listConversations(
  supabase: Client,
  userId: string,
  query: ListConversationsQuery
): Promise<{ data: ConversationListItem[]; count: number; error: string | null }> {
  let qb = supabase
    .from("conversations")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("is_archived", query.archived)
    .order("updated_at", { ascending: false })
    .range(query.offset, query.offset + query.limit - 1);

  if (query.search) {
    qb = qb.ilike("title", `%${query.search}%`);
  }

  const { data, count, error } = await qb;

  if (error) {
    console.error("[listConversations]", error);
    return { data: [], count: 0, error: error.message };
  }

  // Her konuşma için mesaj sayısını ve son mesaj ön izlemesini al
  const items: ConversationListItem[] = await Promise.all(
    (data || []).map(async (conv) => {
      const { count: msgCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id);

      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return {
        id: conv.id,
        title: conv.title,
        is_archived: conv.is_archived,
        metadata: conv.metadata as ConversationListItem["metadata"],
        created_at: conv.created_at,
        updated_at: conv.updated_at,
        message_count: msgCount || 0,
        last_message_preview: lastMsg?.content?.slice(0, 100) || null,
      };
    })
  );

  return { data: items, count: count || 0, error: null };
}

/**
 * Tek bir konuşmanın detayını döner.
 */
export async function getConversation(
  supabase: Client,
  conversationId: string
): Promise<{ data: Conversation | null; error: string | null }> {
  const { data, error } = await supabase
    .from("conversations")
    .select()
    .eq("id", conversationId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return { data: null, error: "Konuşma bulunamadı" };
    }
    console.error("[getConversation]", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Konuşmayı günceller (başlık, arşiv durumu, metadata).
 */
export async function updateConversation(
  supabase: Client,
  conversationId: string,
  input: UpdateConversationInput
): Promise<{ data: Conversation | null; error: string | null }> {
  const { data, error } = await supabase
    .from("conversations")
    .update({
      ...input,
      updated_at: new Date().toISOString(),
    })
    .eq("id", conversationId)
    .select()
    .single();

  if (error) {
    console.error("[updateConversation]", error);
    return { data: null, error: error.message };
  }

  return { data, error: null };
}

/**
 * Konuşmayı siler (cascade ile tüm mesajları da siler).
 */
export async function deleteConversation(
  supabase: Client,
  conversationId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) {
    console.error("[deleteConversation]", error);
    return { error: error.message };
  }

  return { error: null };
}

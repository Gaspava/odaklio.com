import { supabase } from "@/lib/supabase";

export type InteractionType =
  | "message_sent"
  | "flashcard_flipped"
  | "flashcard_saved"
  | "roadmap_step_completed"
  | "mindmap_node_added"
  | "pomodoro_completed"
  | "note_created";

export interface PageTrackingRecord {
  id: string;
  user_id: string;
  page_name: string;
  conversation_id: string | null;
  content_title: string | null;
  content_subject: string | null;
  duration_seconds: number;
  started_at: string;
  ended_at: string | null;
  created_at: string;
}

export async function createPageTrackingRecord(
  userId: string,
  pageName: string,
  conversationId?: string | null,
  contentTitle?: string | null,
  contentSubject?: string | null
): Promise<PageTrackingRecord> {
  const { data, error } = await supabase
    .from("page_tracking")
    .insert({
      user_id: userId,
      page_name: pageName,
      conversation_id: conversationId || null,
      content_title: contentTitle || null,
      content_subject: contentSubject || null,
      duration_seconds: 0,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function finalizePageTracking(
  recordId: string,
  durationSeconds: number
): Promise<void> {
  const { error } = await supabase
    .from("page_tracking")
    .update({
      duration_seconds: durationSeconds,
      ended_at: new Date().toISOString(),
    })
    .eq("id", recordId);
  if (error) throw error;
}

export async function batchInsertInteractions(
  interactions: {
    user_id: string;
    interaction_type: InteractionType;
    conversation_id?: string | null;
    subject?: string | null;
    metadata?: Record<string, unknown>;
  }[]
): Promise<void> {
  if (interactions.length === 0) return;
  const rows = interactions.map((i) => ({
    user_id: i.user_id,
    interaction_type: i.interaction_type,
    conversation_id: i.conversation_id || null,
    subject: i.subject || null,
    metadata: i.metadata || {},
  }));
  const { error } = await supabase.from("user_interactions").insert(rows);
  if (error) throw error;
}

export async function insertInteraction(
  userId: string,
  interactionType: InteractionType,
  conversationId?: string | null,
  subject?: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from("user_interactions").insert({
    user_id: userId,
    interaction_type: interactionType,
    conversation_id: conversationId || null,
    subject: subject || null,
    metadata: metadata || {},
  });
  if (error) throw error;
}

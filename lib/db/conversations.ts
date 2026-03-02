import { supabase } from "@/lib/supabase";

export type ConversationType = "standard" | "mindmap";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  canvas_state: CanvasState | null;
  created_at: string;
  updated_at: string;
}

export interface CanvasState {
  offsetX: number;
  offsetY: number;
  scale: number;
  activeNodeId: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  node_id: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
}

export interface MindmapNode {
  id: string;
  conversation_id: string;
  parent_node_id: string | null;
  label: string;
  position_x: number;
  position_y: number;
  sort_order: number;
  created_at: string;
}

export interface ConversationWithPreview extends Conversation {
  messages: { content: string }[];
}

export async function createConversation(
  userId: string,
  type: ConversationType = "standard"
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, type })
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
    .select("id, user_id, title, type, canvas_state, created_at, updated_at")
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
  metadata: Record<string, unknown> = {},
  nodeId: string | null = null
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role,
      content,
      metadata,
      node_id: nodeId,
    })
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

/* ===== MINDMAP OPERATIONS ===== */

export async function saveMindmapNodes(
  conversationId: string,
  nodes: { id: string; parentNodeId: string | null; label: string; x: number; y: number; sortOrder: number }[]
): Promise<void> {
  // Delete existing nodes then insert fresh (simpler than upsert with composite PK)
  const { error: delError } = await supabase
    .from("mindmap_nodes")
    .delete()
    .eq("conversation_id", conversationId);
  if (delError) throw delError;

  if (nodes.length === 0) return;

  const rows = nodes.map((n) => ({
    id: n.id,
    conversation_id: conversationId,
    parent_node_id: n.parentNodeId,
    label: n.label,
    position_x: n.x,
    position_y: n.y,
    sort_order: n.sortOrder,
  }));

  const { error } = await supabase.from("mindmap_nodes").insert(rows);
  if (error) throw error;
}

export async function getMindmapNodes(conversationId: string): Promise<MindmapNode[]> {
  const { data, error } = await supabase
    .from("mindmap_nodes")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getMessagesByNode(
  conversationId: string,
  nodeId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .eq("node_id", nodeId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getAllMindmapMessages(conversationId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .not("node_id", "is", null)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function updateCanvasState(
  conversationId: string,
  canvasState: CanvasState
): Promise<void> {
  const { error } = await supabase
    .from("conversations")
    .update({ canvas_state: canvasState })
    .eq("id", conversationId);
  if (error) throw error;
}

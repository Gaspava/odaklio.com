import { supabase } from "@/lib/supabase";

export type ConversationType = "standard" | "mindmap" | "flashcard" | "note" | "roadmap" | "roadmap_study" | "mentor";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  type: ConversationType;
  canvas_state: CanvasState | null;
  parent_conversation_id: string | null;
  parent_step_number: number | null;
  created_at: string;
  updated_at: string;
}

export interface RoadmapStepRow {
  id: string;
  conversation_id: string;
  step_number: number;
  title: string;
  description: string;
  duration: string;
  is_completed: boolean;
  is_expandable: boolean;
  created_at: string;
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
    .select("id, user_id, title, type, canvas_state, parent_conversation_id, parent_step_number, created_at, updated_at")
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

/* ===== SAVED FLASHCARDS ===== */

export interface SavedFlashcard {
  id: string;
  user_id: string;
  conversation_id: string;
  question: string;
  answer: string;
  created_at: string;
}

export async function saveFlashcard(
  userId: string,
  conversationId: string,
  question: string,
  answer: string
): Promise<SavedFlashcard> {
  const { data, error } = await supabase
    .from("saved_flashcards")
    .insert({ user_id: userId, conversation_id: conversationId, question, answer })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSavedFlashcards(userId: string): Promise<SavedFlashcard[]> {
  const { data, error } = await supabase
    .from("saved_flashcards")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getSavedFlashcardsByConversation(
  conversationId: string
): Promise<SavedFlashcard[]> {
  const { data, error } = await supabase
    .from("saved_flashcards")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function deleteSavedFlashcard(flashcardId: string): Promise<void> {
  const { error } = await supabase
    .from("saved_flashcards")
    .delete()
    .eq("id", flashcardId);
  if (error) throw error;
}

/* ===== USER NOTES ===== */

export interface UserNote {
  id: string;
  user_id: string;
  content: string;
  source_page: string;
  source_context: string | null;
  created_at: string;
}

export async function saveUserNoteToDb(
  userId: string,
  content: string,
  sourcePage: string,
  sourceContext?: string
): Promise<UserNote> {
  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: userId,
      content,
      source_page: sourcePage,
      source_context: sourceContext || null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserNotes(userId: string): Promise<UserNote[]> {
  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function deleteUserNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId);
  if (error) throw error;
}

/* ===== ROADMAP STEPS ===== */

export async function saveRoadmapSteps(
  conversationId: string,
  steps: { stepNumber: number; title: string; description: string; duration: string; isCompleted?: boolean; isExpandable?: boolean }[]
): Promise<void> {
  const { error: delError } = await supabase
    .from("roadmap_steps")
    .delete()
    .eq("conversation_id", conversationId);
  if (delError) throw delError;

  if (steps.length === 0) return;

  const rows = steps.map((s) => ({
    conversation_id: conversationId,
    step_number: s.stepNumber,
    title: s.title,
    description: s.description,
    duration: s.duration,
    is_completed: s.isCompleted ?? false,
    is_expandable: s.isExpandable ?? true,
  }));

  const { error } = await supabase.from("roadmap_steps").insert(rows);
  if (error) throw error;
}

export async function getRoadmapSteps(conversationId: string): Promise<RoadmapStepRow[]> {
  const { data, error } = await supabase
    .from("roadmap_steps")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("step_number", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function toggleRoadmapStepCompletion(
  conversationId: string,
  stepNumber: number,
  isCompleted: boolean
): Promise<void> {
  const { error } = await supabase
    .from("roadmap_steps")
    .update({ is_completed: isCompleted })
    .eq("conversation_id", conversationId)
    .eq("step_number", stepNumber);
  if (error) throw error;
}

export async function createChildRoadmapConversation(
  userId: string,
  parentId: string,
  parentStepNumber: number
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: userId,
      type: "roadmap",
      parent_conversation_id: parentId,
      parent_step_number: parentStepNumber,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getChildConversations(parentId: string): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("parent_conversation_id", parentId)
    .order("parent_step_number", { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getConversationBreadcrumb(
  conversationId: string
): Promise<{ id: string; title: string }[]> {
  const crumbs: { id: string; title: string }[] = [];
  let currentId: string | null = conversationId;

  while (currentId) {
    const conv = await getConversation(currentId);
    if (!conv) break;
    crumbs.unshift({ id: conv.id, title: conv.title || "Yol Haritasi" });
    currentId = conv.parent_conversation_id;
  }

  return crumbs;
}

export interface RoadmapWithProgress {
  id: string;
  title: string;
  parent_conversation_id: string | null;
  parent_step_number: number | null;
  created_at: string;
  updated_at: string;
  total_steps: number;
  completed_steps: number;
  children: RoadmapWithProgress[];
}

export async function getUserRoadmaps(userId: string): Promise<RoadmapWithProgress[]> {
  const { data: convs, error: convError } = await supabase
    .from("conversations")
    .select("id, title, parent_conversation_id, parent_step_number, created_at, updated_at")
    .eq("user_id", userId)
    .eq("type", "roadmap")
    .order("updated_at", { ascending: false });
  if (convError) throw convError;
  if (!convs || convs.length === 0) return [];

  const convIds = convs.map((c) => c.id);
  const { data: allSteps, error: stepError } = await supabase
    .from("roadmap_steps")
    .select("conversation_id, is_completed")
    .in("conversation_id", convIds);
  if (stepError) throw stepError;

  const stepCounts: Record<string, { total: number; completed: number }> = {};
  for (const step of allSteps || []) {
    if (!stepCounts[step.conversation_id]) stepCounts[step.conversation_id] = { total: 0, completed: 0 };
    stepCounts[step.conversation_id].total++;
    if (step.is_completed) stepCounts[step.conversation_id].completed++;
  }

  const roadmapMap: Record<string, RoadmapWithProgress> = {};
  for (const c of convs) {
    const counts = stepCounts[c.id] || { total: 0, completed: 0 };
    roadmapMap[c.id] = {
      id: c.id,
      title: c.title || "Yol Haritasi",
      parent_conversation_id: c.parent_conversation_id,
      parent_step_number: c.parent_step_number,
      created_at: c.created_at,
      updated_at: c.updated_at,
      total_steps: counts.total,
      completed_steps: counts.completed,
      children: [],
    };
  }

  // Build tree: attach children to parents
  const roots: RoadmapWithProgress[] = [];
  for (const r of Object.values(roadmapMap)) {
    if (r.parent_conversation_id && roadmapMap[r.parent_conversation_id]) {
      roadmapMap[r.parent_conversation_id].children.push(r);
    } else {
      roots.push(r);
    }
  }

  return roots;
}

/* ===== MENTOR CONVERSATIONS ===== */

export async function getMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .eq("type", "mentor")
    .eq("title", mentorId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function createMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, type: "mentor", title: mentorId })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getOrCreateMentorConversation(
  userId: string,
  mentorId: string
): Promise<Conversation> {
  const existing = await getMentorConversation(userId, mentorId);
  if (existing) return existing;
  return createMentorConversation(userId, mentorId);
}

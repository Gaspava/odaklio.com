import { z } from "zod";

// ---------- Conversation Validasyonları ----------

export const createConversationSchema = z.object({
  title: z
    .string()
    .min(1, "Başlık boş olamaz")
    .max(200, "Başlık 200 karakteri aşamaz")
    .optional()
    .default("Yeni Sohbet"),
  metadata: z
    .object({
      tags: z.array(z.string().max(50)).max(10).optional(),
      chat_style: z.enum(["standard", "mindmap"]).optional(),
      mentor_type: z.enum(["coach", "psychologist", "friend", "expert"]).optional(),
    })
    .optional()
    .default({}),
});

export const updateConversationSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  is_archived: z.boolean().optional(),
  metadata: z
    .object({
      tags: z.array(z.string().max(50)).max(10).optional(),
      chat_style: z.enum(["standard", "mindmap"]).optional(),
      mentor_type: z.enum(["coach", "psychologist", "friend", "expert"]).optional(),
    })
    .optional(),
});

// ---------- Message Validasyonları ----------

export const createMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1, "Mesaj boş olamaz").max(50000, "Mesaj çok uzun"),
  metadata: z
    .object({
      tokens: z.number().int().positive().optional(),
      model: z.string().max(100).optional(),
      duration_ms: z.number().int().positive().optional(),
    })
    .optional()
    .default({}),
});

export const createMessageBatchSchema = z.object({
  messages: z
    .array(createMessageSchema)
    .min(1, "En az bir mesaj gerekli")
    .max(100, "Bir seferde en fazla 100 mesaj"),
});

// ---------- Query Parametreleri ----------

export const listConversationsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  archived: z.coerce.boolean().optional().default(false),
  search: z.string().max(200).optional(),
});

export const listMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// ---------- Chat API Validasyonu ----------

export const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(50000),
      })
    )
    .min(1, "En az bir mesaj gerekli")
    .max(100),
  conversation_id: z.string().uuid().optional(),
});

// ---------- Tip Export'ları ----------

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type CreateMessageBatchInput = z.infer<typeof createMessageBatchSchema>;
export type ListConversationsQuery = z.infer<typeof listConversationsQuerySchema>;
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
export type ChatRequestInput = z.infer<typeof chatRequestSchema>;

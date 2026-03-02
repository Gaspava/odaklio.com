import { requireAuth } from "@/lib/middleware/auth";
import { applyRateLimit } from "@/lib/middleware/rate-limit";
import {
  createMessageBatchSchema,
  listMessagesQuerySchema,
} from "@/lib/validators/chat";
import { listMessages, createMessageBatch } from "@/lib/db/messages";
import { getConversation } from "@/lib/db/conversations";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id]/messages — Konuşmadaki mesajları listeler
 */
export async function GET(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`msg-list:${user.id}`, { maxRequests: 60 });
    if (limited) return limited;

    const { id } = await params;

    // Konuşmanın bu kullanıcıya ait olduğunu doğrula
    const { data: conv, error: convError } = await getConversation(supabase, id);
    if (convError || !conv) {
      return Response.json(
        { error: "Konuşma bulunamadı", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const queryParams = Object.fromEntries(url.searchParams);
    const parsed = listMessagesQuerySchema.safeParse(queryParams);

    if (!parsed.success) {
      return Response.json(
        { error: "Geçersiz sorgu parametreleri", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { data, count, error } = await listMessages(supabase, id, parsed.data);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data, count });
  } catch (error) {
    console.error("[GET /api/conversations/[id]/messages]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations/[id]/messages — Mesaj(lar) ekler
 * Body: { messages: [{ role, content, metadata? }] }
 */
export async function POST(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`msg-create:${user.id}`, { maxRequests: 60 });
    if (limited) return limited;

    const { id } = await params;

    // Konuşmanın bu kullanıcıya ait olduğunu doğrula
    const { data: conv, error: convError } = await getConversation(supabase, id);
    if (convError || !conv) {
      return Response.json(
        { error: "Konuşma bulunamadı", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const parsed = createMessageBatchSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: parsed.error.issues[0]?.message || "Geçersiz veri",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await createMessageBatch(supabase, id, parsed.data);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations/[id]/messages]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

import { requireAuth } from "@/lib/middleware/auth";
import { applyRateLimit } from "@/lib/middleware/rate-limit";
import { updateConversationSchema } from "@/lib/validators/chat";
import {
  getConversation,
  updateConversation,
  deleteConversation,
} from "@/lib/db/conversations";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/conversations/[id] — Tek bir konuşmanın detayını döner
 */
export async function GET(_request: Request, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`get:${user.id}`, { maxRequests: 60 });
    if (limited) return limited;

    const { id } = await params;
    const { data, error } = await getConversation(supabase, id);

    if (error) {
      const status = error === "Konuşma bulunamadı" ? 404 : 500;
      const code = status === 404 ? "NOT_FOUND" : "INTERNAL_ERROR";
      return Response.json({ error, code }, { status });
    }

    return Response.json({ data });
  } catch (error) {
    console.error("[GET /api/conversations/[id]]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/conversations/[id] — Konuşmayı günceller
 */
export async function PATCH(request: Request, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`update:${user.id}`, { maxRequests: 30 });
    if (limited) return limited;

    const { id } = await params;
    const body = await request.json();
    const parsed = updateConversationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: parsed.error.issues[0]?.message || "Geçersiz veri",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await updateConversation(supabase, id, parsed.data);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data });
  } catch (error) {
    console.error("[PATCH /api/conversations/[id]]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/conversations/[id] — Konuşmayı siler
 */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`delete:${user.id}`, { maxRequests: 10 });
    if (limited) return limited;

    const { id } = await params;
    const { error } = await deleteConversation(supabase, id);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data: { deleted: true } });
  } catch (error) {
    console.error("[DELETE /api/conversations/[id]]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

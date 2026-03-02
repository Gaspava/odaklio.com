import { requireAuth } from "@/lib/middleware/auth";
import { applyRateLimit } from "@/lib/middleware/rate-limit";
import { createConversationSchema, listConversationsQuerySchema } from "@/lib/validators/chat";
import { createConversation, listConversations } from "@/lib/db/conversations";

/**
 * GET /api/conversations — Kullanıcının konuşmalarını listeler
 */
export async function GET(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`list:${user.id}`, { maxRequests: 60 });
    if (limited) return limited;

    const url = new URL(request.url);
    const params = Object.fromEntries(url.searchParams);
    const parsed = listConversationsQuerySchema.safeParse(params);

    if (!parsed.success) {
      return Response.json(
        { error: "Geçersiz sorgu parametreleri", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { data, count, error } = await listConversations(supabase, user.id, parsed.data);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data, count });
  } catch (error) {
    console.error("[GET /api/conversations]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/conversations — Yeni konuşma oluşturur
 */
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof Response) return auth;
    const { user, supabase } = auth;

    const limited = applyRateLimit(`create:${user.id}`, { maxRequests: 30 });
    if (limited) return limited;

    const body = await request.json();
    const parsed = createConversationSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        {
          error: parsed.error.issues[0]?.message || "Geçersiz veri",
          code: "VALIDATION_ERROR",
        },
        { status: 400 }
      );
    }

    const { data, error } = await createConversation(supabase, user.id, parsed.data);

    if (error) {
      return Response.json(
        { error, code: "INTERNAL_ERROR" },
        { status: 500 }
      );
    }

    return Response.json({ data }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/conversations]", error);
    return Response.json(
      { error: "Bir hata oluştu", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}

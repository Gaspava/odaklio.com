import { getAuthUser } from "../supabase-server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthResult {
  user: User;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, "public", any>;
}

/**
 * API route'larında auth kontrolü yapar.
 * Başarısız olursa hazır bir Response döner, handler bunu direkt return edebilir.
 *
 * Kullanım:
 * ```ts
 * const auth = await requireAuth();
 * if (auth instanceof Response) return auth;
 * const { user, supabase } = auth;
 * ```
 */
export async function requireAuth(): Promise<AuthResult | Response> {
  const { user, supabase } = await getAuthUser();

  if (!user) {
    return Response.json(
      { error: "Giriş yapmanız gerekiyor", code: "AUTH_REQUIRED" },
      { status: 401 }
    );
  }

  return { user, supabase } as AuthResult;
}

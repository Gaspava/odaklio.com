import { supabase } from "@/lib/supabase";

export async function POST() {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

    const res = await fetch(`${projectUrl}/functions/v1/daily-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ user_id: session.user.id }),
    });

    const data = await res.json();
    return Response.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserProfile } from "@/lib/db/profile";
import { supabase } from "@/lib/supabase";

/* ===== AGENT PROMPTS ===== */

const ORCHESTRATOR_PROMPT = `Sen bir soru analiz asistanısın. Görevin verilen soruyu analiz edip çözüm planı oluşturmak.

Verilen soruyu analiz et ve şu JSON formatında yanıt ver (sadece JSON, başka bir şey yazma):
{
  "complexity": "basit" | "orta" | "kompleks",
  "topic": "konunun kısa adı",
  "sub_tasks": ["Adım 1 açıklaması", "Adım 2 açıklaması", ...],
  "needs_calculation": true/false,
  "needs_research": true/false,
  "key_concepts": ["kavram1", "kavram2"]
}`;

const RESEARCHER_PROMPT = `Sen bir araştırmacı asistansın. Verilen konu hakkında temel bilgileri, formülleri, kavramları ve ilgili kuralları derle.
- Kısa ve öz ol
- Formüller varsa listele
- Temel kavramları tanımla
- Sık yapılan hataları belirt
Sadece araştırma sonuçlarını yaz, çözüm yapma.`;

const SOLVER_PROMPT = `Sen bir çözücü asistansın. Verilen araştırma bilgilerini kullanarak soruyu adım adım çöz.
- Her adımda hangi formülü/kuralı kullandığını belirt
- Ara sonuçları göster
- Net ve takip edilebilir adımlar yaz
- Sadece çözümü yaz, formatlama yapma`;

const VERIFIER_PROMPT = `Sen bir doğrulayıcı asistansın. Verilen çözümü farklı bir yöntemle kontrol et.
- Sonuçları bağımsız olarak doğrula
- Mantık hatası varsa belirt
- Birim kontrolü yap
- Sonucu "DOGRU" veya "HATALI: [açıklama]" ile bitir`;

const SYNTHESIZER_BASE = `Sen Odaklio AI'ın Derinlemesine Analiz asistanısın. Birden fazla AI ajanının araştırma, çözüm ve doğrulama sonuçlarını alıp öğrenciye mükemmel bir yanıt oluşturuyorsun.

Kuralların:
- Her zaman Türkçe yanıt ver
- Araştırma, çözüm ve doğrulama sonuçlarını sentezle
- Öğrenci profiline göre kişiselleştir
- Adım adım, net ve anlaşılır açıkla
- Matematiksel ifadelerde Unicode sembollerini kullan
- Markdown formatı kullan: başlıklar, kalın, italik, listeler, tablolar

Özel Bilgi Kutuları (her yanıtta en az 3-4 tane kullan):
- [!info] Bilgi başlığı - kavram tanımları
- [!tip] İpucu başlığı - pratik tavsiyeler
- [!warning] Uyarı başlığı - sık yapılan hatalar
- [!danger] Tehlike başlığı - kritik kurallar
- [!note] Not başlığı - ek bilgiler
- [!success] Başarı başlığı - motivasyon

Kutu formatı:
[!tip] Başlık
İçerik metni buraya.

Yanıt yapısı:
1. Konuya kısa giriş
2. Temel kavramlar (araştırmadan)
3. Adım adım çözüm (çözücüden)
4. Doğrulama notu (doğrulayıcıdan)
5. Özet ve önemli noktalar`;

function buildPersonalizationContext(profile: import("@/lib/db/profile").UserProfile): string {
  const parts: string[] = [];
  parts.push("\n\n--- OGRENCI PROFILI ---");

  if (profile.learning_modality) {
    const labels: Record<string, string> = { gorsel: "gorsel", metinsel: "metinsel", interaktif: "interaktif", karma: "karma" };
    parts.push(`Ogrenme stili: ${labels[profile.learning_modality] || profile.learning_modality}`);
  }
  if (profile.preferred_depth) {
    const labels: Record<string, string> = { yuzeysel: "yuzeysel/kisa", orta: "orta detay", derin: "derin/detayli" };
    parts.push(`Derinlik: ${labels[profile.preferred_depth] || profile.preferred_depth}`);
  }
  const strengths = Object.entries(profile.subjects_strength || {}).sort(([, a], [, b]) => b - a).slice(0, 3);
  if (strengths.length > 0) parts.push(`Guclu konulari: ${strengths.map(([s, v]) => `${s}(${v})`).join(", ")}`);
  const weaknesses = Object.entries(profile.subjects_weakness || {}).sort(([, a], [, b]) => b - a).slice(0, 3);
  if (weaknesses.length > 0) parts.push(`Gelisim alanlari: ${weaknesses.map(([s, v]) => `${s}(${v})`).join(", ")}`);
  if (profile.motivation_pattern) {
    const labels: Record<string, string> = {
      kendini_motive_eden: "kendini motive edebiliyor",
      tesvige_ihtiyac_duyan: "tesvige ihtiyac duyuyor",
      rekabetci: "rekabetci",
      karma: "karma",
    };
    parts.push(`Motivasyon: ${labels[profile.motivation_pattern] || profile.motivation_pattern}`);
  }
  if (profile.personality_summary) parts.push(`Profil: ${profile.personality_summary}`);
  parts.push("Bu bilgileri kullanarak yanitlarini ogrencinin seviyesine gore ayarla.");
  return parts.join("\n");
}

/* ===== HELPER: Run a single agent ===== */
async function runAgent(
  model: ReturnType<GoogleGenerativeAI["getGenerativeModel"]>,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    systemInstruction: systemPrompt,
  });
  return result.response.text();
}

/* ===== MAIN ROUTE ===== */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY ayarlanmamis." }, { status: 500 });
    }

    const body = await request.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: "Gecersiz mesaj formati." }, { status: 400 });
    }

    // Get user question (last message)
    const userQuestion = messages[messages.length - 1]?.content || "";

    // Build conversation context from history
    const historyContext = messages.length > 1
      ? "\n\nOnceki konusma:\n" + messages.slice(0, -1).map((m: { role: string; content: string }) =>
          `${m.role === "user" ? "Ogrenci" : "Asistan"}: ${m.content}`
        ).join("\n").slice(0, 2000)
      : "";

    // Load user profile
    let profileContext = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        if (profile) profileContext = buildPersonalizationContext(profile);
      }
    } catch { /* continue without profile */ }

    const genAI = new GoogleGenerativeAI(apiKey);
    const fastModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" });
    const mainModel = genAI.getGenerativeModel({ model: "gemini-3.1-flash" });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        const send = (event: string, data: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event, ...data })}\n\n`));
        };

        try {
          // Step 1: Orchestrator - Analyze the question
          send("progress", { step: "orchestrator", label: "Soru analiz ediliyor...", progress: 10 });

          let analysis: { complexity: string; topic: string; sub_tasks: string[]; needs_calculation: boolean; needs_research: boolean; key_concepts: string[] };
          try {
            const raw = await runAgent(fastModel, ORCHESTRATOR_PROMPT, userQuestion + historyContext);
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {
              complexity: "orta", topic: "genel", sub_tasks: ["Analiz et", "Coz"],
              needs_calculation: false, needs_research: true, key_concepts: []
            };
          } catch {
            analysis = {
              complexity: "orta", topic: "genel", sub_tasks: ["Analiz et", "Coz"],
              needs_calculation: false, needs_research: true, key_concepts: []
            };
          }

          send("progress", {
            step: "orchestrator_done",
            label: `Konu: ${analysis.topic}`,
            progress: 20,
            detail: `${analysis.sub_tasks.length} adimli cozum plani olusturuldu`
          });

          // Step 2: Researcher - Gather information (parallel with solver prep)
          send("progress", { step: "researcher", label: "Konu arastiriliyor...", progress: 30 });

          const researchPrompt = `Konu: ${analysis.topic}\nSoru: ${userQuestion}\nAnahtar kavramlar: ${analysis.key_concepts.join(", ")}\n\nBu konu hakkinda temel bilgileri, formulleri ve kavramlari derle.`;
          const researchResult = await runAgent(mainModel, RESEARCHER_PROMPT, researchPrompt);

          send("progress", { step: "researcher_done", label: "Arastirma tamamlandi", progress: 50 });

          // Step 3: Solver - Solve step by step
          send("progress", { step: "solver", label: "Cozum uretiliyor...", progress: 55 });

          const solverPrompt = `Soru: ${userQuestion}\n\nArastirma Sonuclari:\n${researchResult}\n\nCozum plani:\n${analysis.sub_tasks.map((s, i) => `${i + 1}. ${s}`).join("\n")}\n\nAdim adim coz.`;
          const solveResult = await runAgent(mainModel, SOLVER_PROMPT, solverPrompt);

          send("progress", { step: "solver_done", label: "Cozum hazir", progress: 70 });

          // Step 4: Verifier - Verify the solution
          send("progress", { step: "verifier", label: "Cozum dogrulaniyor...", progress: 75 });

          const verifyPrompt = `Soru: ${userQuestion}\n\nCozum:\n${solveResult}\n\nBu cozumu farkli bir yontemle dogrula.`;
          const verifyResult = await runAgent(mainModel, VERIFIER_PROMPT, verifyPrompt);

          const isCorrect = !verifyResult.includes("HATALI");
          send("progress", {
            step: "verifier_done",
            label: isCorrect ? "Cozum dogrulandi" : "Duzeltme yapiliyor...",
            progress: 85,
            verified: isCorrect
          });

          // If verification failed, re-solve
          let finalSolution = solveResult;
          if (!isCorrect) {
            send("progress", { step: "correction", label: "Duzeltilmis cozum uretiliyor...", progress: 88 });
            const correctionPrompt = `Soru: ${userQuestion}\n\nIlk cozum:\n${solveResult}\n\nDogrulama sonucu (HATALI):\n${verifyResult}\n\nHatalari duzelt ve dogru cozumu uret.`;
            finalSolution = await runAgent(mainModel, SOLVER_PROMPT, correctionPrompt);
          }

          // Step 5: Synthesizer - Create final response (streaming)
          send("progress", { step: "synthesizer", label: "Yanit hazirlaniyor...", progress: 90 });

          const synthPrompt = `Arastirma Sonuclari:\n${researchResult}\n\nCozum:\n${finalSolution}\n\nDogrulama: ${isCorrect ? "Cozum dogrulanmistir." : "Cozum duzeltilmistir."}\n${verifyResult}\n\nOgrenci Sorusu: ${userQuestion}${historyContext}`;

          const synthSystemPrompt = SYNTHESIZER_BASE + profileContext;

          const synthModel = genAI.getGenerativeModel({
            model: "gemini-3.1-flash",
            systemInstruction: synthSystemPrompt,
          });

          const synthChat = synthModel.startChat({ history: [] });
          const synthResult = await synthChat.sendMessageStream(synthPrompt);

          send("progress", { step: "streaming", label: "Yanit yaziliyor...", progress: 95 });

          for await (const chunk of synthResult.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ event: "progress", step: "done", label: "Tamamlandi", progress: 100 })}\n\n`));
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();

        } catch (err) {
          const msg = err instanceof Error ? err.message : "Bilinmeyen hata";
          send("error", { message: msg });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Bilinmeyen sunucu hatasi";
    console.error("[Deep Analysis API Error]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

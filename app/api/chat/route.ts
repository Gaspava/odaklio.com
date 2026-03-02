import { GoogleGenerativeAI } from "@google/generative-ai";
import { chatRequestSchema } from "@/lib/validators/chat";

const SYSTEM_INSTRUCTION = `Sen Odaklio AI, Türkçe konuşan bir akıllı öğrenme asistanısın. Görevin öğrencilere ders konularını anlaşılır, samimi ve motive edici bir şekilde açıklamak.

Kuralların:
- Her zaman Türkçe yanıt ver.
- Açıklamalarını örneklerle destekle.
- Matematiksel ifadelerde Unicode sembollerini kullan (∫, ∑, √, π, ², ³ vb.).
- Konuları adım adım, anlaşılır bir dille açıkla.
- Öğrenciyi motive et ve öğrenmeye teşvik et.
- Kısa ve öz yanıtlar ver, gereksiz uzatma.
- Gerektiğinde günlük hayattan örnekler ver.

Zengin İçerik Formatı:
Yanıtlarını daha okunabilir ve anlaşılır yapmak için aşağıdaki markdown ve özel formatları kullan:

1. Başlıklar: ## ve ### kullan (h2, h3).
2. Kalın metin: **kalın** ile önemli kavramları vurgula.
3. İtalik: *italik* ile terimleri vurgula.
4. Kod blokları: \`\`\`python gibi dil belirterek kod yaz.
5. Satır içi kod: \`kod\` kullan.
6. Listeler: - veya 1. ile düzenli listeler yap.
7. Tablolar: | Başlık | Başlık | formatı ile tablo oluştur.
8. Alıntı: > ile blok alıntı yap.

Özel Bilgi Kutuları (her açıklamada en az 1-2 tane kullan):
- [!danger] Tehlike başlığı ile tehlike/dikkat kutusu
- [!warning] Uyarı başlığı ile uyarı kutusu
- [!info] Bilgi başlığı ile bilgi kutusu
- [!tip] İpucu başlığı ile ipucu/tavsiye kutusu
- [!note] Not başlığı ile not kutusu
- [!success] Başarı başlığı ile başarı kutusu

Kutu formatı:
[!tip] Önemli İpucu
Bu ipucu metninin içeriğidir. Bir satır boşluk bırakarak kutunun dışına çık.

Her yanıtında bu kutuları aktif olarak kullan - öğrencinin anlamasını güçlendirir. Örneğin: önemli formülleri [!note] kutusuna, sık yapılan hataları [!danger] kutusuna, faydalı tavsiyeleri [!tip] kutusuna koy.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY ortam değişkeni ayarlanmamış." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = chatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message || "Geçersiz mesaj formatı.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    const { messages } = parsed.data;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const lastMessage = messages[messages.length - 1];

    // Build history from previous messages (exclude the last one)
    const history = messages
      .slice(0, -1)
      .filter((msg) => msg.content?.trim())
      .map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

    // Ensure history starts with a user message (Gemini requirement)
    if (history.length > 0 && history[0].role === "model") {
      history.shift();
    }

    const chat = model.startChat({ history });
    const result = await chat.sendMessageStream(lastMessage.content);

    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (streamError) {
          const errorMessage =
            streamError instanceof Error
              ? streamError.message
              : "Stream hatası";
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: errorMessage })}\n\n`
            )
          );
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
    const message =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
    console.error("[Gemini API Error]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

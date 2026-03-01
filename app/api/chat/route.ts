import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `Sen Odaklio AI, Türkçe konuşan bir akıllı öğrenme asistanısın. Görevin öğrencilere ders konularını anlaşılır, samimi ve motive edici bir şekilde açıklamak.

Kuralların:
- Her zaman Türkçe yanıt ver.
- Açıklamalarını örneklerle destekle.
- Matematiksel ifadelerde Unicode sembollerini kullan (∫, ∑, √, π, ², ³ vb.).
- Konuları adım adım, anlaşılır bir dille açıkla.
- Öğrenciyi motive et ve öğrenmeye teşvik et.
- Kısa ve öz yanıtlar ver, gereksiz uzatma.
- Gerektiğinde günlük hayattan örnekler ver.`;

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
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Geçersiz mesaj formatı." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const lastMessage = messages[messages.length - 1];

    // Build history from previous messages (exclude the last one)
    const history = messages
      .slice(0, -1)
      .filter((msg: { role: string; content: string }) => msg.content?.trim())
      .map((msg: { role: string; content: string }) => ({
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

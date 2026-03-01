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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY ortam değişkeni ayarlanmamış." },
      { status: 500 }
    );
  }

  const { messages } = await request.json();

  if (!messages || !Array.isArray(messages)) {
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

  // Convert messages to Gemini format
  const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1];

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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Bilinmeyen hata";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
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
}

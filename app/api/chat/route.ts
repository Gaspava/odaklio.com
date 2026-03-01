import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest } from "next/server";

const SYSTEM_PROMPT = `Sen Odaklio AI'sın — Türkçe konuşan, öğrencilere yardımcı olan bir yapay zeka öğrenme asistanısın.

Kuralların:
- Her zaman Türkçe cevap ver.
- Öğrencilere konuları sade, anlaşılır ve adım adım açıkla.
- Gerektiğinde örnekler, formüller ve benzetmeler kullan.
- Öğrenciyi motive et, pozitif bir ton kullan.
- Yanıtlarını düzenli paragraflar halinde yaz. Gerektiğinde numaralı liste veya madde işareti kullan.
- Matematiksel ifadeleri düz metin olarak yaz (örn: x² + 2x + 1, ∫ sin(x) dx).
- Kısa ve öz cevaplar ver; gereksiz uzatma.`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY ortam değişkeni ayarlanmamış." },
      { status: 500 }
    );
  }

  const { messages } = await req.json();

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Build Gemini chat history from messages
  const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const lastMessage = messages[messages.length - 1].content;

  const chat = model.startChat({
    history: [
      { role: "user", parts: [{ text: SYSTEM_PROMPT }] },
      { role: "model", parts: [{ text: "Anladım! Ben Odaklio AI, öğrenme asistanınızım. Size Türkçe olarak yardımcı olacağım." }] },
      ...history,
    ],
  });

  // Stream the response
  const result = await chat.sendMessageStream(lastMessage);

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
        const errMsg = error instanceof Error ? error.message : "Bilinmeyen hata";
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: errMsg })}\n\n`)
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

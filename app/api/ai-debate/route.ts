import { GoogleGenerativeAI } from "@google/generative-ai";

const AI_A_SYSTEM = (topic: string) => `Sen bir tartışma robotusun. Adın "Alpha". Şu fikri savunuyorsun: "${topic}"

Kuralların:
- Her zaman Türkçe yanıt ver.
- Bu fikri tutkuyla ve mantıklı argümanlarla savun.
- Karşı tarafın argümanlarına somut karşılıklar ver.
- Örnekler, istatistikler ve mantıksal çıkarımlar kullan.
- Saygılı ama kararlı bir üslup kullan.
- Yanıtlarını 2-4 paragraf arasında tut.
- Rakibinin zayıf noktalarını bul ve vurgula.
- Kendi tezini güçlendirecek yeni açılar bul.
- Markdown formatı kullan: **kalın** ile önemli noktaları vurgula.`;

const AI_B_SYSTEM = (topic: string) => `Sen bir tartışma robotusun. Adın "Beta". Şu fikri savunuyorsun: "${topic}"

Kuralların:
- Her zaman Türkçe yanıt ver.
- Bu fikri tutkuyla ve mantıklı argümanlarla savun.
- Karşı tarafın argümanlarına somut karşılıklar ver.
- Örnekler, istatistikler ve mantıksal çıkarımlar kullan.
- Saygılı ama kararlı bir üslup kullan.
- Yanıtlarını 2-4 paragraf arasında tut.
- Rakibinin zayıf noktalarını bul ve vurgula.
- Kendi tezini güçlendirecek yeni açılar bul.
- Markdown formatı kullan: **kalın** ile önemli noktaları vurgula.`;

const MODERATOR_REDIRECT = (direction: string) => `Moderatör tartışmayı şu yöne çekmek istiyor: "${direction}". Bu yeni açıdan kendi fikrini savunmaya devam et.`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "API anahtarı bulunamadı." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { topicA, topicB, history, speaker, moderatorNote } = body;

    if (!topicA || !topicB) {
      return Response.json(
        { error: "Her iki tarafın da fikri gerekli." },
        { status: 400 }
      );
    }

    if (!speaker || (speaker !== "A" && speaker !== "B")) {
      return Response.json(
        { error: "Geçersiz konuşmacı." },
        { status: 400 }
      );
    }

    const systemPrompt = speaker === "A"
      ? AI_A_SYSTEM(topicA)
      : AI_B_SYSTEM(topicB);

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: systemPrompt,
    });

    // Build chat history
    const chatHistory = (history || []).map((msg: { role: string; speaker: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.speaker === speaker ? msg.content : `Rakip diyor ki: ${msg.content}` }],
    }));

    // Ensure history starts with user
    if (chatHistory.length > 0 && chatHistory[0].role === "model") {
      chatHistory.shift();
    }

    const chat = model.startChat({ history: chatHistory });

    let prompt: string;
    if (!history || history.length === 0) {
      prompt = `Tartışmaya başla. Fikrini güçlü bir açılış argümanıyla savun. Konu: "${speaker === "A" ? topicA : topicB}" vs "${speaker === "A" ? topicB : topicA}"`;
    } else if (moderatorNote) {
      prompt = MODERATOR_REDIRECT(moderatorNote);
    } else {
      const lastMsg = history[history.length - 1];
      prompt = `Rakibin şöyle dedi: "${lastMsg.content}"\n\nBuna karşılık ver ve kendi fikrini savunmaya devam et.`;
    }

    const result = await chat.sendMessageStream([{ text: prompt }]);

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
    const message = error instanceof Error ? error.message : "Bilinmeyen hata";
    return Response.json({ error: message }, { status: 500 });
  }
}

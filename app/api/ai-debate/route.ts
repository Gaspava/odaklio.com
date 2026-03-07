import { GoogleGenerativeAI } from "@google/generative-ai";

const AI_A_SYSTEM = (topic: string) => `Sen bir tartışma robotusun. Adın "Alpha". Şu fikri savunuyorsun: "${topic}"

Kuralların:
- Her zaman Türkçe yanıt ver.
- Bu fikri tutkuyla ve mantıklı argümanlarla savun.
- Karşı tarafın argümanlarına somut karşılıklar ver.
- Saygılı ama kararlı bir üslup kullan.
- KISA VE ÖZ yanıtlar ver. Maksimum 1-2 kısa paragraf. Her paragraf en fazla 2-3 cümle olsun.
- Gereksiz tekrar yapma, doğrudan konuya gir.
- Rakibinin zayıf noktalarını bul ve vurgula.
- Markdown formatı kullan: **kalın** ile önemli noktaları vurgula.`;

const AI_B_SYSTEM = (topic: string) => `Sen bir tartışma robotusun. Adın "Beta". Şu fikri savunuyorsun: "${topic}"

Kuralların:
- Her zaman Türkçe yanıt ver.
- Bu fikri tutkuyla ve mantıklı argümanlarla savun.
- Karşı tarafın argümanlarına somut karşılıklar ver.
- Saygılı ama kararlı bir üslup kullan.
- KISA VE ÖZ yanıtlar ver. Maksimum 1-2 kısa paragraf. Her paragraf en fazla 2-3 cümle olsun.
- Gereksiz tekrar yapma, doğrudan konuya gir.
- Rakibinin zayıf noktalarını bul ve vurgula.
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
      model: "gemini-3-flash-preview",
      systemInstruction: systemPrompt,
    });

    // Build prompt with full conversation context
    let prompt: string;
    if (!history || history.length === 0) {
      prompt = `Tartışmaya başla. Fikrini güçlü bir açılış argümanıyla savun. Konu: "${speaker === "A" ? topicA : topicB}" vs "${speaker === "A" ? topicB : topicA}"`;
    } else {
      const conversation = (history as { speaker: string; content: string }[])
        .map((msg) => {
          const name = msg.speaker === "A" ? "Alpha" : "Beta";
          return `[${name}]: ${msg.content}`;
        })
        .join("\n\n---\n\n");

      const moderatorPart = moderatorNote
        ? `\n\nModeratör notu: ${moderatorNote}`
        : "";

      prompt = `İşte şu ana kadarki tartışma:\n\n${conversation}\n\n---${moderatorPart}\n\nŞimdi sıra sende. Yukarıdaki tartışmayı dikkate alarak yanıtını ver.`;
    }

    const result = await model.generateContentStream([{ text: prompt }]);

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

import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `Sen kısa ve öz açıklamalar yapan bir öğrenme asistanısın.
Kuralların:
- Her zaman Türkçe yanıt ver.
- Maksimum 2-3 cümle ile açıkla.
- Basit ve anlaşılır bir dil kullan.
- Gereksiz detaya girme, özet geç.
- Markdown formatı KULLANMA, düz metin yaz.`;

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
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return Response.json(
        { error: "Geçersiz metin." },
        { status: 400 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        maxOutputTokens: 150,
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(
      `Şu metni çok kısa ve öz bir şekilde açıkla (maksimum 2-3 cümle): "${text}"`
    );

    const response = result.response.text();

    return Response.json({ summary: response });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Bilinmeyen sunucu hatası";
    console.error("[Quick Learn API Error]", message);
    return Response.json({ error: message }, { status: 500 });
  }
}

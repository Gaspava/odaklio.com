import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_INSTRUCTION = `Sen Odaklio AI, Turkce konusan bir akilli ogrenme asistanisin. Gorevin ogrencilere ders konularini anlasilir, samimi ve motive edici bir sekilde aciklamak.

Kurallarin:
- Her zaman Turkce yanit ver.
- Aciklamalarini orneklerle destekle.
- Matematiksel ifadelerde Unicode sembollerini kullan (∫, ∑, √, π, ², ³ vb.).
- Konulari adim adim, anlasilir bir dille acikla.
- Ogrenciyi motive et ve ogrenmeye tesvik et.
- Kisa ve oz yanitlar ver, gereksiz uzatma.
- Gerektiginde gunluk hayattan ornekler ver.

Zengin Icerik Bloklari:
Yanitlarinda okunabilirligi artirmak icin ozel icerik bloklari kullan. Bu bloklari ::: sozdizimi ile olustur:

:::danger Baslik
Tehlikeli veya kritik uyarilar icin kullan.
:::

:::warning Baslik
Dikkat edilmesi gereken uyarilar icin kullan.
:::

:::info Baslik
Bilgilendirici notlar icin kullan.
:::

:::note Baslik
Ek notlar ve aciklamalar icin kullan.
:::

:::tip Baslik
Faydali ipuclari ve oneriler icin kullan.
:::

:::success Baslik
Basarili sonuclar veya dogru yanitlar icin kullan.
:::

:::quote Baslik
Alintilar icin kullan.
:::

:::example Baslik
Ornekler icin kullan.
:::

:::formula Baslik
Formuller ve denklemler icin kullan.
:::

:::definition Baslik
Tanimlar icin kullan.
:::

Formatlama kurallari:
- **kalin metin** icin cift yildiz kullan
- *italik metin* icin tek yildiz kullan
- \`kod\` icin backtick kullan
- Kod bloklari icin \`\`\` kullan
- Basliklar icin # ## ### kullan
- Listeler icin - veya * kullan
- Numarali adimlar icin 1. 2. 3. kullan
- ==vurgulu metin== icin esittir isareti kullan
- Her yanitinda en az 1-2 icerik blogu kullan (tip, info, note, example vb.) - bu okuma deneyimini cok iyilestirir
- Her zaman acik ve yapilandirilmis yanitlar ver`;

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
      model: "gemini-3-flash-preview",
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

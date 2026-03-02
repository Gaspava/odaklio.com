import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const { message } = await request.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Invalid message" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(
      `Bu mesaj için çok kısa bir Türkçe başlık üret (maksimum 5 kelime, emoji yok, tırnak işareti yok). Sadece başlığı yaz, başka bir şey yazma.\n\nMesaj: "${message.slice(0, 200)}"`
    );

    const title = result.response.text().trim().replace(/["']/g, "").slice(0, 100);

    return Response.json({ title });
  } catch (error) {
    console.error("[Title Generation Error]", error);
    return Response.json({ title: "Yeni Sohbet" });
  }
}

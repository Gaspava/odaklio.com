import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const { title } = await request.json();
    if (!title || typeof title !== "string") {
      return Response.json({ error: "Invalid title" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(
      `Bu sohbet başlığının ana ders/konu kategorisini belirle. Sadece kategori adını yaz, başka hiçbir şey yazma. Tek veya iki kelime olsun. Örnekler: "Matematik", "Fizik", "Türkçe", "Tarih", "Biyoloji", "İngilizce", "Kimya", "Programlama", "Genel Kültür".\n\nBaşlık: "${title.slice(0, 200)}"`
    );

    const subject = result.response.text().trim().replace(/["']/g, "").slice(0, 50);

    return Response.json({ subject });
  } catch (error) {
    console.error("[Subject Classification Error]", error);
    return Response.json({ subject: null });
  }
}

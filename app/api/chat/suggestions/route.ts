import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(request: Request) {
  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return Response.json({ suggestions: [] });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ suggestions: [] });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const result = await model.generateContent(
      `Aşağıdaki yapay zeka yanıtını okuyan bir öğrencinin sormak isteyebileceği en kritik ve merak uyandıran 3 soruyu Türkçe olarak üret. Her soru ayrı satırda olsun. Sadece soruları yaz, numaralama veya tire ekleme, başka hiçbir şey yazma.\n\nYanıt:\n${content.slice(0, 2000)}`
    );

    const text = result.response.text().trim();
    const suggestions = text
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 5)
      .slice(0, 3);

    return Response.json({ suggestions });
  } catch {
    return Response.json({ suggestions: [] });
  }
}

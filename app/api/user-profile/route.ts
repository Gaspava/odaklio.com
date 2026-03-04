import { GoogleGenerativeAI } from "@google/generative-ai";
import { aggregateAllUserData, upsertUserProfile } from "@/lib/db/profile";
import type { AggregatedUserData } from "@/lib/db/profile";
import { supabase } from "@/lib/supabase";

function buildProfilePrompt(data: AggregatedUserData): string {
  // Build compact but comprehensive data summary
  const lines: string[] = [];

  lines.push("=== KULLANICI VERİLERİ ===");
  lines.push(`Hesap yaşı: ${data.totalDaysActive} gün`);

  // Pomodoro stats
  lines.push(`\n--- POMODORO ---`);
  lines.push(`Toplam: ${data.totalPomodoros} (${data.completedPomodoros} tamamlanan, ${data.cancelledPomodoros} iptal)`);
  lines.push(`Tamamlama oranı: %${data.completionRate}`);
  lines.push(`Toplam çalışma: ${data.totalStudyMinutes} dakika`);
  lines.push(`Ortalama oturum: ${data.avgSessionMinutes} dakika`);

  // Subject breakdown
  if (Object.keys(data.subjectBreakdown).length > 0) {
    lines.push(`\nKonu dağılımı (dakika):`);
    const sorted = Object.entries(data.subjectBreakdown).sort(([, a], [, b]) => b - a);
    for (const [subject, minutes] of sorted) {
      lines.push(`  ${subject}: ${minutes} dk`);
    }
  }

  // Time distribution
  if (Object.keys(data.hourDistribution).length > 0) {
    lines.push(`\nSaat dağılımı (pomodoro sayısı):`);
    const hours = Object.entries(data.hourDistribution)
      .sort(([a], [b]) => Number(a) - Number(b));
    for (const [hour, count] of hours) {
      lines.push(`  ${hour}:00 → ${count} pomodoro`);
    }
  }

  if (Object.keys(data.dayDistribution).length > 0) {
    lines.push(`\nGün dağılımı:`);
    for (const [day, count] of Object.entries(data.dayDistribution)) {
      lines.push(`  ${day}: ${count} pomodoro`);
    }
  }

  // Conversation stats
  lines.push(`\n--- SOHBETLER ---`);
  lines.push(`Toplam sohbet: ${data.totalConversations}`);
  lines.push(`Toplam mesaj: ${data.totalMessages}`);
  lines.push(`Ortalama mesaj/sohbet: ${data.avgMessagesPerConversation}`);

  if (Object.keys(data.conversationsByType).length > 0) {
    lines.push(`Sohbet türleri:`);
    for (const [type, count] of Object.entries(data.conversationsByType)) {
      lines.push(`  ${type}: ${count}`);
    }
  }

  if (data.recentConversationTitles.length > 0) {
    lines.push(`\nSon sohbet başlıkları:`);
    for (const title of data.recentConversationTitles.slice(0, 15)) {
      lines.push(`  - ${title}`);
    }
  }

  // Interaction stats
  lines.push(`\n--- ETKİLEŞİMLER ---`);
  if (Object.keys(data.interactionCounts).length > 0) {
    for (const [type, count] of Object.entries(data.interactionCounts)) {
      lines.push(`${type}: ${count}`);
    }
  }
  lines.push(`Kaydedilen flashcard: ${data.totalFlashcardsSaved}`);
  lines.push(`Oluşturulan not: ${data.totalNotesCreated}`);
  lines.push(`Mindmap düğümü: ${data.totalMindmapNodes}`);
  lines.push(`Tamamlanan yol haritası adımı: ${data.totalRoadmapStepsCompleted}`);

  // Page usage
  if (Object.keys(data.pageTimeDistribution).length > 0) {
    lines.push(`\n--- SAYFA KULLANIMI (dakika) ---`);
    for (const [page, minutes] of Object.entries(data.pageTimeDistribution)) {
      lines.push(`${page}: ${minutes} dk`);
    }
  }

  // Study patterns
  lines.push(`\n--- ÇALIŞMA DÜZENİ ---`);
  lines.push(`Son 30 günde çalışma günü: ${data.studyDaysLast30}`);
  lines.push(`Mevcut seri: ${data.currentStreak} gün`);
  lines.push(`En uzun ara: ${data.longestGap} gün`);
  lines.push(`Ortalama günlük çalışma: ${data.avgDailyMinutes} dk`);

  if (data.recentDailyMinutes.length > 0) {
    lines.push(`\nSon günlük çalışma (dakika):`);
    for (const d of data.recentDailyMinutes.slice(0, 10)) {
      lines.push(`  ${d.date}: ${d.minutes} dk`);
    }
  }

  // Mentor usage
  if (Object.keys(data.mentorConversations).length > 0) {
    lines.push(`\n--- MENTOR KULLANIMI ---`);
    for (const [type, count] of Object.entries(data.mentorConversations)) {
      lines.push(`${type}: ${count} sohbet`);
    }
  }

  // Previous reports
  if (data.recentReportSummaries.length > 0) {
    lines.push(`\n--- ÖNCEKİ RAPORLAR ---`);
    for (const summary of data.recentReportSummaries) {
      lines.push(`- ${summary.slice(0, 200)}`);
    }
  }

  return lines.join("\n");
}

const PROFILING_SYSTEM_PROMPT = `Sen bir eğitim platformu kullanıcı analiz uzmanısın. Sana verilen kullanıcı verilerini analiz ederek detaylı bir öğrenci profili oluşturacaksın.

GÖREV: Aşağıdaki kullanıcı verilerini dikkatle analiz et ve JSON formatında bir profil oluştur.

VERİ AZ OLSA BİLE ANALİZ YAP. 1 mesaj bile olsa, eldeki verilerle en iyi analizi yap. Veri azsa, bunu profile yansıt ama yine de anlamlı çıkarımlar yap.

ÇIKTI FORMATI: Sadece geçerli JSON döndür, başka hiçbir şey yazma. Markdown kullanma.

JSON şeması:
{
  "learning_modality": "gorsel|metinsel|interaktif|karma",
  "preferred_depth": "yuzeysel|orta|derin",
  "preferred_pace": "hizli|orta|detayli",
  "peak_study_hours": [14, 15, 16],
  "preferred_session_minutes": 25,
  "study_consistency": "duzensiz|ara_sira|orta|duzenli|gunluk",
  "avg_daily_study_minutes": 60,
  "subjects_strength": {"Matematik": 85},
  "subjects_weakness": {"Turkce": 30},
  "subjects_interest": {"Matematik": 90, "Fizik": 60},
  "current_focus_subjects": ["Matematik", "Fizik"],
  "preferred_tools": {"chat": 40, "flashcard": 30, "mindmap": 15, "roadmap": 10, "note": 5},
  "mentor_preference": "coach|psych|buddy|expert|null",
  "completion_rate": 78,
  "motivation_pattern": "kendini_motive_eden|tesvige_ihtiyac_duyan|rekabetci|karma",
  "frustration_signals": ["fizik_konusunda_yuksek_iptal_orani"],
  "personality_summary": "Bu öğrenci hakkında detaylı 3-5 cümlelik profil özeti. Türkçe yaz.",
  "strengths_text": "Güçlü yönleri hakkında 2-3 cümle. Türkçe yaz.",
  "weaknesses_text": "Gelişim alanları hakkında 2-3 cümle. Türkçe yaz.",
  "recommendations": ["Öneri 1", "Öneri 2", "Öneri 3", "Öneri 4"],
  "overall_assessment": "Genel değerlendirme paragrafı. 3-5 cümle. Türkçe yaz."
}

KURALLAR:
- learning_modality: mindmap/görsel araç kullanımı yüksekse "gorsel", chat ağırlıklıysa "metinsel", flashcard/interaktif araç çoksa "interaktif", karma ise "karma"
- preferred_depth: uzun sohbetler ve çok mesaj atıyorsa "derin", kısa ve öz kullanıyorsa "yuzeysel"
- study_consistency: 30 günde 25+ gün çalışıyorsa "gunluk", 15-24 arası "duzenli", 8-14 arası "orta", 3-7 arası "ara_sira", 0-2 arası "duzensiz"
- subjects_strength: çok çalışılan ve tamamlama oranı yüksek konular (0-100 puan)
- subjects_weakness: az çalışılan veya iptal oranı yüksek konular (0-100 puan)
- preferred_tools: her aracın kullanım yüzdesi (toplam 100 olmalı)
- frustration_signals: iptal örüntüleri, düzensiz çalışma, belirli konularda çok kısa oturumlar vb.
- Tüm metin alanları Türkçe olmalı
- recommendations en az 3, en fazla 6 öneri içermeli
- Veri az olsa bile mantıklı çıkarımlar yap, "veri yetersiz" deme
- Sayısal değerler mantıklı aralıklarda olmalı (0-100)`;

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "API key missing" }, { status: 500 });
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Aggregate all user data
    const aggregatedData = await aggregateAllUserData(userId);
    const dataPrompt = buildProfilePrompt(aggregatedData);

    // Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview",
      systemInstruction: PROFILING_SYSTEM_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const result = await model.generateContent(dataPrompt);
    const responseText = result.response.text().trim();

    let profileData;
    try {
      profileData = JSON.parse(responseText);
    } catch {
      console.error("[Profile Parse Error]", responseText);
      return Response.json({ error: "Failed to parse profile response" }, { status: 500 });
    }

    // Save to database
    const savedProfile = await upsertUserProfile(userId, {
      learning_modality: profileData.learning_modality || null,
      preferred_depth: profileData.preferred_depth || null,
      preferred_pace: profileData.preferred_pace || null,
      peak_study_hours: profileData.peak_study_hours || null,
      preferred_session_minutes: profileData.preferred_session_minutes || null,
      study_consistency: profileData.study_consistency || null,
      avg_daily_study_minutes: profileData.avg_daily_study_minutes || null,
      subjects_strength: profileData.subjects_strength || {},
      subjects_weakness: profileData.subjects_weakness || {},
      subjects_interest: profileData.subjects_interest || {},
      current_focus_subjects: profileData.current_focus_subjects || null,
      preferred_tools: profileData.preferred_tools || {},
      mentor_preference: profileData.mentor_preference || null,
      completion_rate: profileData.completion_rate || null,
      motivation_pattern: profileData.motivation_pattern || null,
      frustration_signals: profileData.frustration_signals || null,
      personality_summary: profileData.personality_summary || null,
      strengths_text: profileData.strengths_text || null,
      weaknesses_text: profileData.weaknesses_text || null,
      recommendations: profileData.recommendations || null,
      overall_assessment: profileData.overall_assessment || null,
      raw_data_snapshot: {
        totalPomodoros: aggregatedData.totalPomodoros,
        totalMessages: aggregatedData.totalMessages,
        totalConversations: aggregatedData.totalConversations,
        studyDaysLast30: aggregatedData.studyDaysLast30,
      },
    });

    return Response.json({ profile: savedProfile });
  } catch (error) {
    console.error("[User Profile Error]", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

// GET endpoint to fetch existing profile
export async function GET() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { getUserProfile } = await import("@/lib/db/profile");
    const profile = await getUserProfile(session.user.id);
    return Response.json({ profile });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: msg }, { status: 500 });
  }
}

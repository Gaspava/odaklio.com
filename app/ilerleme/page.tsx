"use client";

import {
  IconClock,
  IconStar,
  IconLightning,
  IconTrendingUp,
  IconChevronRight,
} from "../components/icons/Icons";

export default function IlerlemePage() {
  const weeklyData = [
    { day: "Pzt", pomodoros: 6, minutes: 150 },
    { day: "Sal", pomodoros: 4, minutes: 100 },
    { day: "Çar", pomodoros: 8, minutes: 200 },
    { day: "Per", pomodoros: 5, minutes: 125 },
    { day: "Cum", pomodoros: 7, minutes: 175 },
    { day: "Cmt", pomodoros: 3, minutes: 75 },
    { day: "Paz", pomodoros: 2, minutes: 50 },
  ];

  const maxPomodoros = Math.max(...weeklyData.map((d) => d.pomodoros));

  const topicProgress = [
    { name: "Kuantum Fiziği", progress: 80, color: "var(--accent-primary)", sessions: 12 },
    { name: "Matematik - İntegral", progress: 65, color: "var(--accent-secondary)", sessions: 8 },
    { name: "Biyoloji - Hücre", progress: 45, color: "var(--accent-success)", sessions: 5 },
    { name: "Tarih - Osmanlı", progress: 30, color: "var(--accent-warning)", sessions: 3 },
  ];

  const recentSessions = [
    { subject: "Kuantum Fiziği", pomodoros: 4, duration: "100 dk", date: "Bugün" },
    { subject: "Matematik - İntegral", pomodoros: 3, duration: "75 dk", date: "Dün" },
    { subject: "Biyoloji - Hücre", pomodoros: 2, duration: "50 dk", date: "2 gün önce" },
    { subject: "Tarih - Osmanlı", pomodoros: 5, duration: "125 dk", date: "3 gün önce" },
  ];

  const mentorSuggestions = [
    { title: "Dalga-Parçacık İkiliği'ni tekrar et", tag: "Önerilen", color: "var(--accent-primary)" },
    { title: "İntegral pratik sorularını çöz", tag: "Soru Bankası", color: "var(--accent-warning)" },
    { title: "Hücre bölünmesi videosunu izle", tag: "Kaynak", color: "var(--accent-secondary)" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
            İlerleme
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
            Öğrenme yolculuğunu takip et
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-in" style={{ animationDelay: "0.05s" }}>
          {[
            { icon: IconClock, label: "Toplam Süre", value: "48s 30dk", change: "+5s", color: "var(--accent-primary)" },
            { icon: IconStar, label: "Tamamlanan", value: "35 tur", change: "+8", color: "var(--accent-success)" },
            { icon: IconLightning, label: "En Uzun Streak", value: "12 tur", change: "+3", color: "var(--accent-warning)" },
            { icon: IconTrendingUp, label: "Günlük Ort.", value: "5 tur", change: "+1", color: "var(--accent-secondary)" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card-static p-3.5 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{ background: `${stat.color}15`, color: stat.color }}
                  >
                    <Icon size={16} />
                  </div>
                  <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: "var(--accent-success)" }}>
                    <IconTrendingUp size={10} />
                    {stat.change}
                  </span>
                </div>
                <div className="text-lg sm:text-xl font-bold" style={{ color: "var(--text-primary)" }}>
                  {stat.value}
                </div>
                <div className="text-[10px] sm:text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Weekly Chart */}
        <div className="card-static p-4 sm:p-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-sm font-semibold mb-4 sm:mb-6" style={{ color: "var(--text-primary)" }}>
            Haftalık Pomodoro
          </h2>

          <div className="flex items-end justify-between gap-2 sm:gap-3" style={{ height: 140 }}>
            {weeklyData.map((day) => {
              const height = (day.pomodoros / maxPomodoros) * 100;
              const isToday = day.day === "Paz";
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1.5">
                  <span
                    className="text-[10px] sm:text-[11px] font-bold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {day.pomodoros}
                  </span>
                  <div
                    className="w-full rounded-lg transition-all"
                    style={{
                      height: `${height}%`,
                      minHeight: 8,
                      background: isToday ? "var(--gradient-primary)" : "var(--accent-primary)",
                      opacity: isToday ? 1 : 0.4,
                    }}
                  />
                  <span
                    className="text-[9px] sm:text-[10px] font-medium"
                    style={{ color: isToday ? "var(--accent-primary)" : "var(--text-tertiary)" }}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Topic Progress */}
        <div className="animate-fade-in" style={{ animationDelay: "0.15s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Konu İlerlemesi
          </h2>
          <div className="space-y-3">
            {topicProgress.map((topic) => (
              <div
                key={topic.name}
                className="card-static p-3.5 sm:p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs sm:text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                    {topic.name}
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: topic.color }}>
                    {topic.progress}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-tertiary)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${topic.progress}%`, background: topic.color }}
                  />
                </div>
                <span className="text-[10px] mt-1.5 block" style={{ color: "var(--text-tertiary)" }}>
                  {topic.sessions} oturum tamamlandı
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Son Oturumlar
          </h2>
          <div className="card-static overflow-hidden">
            {recentSessions.map((session, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3 transition-colors"
                style={{
                  borderBottom: i < recentSessions.length - 1 ? "1px solid var(--border-secondary)" : "none",
                }}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                    style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
                  >
                    {session.pomodoros}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                      {session.subject}
                    </div>
                    <div className="text-[10px] sm:text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                      {session.duration}
                    </div>
                  </div>
                </div>
                <span className="text-[10px] sm:text-[11px] flex-shrink-0 ml-2" style={{ color: "var(--text-tertiary)" }}>
                  {session.date}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Mentor Suggestions */}
        <div className="animate-fade-in" style={{ animationDelay: "0.25s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Mentor Önerileri
          </h2>
          <div className="space-y-2">
            {mentorSuggestions.map((item, i) => (
              <button
                key={i}
                className="w-full flex items-center gap-3 rounded-xl p-3.5 transition-all active:scale-[0.99] text-left"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: `${item.color}15`, color: item.color }}
                >
                  <IconLightning size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-[13px] font-medium truncate" style={{ color: "var(--text-primary)" }}>
                    {item.title}
                  </p>
                  <span className="text-[10px]" style={{ color: item.color }}>
                    {item.tag}
                  </span>
                </div>
                <IconChevronRight size={14} style={{ color: "var(--text-tertiary)" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Mind Map Preview */}
        <div className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>
            Zihin Haritası
          </h2>
          <div className="card-static p-4">
            <div
              className="rounded-xl overflow-hidden"
              style={{ height: 140, background: "var(--bg-tertiary)", position: "relative" }}
            >
              <svg width="100%" height="100%" viewBox="0 0 280 140">
                <line x1="140" y1="70" x2="60" y2="30" stroke="var(--accent-primary)" strokeWidth="1.5" strokeOpacity="0.3" />
                <line x1="140" y1="70" x2="220" y2="30" stroke="var(--accent-success)" strokeWidth="1.5" strokeOpacity="0.3" />
                <line x1="140" y1="70" x2="60" y2="110" stroke="var(--accent-warning)" strokeWidth="1.5" strokeOpacity="0.3" />
                <line x1="140" y1="70" x2="220" y2="110" stroke="var(--accent-danger)" strokeWidth="1.5" strokeOpacity="0.3" />

                <circle cx="140" cy="70" r="18" fill="var(--accent-primary)" fillOpacity="0.2" stroke="var(--accent-primary)" strokeWidth="1.5" />
                <text x="140" y="73" textAnchor="middle" fontSize="8" fill="var(--text-primary)" fontWeight="600">Fizik</text>

                <circle cx="60" cy="30" r="14" fill="var(--accent-primary)" fillOpacity="0.1" stroke="var(--accent-primary)" strokeWidth="1" />
                <text x="60" y="33" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Kuantum</text>

                <circle cx="220" cy="30" r="14" fill="var(--accent-success)" fillOpacity="0.1" stroke="var(--accent-success)" strokeWidth="1" />
                <text x="220" y="33" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Mekanik</text>

                <circle cx="60" cy="110" r="14" fill="var(--accent-warning)" fillOpacity="0.1" stroke="var(--accent-warning)" strokeWidth="1" />
                <text x="60" y="113" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Optik</text>

                <circle cx="220" cy="110" r="14" fill="var(--accent-danger)" fillOpacity="0.1" stroke="var(--accent-danger)" strokeWidth="1" />
                <text x="220" y="113" textAnchor="middle" fontSize="6" fill="var(--text-secondary)">Elektrik</text>
              </svg>
            </div>
            <button
              className="mt-3 w-full rounded-xl py-2.5 text-xs font-medium text-center transition-all active:scale-[0.98]"
              style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
            >
              Zihin Haritasını Aç
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

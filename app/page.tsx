"use client";

import {
  IconSpeedRead,
  IconFlashcard,
  IconPomodoro,
  IconMindMap,
  IconFocus,
  IconTrendingUp,
  IconClock,
  IconLightning,
  IconStar,
  IconBrain,
} from "./components/icons/Icons";
import RecommendationCards from "./components/recommendations/RecommendationCards";
import Link from "next/link";

const features = [
  {
    href: "/speed-reading",
    icon: IconSpeedRead,
    title: "Hızlı Okuma",
    desc: "Okuma hızını artır, kavrama gücünü geliştir",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    stat: "350 WPM",
  },
  {
    href: "/flashcards",
    icon: IconFlashcard,
    title: "Flashcard",
    desc: "Aralıklı tekrar ile kalıcı öğrenme",
    gradient: "linear-gradient(135deg, #3B82F6, #06B6D4)",
    stat: "128 Kart",
  },
  {
    href: "/pomodoro",
    icon: IconPomodoro,
    title: "Pomodoro",
    desc: "Zamanlayıcı ile odaklanmış çalışma",
    gradient: "linear-gradient(135deg, #EF4444, #F59E0B)",
    stat: "4 Tur",
  },
  {
    href: "/mindmap",
    icon: IconMindMap,
    title: "Mind Map",
    desc: "Bilgilerini görsel olarak bağla",
    gradient: "linear-gradient(135deg, #10B981, #06B6D4)",
    stat: "12 Harita",
  },
  {
    href: "/focus",
    icon: IconFocus,
    title: "Focus Modu",
    desc: "Özel odaklanma modları ve arka plan sesleri",
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    stat: "Aktif",
  },
];

const stats = [
  {
    icon: IconClock,
    label: "Toplam Çalışma",
    value: "24s 30dk",
    change: "+2.5s",
  },
  {
    icon: IconLightning,
    label: "Streak",
    value: "7 gün",
    change: "+1",
  },
  {
    icon: IconStar,
    label: "Tamamlanan",
    value: "156",
    change: "+12",
  },
  {
    icon: IconBrain,
    label: "Öğrenme Skoru",
    value: "87%",
    change: "+5%",
  },
];

export default function Dashboard() {
  return (
    <div className="p-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Hoş geldin! 👋
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Bugün ne öğrenmek istiyorsun? Hedeflerine ulaşmak için en iyi araçlar
          burada.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="card-static p-4">
              <div className="flex items-center justify-between mb-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{
                    background: "var(--accent-primary-light)",
                    color: "var(--accent-primary)",
                  }}
                >
                  <Icon size={18} />
                </div>
                <span
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: "var(--accent-success)" }}
                >
                  <IconTrendingUp size={12} />
                  {stat.change}
                </span>
              </div>
              <div
                className="text-xl font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs mt-0.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Araçlar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Link key={feature.href} href={feature.href}>
                <div className="card group cursor-pointer p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                      style={{ background: feature.gradient }}
                    >
                      <Icon size={20} />
                    </div>
                    <span className="badge badge-primary">{feature.stat}</span>
                  </div>
                  <h3
                    className="text-base font-semibold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {feature.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {feature.desc}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      <RecommendationCards />

      {/* Recent Activity */}
      <div className="mt-8">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--text-primary)" }}
        >
          Son Aktiviteler
        </h2>
        <div className="card-static divide-y" style={{ borderColor: "var(--border-primary)" }}>
          {[
            {
              title: "Fizik - Newton Yasaları",
              type: "Hızlı Okuma",
              time: "2 saat önce",
              icon: IconSpeedRead,
            },
            {
              title: "Matematik - İntegral",
              type: "Flashcard",
              time: "4 saat önce",
              icon: IconFlashcard,
            },
            {
              title: "Biyoloji - Hücre Yapısı",
              type: "Mind Map",
              time: "Dün",
              icon: IconMindMap,
            },
          ].map((activity, i) => {
            const Icon = activity.icon;
            return (
              <div
                key={i}
                className="flex items-center justify-between p-4 transition-colors hover:bg-[var(--bg-card-hover)]"
                style={{
                  borderColor: "var(--border-secondary)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-lg"
                    style={{
                      background: "var(--bg-tertiary)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    <Icon size={16} />
                  </div>
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {activity.title}
                    </div>
                    <div
                      className="text-xs"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {activity.type}
                    </div>
                  </div>
                </div>
                <span
                  className="text-xs"
                  style={{ color: "var(--text-tertiary)" }}
                >
                  {activity.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

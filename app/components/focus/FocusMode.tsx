"use client";

import { useState } from "react";
import {
  IconFocus,
  IconHeadphones,
  IconEye,
  IconBrain,
  IconLightning,
  IconMoon,
} from "../icons/Icons";

interface FocusModeOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  settings: {
    dimBackground: boolean;
    hideNotifications: boolean;
    ambientSound: string | null;
    timerMinutes: number;
    blockDistractions: boolean;
  };
}

const focusModes: FocusModeOption[] = [
  {
    id: "deep",
    name: "Derin Odaklanma",
    description:
      "Tam konsantrasyon. Tüm bildirimler kapalı, arka plan karartılmış, beyaz gürültü açık.",
    icon: <IconBrain size={24} />,
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    settings: {
      dimBackground: true,
      hideNotifications: true,
      ambientSound: "whitenoise",
      timerMinutes: 90,
      blockDistractions: true,
    },
  },
  {
    id: "reading",
    name: "Okuma Modu",
    description:
      "Uzun metinleri okumak için optimize edilmiş. Göz yorgunluğunu azaltan ışık ayarları.",
    icon: <IconEye size={24} />,
    gradient: "linear-gradient(135deg, #3B82F6, #06B6D4)",
    settings: {
      dimBackground: true,
      hideNotifications: true,
      ambientSound: "rain",
      timerMinutes: 45,
      blockDistractions: false,
    },
  },
  {
    id: "creative",
    name: "Yaratıcı Mod",
    description:
      "Mind map ve not alma için ideal. Hafif arka plan müziği ile rahat bir ortam.",
    icon: <IconLightning size={24} />,
    gradient: "linear-gradient(135deg, #F59E0B, #EF4444)",
    settings: {
      dimBackground: false,
      hideNotifications: false,
      ambientSound: "lofi",
      timerMinutes: 60,
      blockDistractions: false,
    },
  },
  {
    id: "night",
    name: "Gece Modu",
    description:
      "Gece çalışmaları için mavi ışık filtreli, düşük kontrast ve sakin sesler.",
    icon: <IconMoon size={24} />,
    gradient: "linear-gradient(135deg, #1E1B4B, #312E81)",
    settings: {
      dimBackground: true,
      hideNotifications: true,
      ambientSound: "fire",
      timerMinutes: 30,
      blockDistractions: true,
    },
  },
  {
    id: "music",
    name: "Müzik Modu",
    description:
      "Müzik eşliğinde çalışmak isteyenler için. Lo-fi beats ve ambient soundlar.",
    icon: <IconHeadphones size={24} />,
    gradient: "linear-gradient(135deg, #10B981, #06B6D4)",
    settings: {
      dimBackground: false,
      hideNotifications: false,
      ambientSound: "lofi",
      timerMinutes: 60,
      blockDistractions: false,
    },
  },
  {
    id: "zen",
    name: "Zen Modu",
    description:
      "Minimalist arayüz. Sadece metin ve içerik. Sıfır dikkat dağıtıcı.",
    icon: <IconFocus size={24} />,
    gradient: "linear-gradient(135deg, #64748B, #475569)",
    settings: {
      dimBackground: true,
      hideNotifications: true,
      ambientSound: null,
      timerMinutes: 120,
      blockDistractions: true,
    },
  },
];

export default function FocusModeSelector() {
  const [activeMode, setActiveMode] = useState<string | null>(null);
  const [customTimer, setCustomTimer] = useState(25);

  const activeModeData = focusModes.find((m) => m.id === activeMode);

  return (
    <div className="space-y-6">
      {/* Active Mode Banner */}
      {activeModeData && (
        <div
          className="rounded-2xl p-6 text-white relative overflow-hidden animate-fade-in"
          style={{ background: activeModeData.gradient }}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  {activeModeData.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{activeModeData.name}</h3>
                  <p className="text-sm text-white/70">Aktif</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMode(null)}
                className="rounded-xl bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm transition-colors hover:bg-white/30"
              >
                Sonlandır
              </button>
            </div>

            {/* Settings Preview */}
            <div className="mt-4 flex flex-wrap gap-2">
              {activeModeData.settings.dimBackground && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                  Karartılmış Arka Plan
                </span>
              )}
              {activeModeData.settings.hideNotifications && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                  Bildirimler Kapalı
                </span>
              )}
              {activeModeData.settings.ambientSound && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                  {activeModeData.settings.ambientSound}
                </span>
              )}
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs">
                {activeModeData.settings.timerMinutes} dk
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mode Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {focusModes.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <div
              key={mode.id}
              onClick={() => setActiveMode(isActive ? null : mode.id)}
              className="card group cursor-pointer p-5 relative overflow-hidden transition-all"
              style={{
                borderColor: isActive ? "var(--accent-primary)" : undefined,
              }}
            >
              {/* Gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: mode.gradient }}
              />

              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                  style={{ background: mode.gradient }}
                >
                  {mode.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {mode.name}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {mode.description}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <span
                      className="text-[10px] rounded-full px-2 py-0.5"
                      style={{
                        background: "var(--bg-tertiary)",
                        color: "var(--text-tertiary)",
                      }}
                    >
                      {mode.settings.timerMinutes} dk
                    </span>
                    {mode.settings.ambientSound && (
                      <span
                        className="text-[10px] rounded-full px-2 py-0.5"
                        style={{
                          background: "var(--bg-tertiary)",
                          color: "var(--text-tertiary)",
                        }}
                      >
                        {mode.settings.ambientSound}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {isActive && (
                <div
                  className="absolute top-3 right-3 h-3 w-3 rounded-full"
                  style={{
                    background: "var(--accent-success)",
                    boxShadow: "0 0 8px var(--accent-success)",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Custom Timer */}
      <div className="card-static p-5">
        <h3
          className="text-sm font-semibold mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          Özel Zamanlayıcı
        </h3>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="5"
            max="180"
            step="5"
            value={customTimer}
            onChange={(e) => setCustomTimer(Number(e.target.value))}
            className="flex-1 h-1.5 cursor-pointer appearance-none rounded-full"
            style={{ accentColor: "var(--accent-primary)" }}
          />
          <span
            className="min-w-[60px] rounded-lg px-3 py-1.5 text-center text-sm font-bold"
            style={{
              background: "var(--accent-primary-light)",
              color: "var(--accent-primary)",
            }}
          >
            {customTimer} dk
          </span>
          <button className="btn-primary text-sm">Başlat</button>
        </div>
      </div>
    </div>
  );
}

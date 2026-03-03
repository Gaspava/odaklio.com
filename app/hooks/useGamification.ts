"use client";

import { useCallback } from "react";

const KEYS = {
  streak: "odaklio-streak",
  lastActive: "odaklio-last-active",
  xp: "odaklio-xp",
  badges: "odaklio-badges",
  stats: "odaklio-stats",
};

export interface UserStats {
  totalMessages: number;
  totalFlashcards: number;
  totalRoadmaps: number;
  totalMindmaps: number;
  pomodorosCompleted: number;
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
}

const ALL_BADGES: Omit<Badge, "earned" | "earnedAt">[] = [
  { id: "first_chat", name: "İlk Adım", emoji: "👋", description: "İlk sohbeti başlat" },
  { id: "ten_messages", name: "Konuşkan", emoji: "💬", description: "10 mesaj gönder" },
  { id: "hundred_messages", name: "100 Mesaj", emoji: "🏅", description: "100 mesaj gönder" },
  { id: "first_flashcard", name: "İlk Kart", emoji: "🃏", description: "İlk flashcard oluştur" },
  { id: "first_roadmap", name: "Rotacı", emoji: "🗺️", description: "İlk roadmap oluştur" },
  { id: "first_mindmap", name: "Zihin Haritacı", emoji: "🧠", description: "İlk mindmap oluştur" },
  { id: "streak_3", name: "3 Gün Serisi", emoji: "🔥", description: "3 gün üst üste giriş yap" },
  { id: "streak_7", name: "Haftalık Kahraman", emoji: "⭐", description: "7 gün üst üste giriş yap" },
  { id: "streak_30", name: "30 Gün Ustası", emoji: "🏆", description: "30 gün üst üste giriş yap" },
  { id: "pomodoro_5", name: "Odaklı", emoji: "⏱️", description: "5 pomodoro tamamla" },
];

function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStreak(): { current: number; longest: number } {
  return load(KEYS.streak, { current: 0, longest: 0 });
}

export function getXP(): number {
  return load(KEYS.xp, 0);
}

export function getBadges(): Badge[] {
  const earned: Record<string, string> = load(KEYS.badges, {});
  return ALL_BADGES.map((b) => ({
    ...b,
    earned: !!earned[b.id],
    earnedAt: earned[b.id],
  }));
}

export function getStats(): UserStats {
  return load(KEYS.stats, {
    totalMessages: 0,
    totalFlashcards: 0,
    totalRoadmaps: 0,
    totalMindmaps: 0,
    pomodorosCompleted: 0,
  });
}

function updateStreak(): { current: number; longest: number; isNew: boolean } {
  const today = new Date().toDateString();
  const lastActive = load<string>(KEYS.lastActive, "");
  const streak = load<{ current: number; longest: number }>(KEYS.streak, { current: 0, longest: 0 });

  if (lastActive === today) {
    return { ...streak, isNew: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  let newCurrent: number;
  if (lastActive === yesterday.toDateString()) {
    newCurrent = streak.current + 1;
  } else {
    newCurrent = 1;
  }

  const newLongest = Math.max(streak.longest, newCurrent);
  const newStreak = { current: newCurrent, longest: newLongest };

  save(KEYS.lastActive, today);
  save(KEYS.streak, newStreak);

  return { ...newStreak, isNew: true };
}

function awardBadge(badgeId: string): boolean {
  const earned: Record<string, string> = load(KEYS.badges, {});
  if (earned[badgeId]) return false;
  earned[badgeId] = new Date().toISOString();
  save(KEYS.badges, earned);
  return true;
}

function addXP(amount: number): number {
  const current = load<number>(KEYS.xp, 0);
  const next = current + amount;
  save(KEYS.xp, next);
  return next;
}

export function useGamification() {
  const recordActivity = useCallback(
    (
      type: "message" | "flashcard" | "roadmap" | "mindmap" | "pomodoro",
      onBadgeEarned?: (badge: Badge) => void
    ) => {
      // Update streak
      updateStreak();

      // Update XP
      const xpMap: Record<string, number> = {
        message: 5,
        flashcard: 15,
        roadmap: 20,
        mindmap: 20,
        pomodoro: 25,
      };
      addXP(xpMap[type] || 5);

      // Update stats
      const stats = getStats();
      if (type === "message") stats.totalMessages += 1;
      if (type === "flashcard") stats.totalFlashcards += 1;
      if (type === "roadmap") stats.totalRoadmaps += 1;
      if (type === "mindmap") stats.totalMindmaps += 1;
      if (type === "pomodoro") stats.pomodorosCompleted += 1;
      save(KEYS.stats, stats);

      // Check badges
      const streak = getStreak();

      const badgeChecks: [string, boolean][] = [
        ["first_chat", type === "message" && stats.totalMessages >= 1],
        ["ten_messages", stats.totalMessages >= 10],
        ["hundred_messages", stats.totalMessages >= 100],
        ["first_flashcard", type === "flashcard" && stats.totalFlashcards >= 1],
        ["first_roadmap", type === "roadmap" && stats.totalRoadmaps >= 1],
        ["first_mindmap", type === "mindmap" && stats.totalMindmaps >= 1],
        ["streak_3", streak.current >= 3],
        ["streak_7", streak.current >= 7],
        ["streak_30", streak.current >= 30],
        ["pomodoro_5", stats.pomodorosCompleted >= 5],
      ];

      for (const [id, condition] of badgeChecks) {
        if (condition && awardBadge(id) && onBadgeEarned) {
          const badge = ALL_BADGES.find((b) => b.id === id);
          if (badge) {
            onBadgeEarned({ ...badge, earned: true, earnedAt: new Date().toISOString() });
          }
        }
      }
    },
    []
  );

  return { recordActivity, getStreak, getXP, getBadges, getStats };
}

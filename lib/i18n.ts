"use client";

import { createContext, useContext } from "react";

export type Locale = "tr" | "en";

export const translations = {
  tr: {
    appName: "Odaklio",
    dashboard: "Ana Sayfa",
    welcome: "Hoş Geldiniz",
    welcomeDesc: "Öğrenme yolculuğunuza başlayın",
    quickAccess: "Hızlı Erişim",
    mentor: "Mentor",
    mentorDesc: "Öğrenme asistanınız",
    mentorPlaceholder: "Mentora bir soru sorun...",
    search: "Ara...",
    theme: "Tema",
    darkMode: "Karanlık Mod",
    lightMode: "Aydınlık Mod",
    language: "Dil",
    settings: "Ayarlar",
    comingSoon: "Yakında",
    startLearning: "Öğrenmeye Başla",
    backgroundSounds: "Arka Plan Sesleri",
    collapse: "Daralt",
    expand: "Genişlet",
    close: "Kapat",
    send: "Gönder",
    typeMessage: "Mesajınızı yazın...",
    start: "Başla",
    pause: "Duraklat",
    reset: "Sıfırla",
    sessions: "Oturumlar",
    newDeck: "Yeni Deste",
    flip: "Çevir",
    easy: "Kolay",
    medium: "Orta",
    hard: "Zor",
    speed: "Hız",
    wpm: "kelime/dk",
    play: "Oynat",
    stop: "Durdur",
    notFound: "Sayfa Bulunamadı",
    goHome: "Ana Sayfaya Dön",
    recentSearches: "Son Aramalar",
    recommendations: "Öneriler",
    relatedQuestions: "İlgili Sorular",
  },
  en: {
    appName: "Odaklio",
    dashboard: "Dashboard",
    welcome: "Welcome",
    welcomeDesc: "Start your learning journey",
    quickAccess: "Quick Access",
    mentor: "Mentor",
    mentorDesc: "Your learning assistant",
    mentorPlaceholder: "Ask the mentor a question...",
    search: "Search...",
    theme: "Theme",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    language: "Language",
    settings: "Settings",
    comingSoon: "Coming Soon",
    startLearning: "Start Learning",
    backgroundSounds: "Background Sounds",
    collapse: "Collapse",
    expand: "Expand",
    close: "Close",
    send: "Send",
    typeMessage: "Type your message...",
    start: "Start",
    pause: "Pause",
    reset: "Reset",
    sessions: "Sessions",
    newDeck: "New Deck",
    flip: "Flip",
    easy: "Easy",
    medium: "Medium",
    hard: "Hard",
    speed: "Speed",
    wpm: "wpm",
    play: "Play",
    stop: "Stop",
    notFound: "Page Not Found",
    goHome: "Go Home",
    recentSearches: "Recent Searches",
    recommendations: "Recommendations",
    relatedQuestions: "Related Questions",
  },
} as const;

export type TranslationKey = keyof typeof translations.tr;

export interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey) => string;
}

export const I18nContext = createContext<I18nContextValue>({
  locale: "tr",
  setLocale: () => {},
  t: (key) => translations.tr[key],
});

export function useI18n() {
  return useContext(I18nContext);
}

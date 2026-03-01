"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n";
import { NAV_ITEMS } from "@/lib/constants";
import { Card, Button } from "@/components/ui";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { MentorPanel } from "@/components/features/mentor/mentor-panel";
import { SoundPlayer } from "@/components/features/ambience/sound-player";
import type { FeatureId } from "@/types/navigation";

// Feature components
import { ReadingDisplay } from "@/components/features/speed-reading/reading-display";
import { SpeedControls } from "@/components/features/speed-reading/speed-controls";
import { ChatWindow } from "@/components/features/chatbot/chat-window";
import { ChatInput } from "@/components/features/chatbot/chat-input";
import { TimerDisplay } from "@/components/features/pomodoro/timer-display";
import { TimerControls } from "@/components/features/pomodoro/timer-controls";
import { SessionTracker } from "@/components/features/pomodoro/session-tracker";
import { DeckList } from "@/components/features/flashcards/deck-list";
import { CardViewer } from "@/components/features/flashcards/card-viewer";
import { ModeSelector } from "@/components/features/focus-mode/mode-selector";
import { VisualizedText } from "@/components/features/content/visualized-text";
import { MapCanvas } from "@/components/features/mind-map/map-canvas";
import { MapToolbar } from "@/components/features/mind-map/map-toolbar";
import { SearchBar } from "@/components/features/search/search-bar";
import { SearchHistory } from "@/components/features/search/search-history";
import { RecommendationCards } from "@/components/features/search/recommendation-cards";
import { SettingsPanel } from "@/components/features/settings/settings-panel";

function DashboardView({ onSelect }: { onSelect: (id: FeatureId) => void }) {
  const { locale, t } = useI18n();

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
          {t("welcome")}
        </h1>
        <p className="text-lg text-muted max-w-2xl mx-auto">
          {t("welcomeDesc")}
        </p>
      </div>

      <h2 className="text-xl font-semibold text-foreground">{t("quickAccess")}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.id}
              variant="interactive"
              className="flex items-start gap-4"
              onClick={() => onSelect(item.id)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-muted text-accent shrink-0">
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{item.label[locale]}</h3>
                <p className="text-sm text-muted mt-0.5">{item.description[locale]}</p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function SpeedReadingView() {
  const { locale } = useI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Hızlı Okuma" : "Speed Reading"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Okuma hızınızı artırın ve metinleri daha verimli okuyun" : "Improve your reading speed and read texts more efficiently"}
        </p>
      </div>
      <ReadingDisplay />
      <SpeedControls />
    </div>
  );
}

function ChatView() {
  const { locale } = useI18n();
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-48px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "AI Sohbet" : "AI Chat"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Yapay zeka ile sohbet edin ve sorularınıza yanıt alın" : "Chat with AI and get answers to your questions"}
        </p>
      </div>
      <ChatWindow />
      <ChatInput />
    </div>
  );
}

function PomodoroView() {
  const { locale } = useI18n();
  return (
    <div className="mx-auto max-w-md space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pomodoro</h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Odaklı çalışma seanslarınızı yönetin" : "Manage your focused study sessions"}
        </p>
      </div>
      <TimerDisplay />
      <TimerControls />
      <SessionTracker />
    </div>
  );
}

function FlashcardsView() {
  const { locale, t } = useI18n();
  const [viewDeck, setViewDeck] = useState(false);

  if (viewDeck) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => setViewDeck(false)}>
            ← {locale === "tr" ? "Geri" : "Back"}
          </Button>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "tr" ? "Kart Destesi" : "Card Deck"}
          </h1>
        </div>
        <CardViewer />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "tr" ? "Kartlar" : "Flashcards"}
          </h1>
          <p className="mt-1 text-muted">
            {locale === "tr" ? "Bilgi kartlarıyla öğrenmenizi pekiştirin" : "Reinforce your learning with flashcards"}
          </p>
        </div>
        <Button>{t("newDeck")}</Button>
      </div>
      <div onClick={() => setViewDeck(true)}>
        <DeckList />
      </div>
    </div>
  );
}

function FocusModeView() {
  const { locale } = useI18n();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Odak Modu" : "Focus Mode"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Çalışma tarzınıza uygun odak modunu seçin" : "Choose the focus mode that suits your study style"}
        </p>
      </div>
      <ModeSelector />
    </div>
  );
}

function VisualTextView() {
  const { locale } = useI18n();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Görsel Metinler" : "Visual Texts"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Metinleri görselleştirilmiş ve etkileşimli şekilde inceleyin" : "Explore texts in a visualized and interactive way"}
        </p>
      </div>
      <VisualizedText />
    </div>
  );
}

function MindMapView() {
  const { locale } = useI18n();
  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-48px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "tr" ? "Zihin Haritası" : "Mind Map"}
          </h1>
          <p className="mt-1 text-muted">
            {locale === "tr" ? "Fikirlerinizi görsel olarak organize edin" : "Visually organize your ideas"}
          </p>
        </div>
        <MapToolbar />
      </div>
      <MapCanvas />
    </div>
  );
}

function SearchView() {
  const { locale, t } = useI18n();
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Arama" : "Search"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Arama geçmişinizi görüntüleyin ve kişiselleştirilmiş öneriler alın" : "View your search history and get personalized recommendations"}
        </p>
      </div>
      <SearchBar />
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t("recentSearches")}</h2>
        <SearchHistory />
      </div>
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">{t("recommendations")}</h2>
        <RecommendationCards />
      </div>
    </div>
  );
}

function FeatureContent({ activeId, onSelect }: { activeId: FeatureId; onSelect: (id: FeatureId) => void }) {
  switch (activeId) {
    case "dashboard":
      return <DashboardView onSelect={onSelect} />;
    case "hizli-okuma":
      return <SpeedReadingView />;
    case "sohbet":
      return <ChatView />;
    case "pomodoro":
      return <PomodoroView />;
    case "kartlar":
      return <FlashcardsView />;
    case "odak-modu":
      return <FocusModeView />;
    case "metin-gorsel":
      return <VisualTextView />;
    case "zihin-haritasi":
      return <MindMapView />;
    case "arama":
      return <SearchView />;
    case "ayarlar":
      return <SettingsPanel />;
    default:
      return <DashboardView onSelect={onSelect} />;
  }
}

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState<FeatureId>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar activeId={activeFeature} onSelect={setActiveFeature} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header activeId={activeFeature} onSelect={setActiveFeature} />
        <main className="flex-1 overflow-y-auto p-6">
          <FeatureContent activeId={activeFeature} onSelect={setActiveFeature} />
        </main>
      </div>
      <MentorPanel />
      <SoundPlayer />
    </div>
  );
}

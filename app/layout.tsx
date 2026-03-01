import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import ChatBot from "./components/chatbot/ChatBot";
import BackgroundSound from "./components/background-sound/BackgroundSound";

export const metadata: Metadata = {
  title: "Odaklio - Akıllı Öğrenme Platformu",
  description:
    "AI destekli hızlı okuma, flashcard, mind map, pomodoro ve daha fazlasıyla öğrenme deneyimini dönüştür.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div
              className="flex flex-1 flex-col"
              style={{ marginLeft: "var(--sidebar-width)" }}
            >
              <Header />
              <main
                className="flex-1 overflow-y-auto"
                style={{
                  paddingTop: "var(--header-height)",
                  background: "var(--bg-primary)",
                }}
              >
                {children}
              </main>
            </div>
          </div>

          {/* Floating Components */}
          <ChatBot />
          <BackgroundSound />
        </ThemeProvider>
      </body>
    </html>
  );
}

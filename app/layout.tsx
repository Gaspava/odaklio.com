import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";
import ConversationProvider from "./providers/ConversationProvider";
import PomodoroProvider from "./providers/PomodoroProvider";
import PageTrackingProvider from "./providers/PageTrackingProvider";

export const metadata: Metadata = {
  title: "Odaklio - Akıllı Öğrenme Platformu",
  description:
    "AI destekli hızlı okuma, flashcard, mind map, pomodoro ve daha fazlasıyla öğrenme deneyimini dönüştür.",
  icons: {
    icon: "/odaklio-logo.svg",
    shortcut: "/odaklio-logo.svg",
    apple: "/odaklio-logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <ConversationProvider>
              <PomodoroProvider>
                <PageTrackingProvider>{children}</PageTrackingProvider>
              </PomodoroProvider>
            </ConversationProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

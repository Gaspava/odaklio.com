import type { Metadata, Viewport } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";
import AuthProvider from "./providers/AuthProvider";
import ConversationProvider from "./providers/ConversationProvider";
import ToastProvider from "./providers/ToastProvider";
import FontSizeProvider from "./providers/FontSizeProvider";

export const metadata: Metadata = {
  title: "Odaklio - Akıllı Öğrenme Platformu",
  description:
    "AI destekli hızlı okuma, flashcard, mind map, pomodoro ve daha fazlasıyla öğrenme deneyimini dönüştür.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Odaklio",
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
      <body className="antialiased">
        <ThemeProvider>
          <FontSizeProvider>
            <AuthProvider>
              <ConversationProvider>
                <ToastProvider>{children}</ToastProvider>
              </ConversationProvider>
            </AuthProvider>
          </FontSizeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

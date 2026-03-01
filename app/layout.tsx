import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "./providers/ThemeProvider";

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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

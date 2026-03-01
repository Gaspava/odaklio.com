"use client";

import { useState, useCallback } from "react";
import { ThemeProvider } from "./theme-provider";
import { I18nContext, type Locale, translations, type TranslationKey } from "@/lib/i18n";

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("tr");

  const t = useCallback(
    (key: TranslationKey) => translations[locale][key],
    [locale]
  );

  return (
    <ThemeProvider>
      <I18nContext.Provider value={{ locale, setLocale, t }}>
        {children}
      </I18nContext.Provider>
    </ThemeProvider>
  );
}

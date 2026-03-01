"use client";

import { useTheme } from "next-themes";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui";

export function SettingsPanel() {
  const { theme, setTheme } = useTheme();
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t("settings")}</h1>
        <p className="mt-1 text-muted">
          {locale === "tr" ? "Platform tercihlerinizi yönetin" : "Manage your platform preferences"}
        </p>
      </div>

      <Card>
        <h3 className="font-semibold text-foreground mb-4">{t("theme")}</h3>
        <div className="flex gap-3" suppressHydrationWarning>
          {(["dark", "light", "system"] as const).map((themeOption) => (
            <button
              key={themeOption}
              onClick={() => setTheme(themeOption)}
              className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors cursor-pointer ${
                theme === themeOption
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-foreground border border-border hover:bg-surface-hover"
              }`}
              suppressHydrationWarning
            >
              {themeOption === "dark" ? "Dark" : themeOption === "light" ? "Light" : "System"}
            </button>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-foreground mb-4">{t("language")}</h3>
        <div className="flex gap-3">
          {(["tr", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLocale(lang)}
              className={`px-4 py-2 rounded-[var(--radius-md)] text-sm font-medium transition-colors cursor-pointer ${
                locale === lang
                  ? "bg-accent text-accent-foreground"
                  : "bg-surface text-foreground border border-border hover:bg-surface-hover"
              }`}
            >
              {lang === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

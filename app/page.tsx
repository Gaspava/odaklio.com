"use client";

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n";
import { Card } from "@/components/ui";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Globe } from "lucide-react";

export default function HomePage() {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-[var(--radius-md)] bg-accent flex items-center justify-center text-accent-foreground font-bold">
            O
          </div>
          <span className="text-xl font-bold text-foreground">Odaklio</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
            className="flex h-9 items-center gap-1.5 px-2 rounded-[var(--radius-md)] text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <Globe size={16} />
            <span className="uppercase text-xs font-medium">{locale}</span>
          </button>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t("welcome")}
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            {t("welcomeDesc")}
          </p>
          <Link
            href="/hizli-okuma"
            className="inline-flex h-12 items-center px-8 mt-8 rounded-[var(--radius-full)] bg-accent text-accent-foreground font-medium hover:bg-accent-hover transition-colors"
          >
            {t("startLearning")}
          </Link>
        </div>

        <h2 className="text-xl font-semibold text-foreground mb-6">{t("quickAccess")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card variant="interactive" className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-muted text-accent shrink-0">
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {item.label[locale]}
                    </h3>
                    <p className="text-sm text-muted mt-0.5">
                      {item.description[locale]}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}

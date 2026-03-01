"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";

export default function NotFound() {
  const { t } = useI18n();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-accent">404</h1>
        <p className="text-xl text-foreground">{t("notFound")}</p>
        <Link href="/">
          <Button variant="secondary">{t("goHome")}</Button>
        </Link>
      </div>
    </div>
  );
}

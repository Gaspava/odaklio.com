"use client";

import { useI18n } from "@/lib/i18n";
import { SearchBar } from "@/components/features/search/search-bar";
import { SearchHistory } from "@/components/features/search/search-history";
import { RecommendationCards } from "@/components/features/search/recommendation-cards";

export default function SearchPage() {
  const { locale, t } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Arama" : "Search"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Arama geçmişinizi görüntüleyin ve kişiselleştirilmiş öneriler alın"
            : "View your search history and get personalized recommendations"}
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

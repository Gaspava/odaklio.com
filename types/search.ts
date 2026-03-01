export interface SearchQuery {
  id: string;
  query: string;
  timestamp: Date;
  resultCount: number;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "soru" | "konu" | "kaynak";
  relevanceScore: number;
  href: string;
}

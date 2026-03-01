export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  cardCount: number;
  lastStudied: Date | null;
  createdAt: Date;
  tags: string[];
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  difficulty: "kolay" | "orta" | "zor";
  nextReview: Date | null;
  reviewCount: number;
}

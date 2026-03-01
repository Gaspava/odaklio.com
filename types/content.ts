export interface ContentAnnotation {
  id: string;
  contentId: string;
  type: "not-understood" | "question" | "highlight";
  startOffset: number;
  endOffset: number;
  text: string;
  question?: string;
  answer?: string;
  createdAt: Date;
}

export interface VisualizedContent {
  id: string;
  title: string;
  rawText: string;
  hasLatex: boolean;
  annotations: ContentAnnotation[];
}

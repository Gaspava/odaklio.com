import type { PageType } from "@/app/components/layout/Sidebar";

export const PAGE_ROUTES: Record<PageType, string> = {
  focus: "/",
  history: "/gecmis",
  mentor: "/mentor",
  analysis: "/analiz",
  notes: "/notlarim",
  flashcards: "/flash-kartlar",
  roadmaps: "/yol-haritalari",
  "pomodoro-tool": "/pomodoro-arac",
  speedread: "/hizli-okuma",
};

export const ROUTE_TO_PAGE: Record<string, PageType> = {
  "/": "focus",
  "/gecmis": "history",
  "/mentor": "mentor",
  "/analiz": "analysis",
  "/notlarim": "notes",
  "/flash-kartlar": "flashcards",
  "/yol-haritalari": "roadmaps",
  "/pomodoro-arac": "pomodoro-tool",
  "/hizli-okuma": "speedread",
};

export function getPageFromPathname(pathname: string): PageType {
  // Check exact match first
  if (ROUTE_TO_PAGE[pathname]) return ROUTE_TO_PAGE[pathname];
  // /chat/[id] routes → focus page
  if (pathname.startsWith("/chat/")) return "focus";
  // Default
  return "focus";
}

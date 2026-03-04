import type { PageType } from "@/app/components/layout/Header";

export const PAGE_ROUTES: Record<PageType, string> = {
  focus: "/",
  history: "/gecmis",
  tools: "/araclar",
  mentor: "/mentor",
  analysis: "/analiz",
};

export const ROUTE_TO_PAGE: Record<string, PageType> = {
  "/": "focus",
  "/gecmis": "history",
  "/araclar": "tools",
  "/mentor": "mentor",
  "/analiz": "analysis",
};

export function getPageFromPathname(pathname: string): PageType {
  // Check exact match first
  if (ROUTE_TO_PAGE[pathname]) return ROUTE_TO_PAGE[pathname];
  // /chat/[id] routes → focus page
  if (pathname.startsWith("/chat/")) return "focus";
  // Default
  return "focus";
}

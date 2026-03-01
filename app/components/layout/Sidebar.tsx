"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  IconDashboard,
  IconSpeedRead,
  IconFlashcard,
  IconPomodoro,
  IconMindMap,
  IconFocus,
  IconSettings,
  IconChevronRight,
  IconChevronLeft,
} from "../icons/Icons";

const navItems = [
  { href: "/", label: "Dashboard", icon: IconDashboard },
  { href: "/speed-reading", label: "Hızlı Okuma", icon: IconSpeedRead },
  { href: "/flashcards", label: "Flashcard", icon: IconFlashcard },
  { href: "/pomodoro", label: "Pomodoro", icon: IconPomodoro },
  { href: "/mindmap", label: "Mind Map", icon: IconMindMap },
  { href: "/focus", label: "Focus Modu", icon: IconFocus },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-screen flex-col justify-between border-r transition-all duration-300 ease-in-out"
      style={{
        width: expanded ? "var(--sidebar-expanded)" : "var(--sidebar-width)",
        background: "var(--bg-secondary)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Logo */}
      <div>
        <div
          className="flex items-center justify-center border-b"
          style={{
            height: "var(--header-height)",
            borderColor: "var(--border-primary)",
          }}
        >
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white font-bold text-sm"
              style={{ background: "var(--gradient-primary)" }}
            >
              O
            </div>
            {expanded && (
              <span
                className="text-lg font-bold animate-fade-in"
                style={{ color: "var(--text-primary)" }}
              >
                Odaklio
              </span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex flex-col gap-1 px-3">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
                style={{
                  background: isActive
                    ? "var(--accent-primary-light)"
                    : "transparent",
                  color: isActive
                    ? "var(--accent-primary)"
                    : "var(--text-secondary)",
                }}
              >
                {isActive && (
                  <div
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full"
                    style={{ background: "var(--accent-primary)" }}
                  />
                )}
                <Icon
                  size={20}
                  className="flex-shrink-0 transition-colors group-hover:text-[var(--accent-primary)]"
                />
                {expanded && (
                  <span className="text-sm font-medium whitespace-nowrap animate-fade-in">
                    {item.label}
                  </span>
                )}
                {!expanded && (
                  <div
                    className="pointer-events-none absolute left-full ml-3 rounded-lg px-3 py-1.5 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      color: "var(--text-primary)",
                      boxShadow: "var(--shadow-lg)",
                    }}
                  >
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className="flex flex-col gap-1 p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          <IconSettings size={20} className="flex-shrink-0" />
          {expanded && (
            <span className="text-sm font-medium animate-fade-in">
              Ayarlar
            </span>
          )}
        </Link>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-center rounded-xl py-2 transition-colors"
          style={{ color: "var(--text-tertiary)" }}
        >
          {expanded ? (
            <IconChevronLeft size={18} />
          ) : (
            <IconChevronRight size={18} />
          )}
        </button>
      </div>
    </aside>
  );
}

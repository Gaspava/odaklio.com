"use client";

import { useState } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSearch, IconSun, IconMoon, IconHeadphones } from "../icons/Icons";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header
      className="fixed top-0 right-0 z-30 flex items-center justify-between border-b px-6"
      style={{
        left: "var(--sidebar-width)",
        height: "var(--header-height)",
        background: "var(--bg-glass-heavy)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderColor: "var(--border-primary)",
      }}
    >
      {/* Search Bar */}
      <div className="relative max-w-md flex-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-tertiary)" }}>
          <IconSearch size={16} />
        </span>
        <input
          type="text"
          placeholder="Konu, kavram veya kaynak ara..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input pl-10"
          style={{
            maxWidth: 400,
            height: 38,
            fontSize: 13,
            background: "var(--bg-tertiary)",
          }}
        />
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-1.5 py-0.5 text-[10px] font-medium"
          style={{
            background: "var(--border-primary)",
            color: "var(--text-tertiary)",
          }}
        >
          ⌘K
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Background Sound Toggle */}
        <button
          className="btn-ghost flex items-center gap-2 rounded-lg"
          style={{ padding: "6px 10px" }}
        >
          <IconHeadphones size={16} />
          <span className="text-xs font-medium hidden sm:inline">Ses</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
          aria-label="Tema değiştir"
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>

        {/* User Avatar */}
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ background: "var(--gradient-primary)" }}
        >
          U
        </div>
      </div>
    </header>
  );
}

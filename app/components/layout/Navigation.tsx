"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDashboard,
  IconChat,
  IconFlashcard,
  IconFocus,
  IconTrendingUp,
} from "../icons/Icons";

const navItems = [
  { href: "/", label: "Ana Sayfa", icon: IconDashboard },
  { href: "/ogren", label: "Öğren", icon: IconChat },
  { href: "/tekrar", label: "Tekrar", icon: IconFlashcard },
  { href: "/odak", label: "Odak", icon: IconFocus },
  { href: "/ilerleme", label: "İlerleme", icon: IconTrendingUp },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <nav
        className="hidden md:flex flex-col items-center gap-1 py-4 px-2 flex-shrink-0"
        style={{
          width: 72,
          background: "var(--bg-secondary)",
          borderRight: "1px solid var(--border-primary)",
        }}
      >
        {/* Logo */}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-bold mb-4"
          style={{ background: "var(--gradient-primary)" }}
        >
          O
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-2.5 transition-all group"
                style={{
                  background: isActive ? "var(--accent-primary-light)" : "transparent",
                  color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                }}
              >
                <Icon size={20} />
                <span className="text-[9px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="nav-bottom-mobile md:hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-xl transition-all min-w-0"
              style={{
                color: isActive ? "var(--accent-primary)" : "var(--text-tertiary)",
                background: isActive ? "var(--accent-primary-light)" : "transparent",
              }}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium leading-none truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

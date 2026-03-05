# Frosted Glass Navbar Redesign

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign both the desktop header nav and mobile bottom nav with a premium frosted glass aesthetic matching the site's orange/dark theme.

**Architecture:** CSS-only visual changes (no structural rework). Add a `.nav-glass-container` wrapper in Header.tsx around the nav pills, then update globals.css for glass effects on header, nav pills, icon buttons, and mobile bottom nav. Mobile bottom nav gets a floating pill indicator for the active state.

**Tech Stack:** Next.js, Tailwind CSS, CSS variables (`--accent-primary` = `#cc3d00`, dark/light themes)

---

### Task 1: Add `.nav-glass-container` class + update header glass in CSS

**Files:**
- Modify: `app/globals.css` (around line 3083 — nav-pill section, and 3181 — header section)

**Step 1: Replace nav-pill block + add glass container**

Find and replace in globals.css:

```css
/* OLD (line ~3083) */
.nav-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
}

.nav-pill:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.nav-pill.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(180, 55, 0, 0.3);
}
```

Replace with:

```css
/* Glass container holding the nav pills */
.nav-glass-container {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-full);
  background: rgba(180, 55, 0, 0.04);
  border: 1px solid rgba(180, 55, 0, 0.1);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.nav-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: var(--radius-full);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  background: transparent;
  color: var(--text-tertiary);
}

.nav-pill:hover {
  background: rgba(180, 55, 0, 0.08);
  color: var(--accent-primary);
}

.nav-pill.active {
  background: var(--gradient-primary);
  color: white;
  box-shadow: 0 2px 14px rgba(180, 55, 0, 0.45), 0 0 0 1px rgba(180, 55, 0, 0.15);
}
```

**Step 2: Update header-icon-btn for glass feel**

Find:
```css
.header-icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-icon-btn:hover {
  background: var(--accent-primary-light);
  color: var(--accent-primary);
}
```

Replace with:
```css
.header-icon-btn {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(180, 55, 0, 0.04);
  color: var(--text-tertiary);
  border: 1px solid rgba(180, 55, 0, 0.08);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.header-icon-btn:hover {
  background: var(--accent-primary-light);
  color: var(--accent-primary);
  border-color: rgba(180, 55, 0, 0.2);
  transform: scale(1.05);
}
```

**Step 3: Update mobile-bottom-nav for premium glass + floating pill active state**

Find the `@media (max-width: 768px)` block at ~line 983:
```css
  .mobile-bottom-nav {
    display: flex;
    flex-shrink: 0;
    z-index: 30;
    height: 64px;
    padding: 0 8px;
    padding-bottom: env(safe-area-inset-bottom);
    align-items: center;
    justify-content: space-around;
    background: var(--bg-glass-heavy);
    border-top: none;
    box-shadow: 0 -1px 0 var(--border-secondary);
    backdrop-filter: blur(20px);
```

Replace the block properties (background, border-top, box-shadow) with:
```css
  .mobile-bottom-nav {
    display: flex;
    flex-shrink: 0;
    z-index: 30;
    height: 64px;
    padding: 0 8px;
    padding-bottom: env(safe-area-inset-bottom);
    align-items: center;
    justify-content: space-around;
    background: rgba(var(--bg-card-rgb, 17, 17, 20), 0.82);
    border-top: 1px solid rgba(180, 55, 0, 0.12);
    box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.18), 0 -1px 0 rgba(180, 55, 0, 0.08);
    backdrop-filter: blur(24px) saturate(1.4);
    -webkit-backdrop-filter: blur(24px) saturate(1.4);
```

Find and replace the active button `::after` indicator:
```css
  /* OLD */
  .mobile-bottom-nav button::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 20px;
    height: 3px;
    border-radius: 2px;
    background: var(--accent-primary);
    transition: transform 0.2s ease;
  }

  .mobile-bottom-nav button[data-active="true"]::after {
    transform: translateX(-50%) scaleX(1);
  }
```

Replace with:
```css
  /* Floating pill background for active state */
  .mobile-bottom-nav button[data-active="true"] {
    background: rgba(180, 55, 0, 0.12);
    border-radius: 14px;
    box-shadow: 0 0 16px rgba(180, 55, 0, 0.2), inset 0 1px 0 rgba(180, 55, 0, 0.15);
  }

  .mobile-bottom-nav button::after {
    display: none;
  }
```

---

### Task 2: Wrap nav pills in glass container in Header.tsx

**Files:**
- Modify: `app/components/layout/Header.tsx`

**Step 1: Update the header element style**

Find:
```tsx
    <header
      className="flex items-center px-4 h-14 flex-shrink-0 relative z-10"
      style={{
        background: "transparent",
        borderBottom: "none",
      }}
    >
```

Replace with:
```tsx
    <header
      className="flex items-center px-4 h-14 flex-shrink-0 relative z-10"
      style={{
        background: "rgba(var(--bg-primary-rgb, 248, 249, 250), 0.75)",
        borderBottom: "1px solid rgba(180, 55, 0, 0.08)",
        backdropFilter: "blur(20px) saturate(1.3)",
        WebkitBackdropFilter: "blur(20px) saturate(1.3)",
      }}
    >
```

**Step 2: Wrap nav pills in glass container**

Find:
```tsx
      <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1">
        {pages.map((page) => (
```

Replace with:
```tsx
      <nav className="absolute left-1/2 -translate-x-1/2">
        <div className="nav-glass-container">
        {pages.map((page) => (
```

And find the closing `</nav>`:
```tsx
        ))}
      </nav>
```

Replace with:
```tsx
        ))}
        </div>
      </nav>
```

---

### Task 3: Add `--bg-primary-rgb` and `--bg-card-rgb` CSS variables for rgba usage

**Files:**
- Modify: `app/globals.css` (near the top, `:root` and `.dark` blocks)

**Step 1: Add RGB variables in light theme `:root` (around line 10)**

After `--bg-card: #ffffff;`, add:
```css
  --bg-primary-rgb: 248, 249, 250;
  --bg-card-rgb: 255, 255, 255;
```

**Step 2: Add RGB variables in dark theme (`.dark` block, around line 125)**

After `--bg-card: #111114;`, add:
```css
  --bg-primary-rgb: 10, 10, 12;
  --bg-card-rgb: 17, 17, 20;
```

---

### Task 4: Commit

```bash
git add app/globals.css app/components/layout/Header.tsx
git commit -m "feat: frosted glass navbar — glass pill container, blur header, mobile bottom nav premium look"
```

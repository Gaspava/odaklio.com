# Dashboard Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the post-login dashboard UI to match the reference design with a modern layout: header with logo + nav + profile, left mini-sidebar with tool icons, center content area, and right ChatMap panel.

**Architecture:** Kademeli donusum - modify existing components in place. Header gets redesigned, LeftPanel becomes a 48px mini-sidebar with popup tools, RightPanel becomes ChatMap, new popup components for Pomodoro and AmbientSound. All existing providers (Auth, Conversation, Theme) stay untouched.

**Tech Stack:** Next.js 16 / React 19 / Tailwind CSS 4 / CSS Variables / Supabase

---

## Task 1: Copy logo SVG to public directory and update CSS variables

**Files:**
- Create: `public/odaklio-logo.svg`
- Modify: `app/globals.css:74-77` (layout variables)

**Step 1: Copy the logo SVG**

Copy `C:\Users\kutayy\Desktop\odaklio-logo.svg` to `public/odaklio-logo.svg`.

**Step 2: Update CSS layout variables in globals.css**

At line 74, change sidebar variables:

```css
--sidebar-width: 48px;
--sidebar-expanded: 280px;
--header-height: 56px;
--mentor-width: 300px;
--mini-sidebar-width: 48px;
```

**Step 3: Add new CSS classes for mini-sidebar and chat-map**

At the end of globals.css, add these new CSS classes:

```css
/* ===== MINI SIDEBAR ===== */
.mini-sidebar {
  width: var(--mini-sidebar-width);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;
  gap: 8px;
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-primary);
  height: 100%;
  flex-shrink: 0;
}

.mini-sidebar-btn {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: var(--text-tertiary);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
  position: relative;
}

.mini-sidebar-btn:hover {
  background: var(--accent-primary-light);
  color: var(--accent-primary);
}

.mini-sidebar-btn.active {
  background: var(--accent-primary-light);
  color: var(--accent-primary);
}

.mini-sidebar-tooltip {
  position: absolute;
  left: calc(100% + 8px);
  top: 50%;
  transform: translateY(-50%);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-fast);
  z-index: 50;
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-lg);
  color: var(--text-primary);
  pointer-events: none;
}

.mini-sidebar-btn:hover .mini-sidebar-tooltip {
  opacity: 1;
  visibility: visible;
}

/* ===== TOOL POPUP ===== */
.tool-popup {
  position: absolute;
  left: calc(var(--mini-sidebar-width) + 8px);
  bottom: 0;
  z-index: 100;
  border-radius: var(--radius-xl);
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  box-shadow: var(--shadow-xl);
  animation: popupIn 0.2s ease-out;
  overflow: hidden;
}

.tool-popup-new-chat {
  width: 280px;
  padding: 16px;
}

.tool-popup-pomodoro {
  width: 260px;
  padding: 16px;
}

.tool-popup-sound {
  width: 260px;
  padding: 16px;
}

@keyframes popupIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes popupOut {
  from {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
  to {
    opacity: 0;
    transform: scale(0.95) translateY(4px);
  }
}

/* ===== CHAT MAP ===== */
.chat-map {
  width: 300px;
  flex-shrink: 0;
  border-left: 1px solid var(--border-primary);
  background: var(--bg-secondary);
  overflow-y: auto;
  padding: 16px;
}

.chat-map-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  border-left: 2px solid transparent;
}

.chat-map-item:hover {
  background: var(--bg-tertiary);
}

.chat-map-item.active {
  background: var(--accent-primary-light);
  border-left-color: var(--accent-primary);
}

.chat-map-item-icon {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--accent-primary-light);
  color: var(--accent-primary);
}

.chat-map-item-text {
  font-size: 12px;
  line-height: 1.4;
  color: var(--text-secondary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* ===== NAV PILL (Header) ===== */
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
  white-space: nowrap;
}

.nav-pill:hover {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.nav-pill.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

/* ===== POMODORO RUNNING INDICATOR ===== */
.pomodoro-indicator {
  position: absolute;
  bottom: -2px;
  right: -2px;
  font-size: 8px;
  font-weight: 700;
  color: var(--accent-primary);
  background: var(--bg-card);
  border-radius: var(--radius-full);
  padding: 1px 3px;
  line-height: 1;
  border: 1px solid var(--border-primary);
}

/* ===== SOUND WAVE ANIMATION ===== */
.sound-wave {
  display: flex;
  align-items: center;
  gap: 1px;
  position: absolute;
  bottom: -2px;
  right: -2px;
}

.sound-wave span {
  width: 2px;
  height: 6px;
  background: var(--accent-primary);
  border-radius: 1px;
  animation: soundWave 0.8s ease-in-out infinite;
}

.sound-wave span:nth-child(2) {
  animation-delay: 0.2s;
  height: 8px;
}

.sound-wave span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes soundWave {
  0%, 100% { transform: scaleY(0.5); }
  50% { transform: scaleY(1); }
}

/* ===== CONFIRM DIALOG ===== */
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.15s ease-out;
}

.confirm-dialog {
  background: var(--bg-card);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-xl);
  padding: 24px;
  max-width: 360px;
  width: 90%;
  box-shadow: var(--shadow-xl);
  animation: popupIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== PROFILE AREA IN HEADER ===== */
.header-profile-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-profile-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-primary);
}

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

**Step 4: Commit**

```bash
git add public/odaklio-logo.svg app/globals.css
git commit -m "feat: add logo SVG and new CSS classes for dashboard redesign"
```

---

## Task 2: Redesign the Header component

**Files:**
- Modify: `app/components/layout/Header.tsx`

**Step 1: Rewrite Header.tsx**

Replace the entire Header component with the new design. Key changes:
- Left: SVG logo (from /odaklio-logo.svg) at 28px height
- Center: Pill-style nav buttons. Active tab uses filled emerald green pill (`.nav-pill.active`), inactive ones are transparent
- Right: Profile area with avatar (36px), user display name, settings icon button, notification icon button, theme toggle

The pages array stays the same (history, tools, focus, mentor, analysis).

```tsx
// Header structure:
// <header className="flex items-center justify-between px-4 h-14 ...">
//   {/* Left - Logo */}
//   <div><img src="/odaklio-logo.svg" alt="Odaklio" className="h-7" /></div>
//
//   {/* Center - Nav Pills */}
//   <nav className="flex items-center gap-1">
//     {pages.map(page => (
//       <button className={`nav-pill ${active ? 'active' : ''}`} ...>
//         {page.icon} {page.label}
//       </button>
//     ))}
//   </nav>
//
//   {/* Right - Profile Area */}
//   <div className="header-profile-area">
//     <span className="header-profile-name hidden sm:block">{displayName}</span>
//     <button className="header-icon-btn" onClick={toggleTheme}>...</button>
//     <button className="header-icon-btn" title="Bildirimler">bell icon</button>
//     <button onClick={toggleMenu} className="avatar-btn">...</button>
//     {/* Profile dropdown stays the same */}
//   </div>
// </header>
```

Make sure the profile dropdown menu (lines 207-262 in current code) remains unchanged in behavior.

**Step 2: Commit**

```bash
git add app/components/layout/Header.tsx
git commit -m "feat: redesign header with logo, pill nav, and profile area"
```

---

## Task 3: Create MiniSidebar component

**Files:**
- Create: `app/components/layout/MiniSidebar.tsx`

**Step 1: Create MiniSidebar.tsx**

This is the 48px vertical bar on the left with 4 buttons stacked from bottom to top:
1. **[+] New Chat** (bottom) - opens ChatStyleSelector popup
2. **[Timer] Pomodoro** - opens PomodoroPopup
3. **[Sound] Ambient Sound** - opens AmbientSoundPopup
4. **[Trash] Clear Chat** (top) - opens confirm dialog

Each button is a `.mini-sidebar-btn` with tooltip on hover.

```tsx
interface MiniSidebarProps {
  onNewChat: (style: string) => void;
  onClearChat: () => void;
  isMobile?: boolean;
}
```

State management:
- `activePopup: 'new-chat' | 'pomodoro' | 'sound' | null` - which popup is open
- `showClearConfirm: boolean` - clear chat confirmation
- `pomodoroRunning: boolean` - show countdown on icon
- `pomodoroTime: { minutes: number, seconds: number }` - timer state
- `soundPlaying: boolean` - show wave animation on icon

When a popup is open, clicking the same button closes it. Clicking a different button switches popup. Clicking outside closes popup.

The component renders:
```tsx
<div className="mini-sidebar">
  {/* Top: Clear Chat */}
  <button className="mini-sidebar-btn" onClick={() => setShowClearConfirm(true)}>
    <TrashIcon />
    <span className="mini-sidebar-tooltip">Temizle</span>
  </button>

  <div className="flex-1" /> {/* spacer */}

  {/* Bottom tools */}
  <div className="relative">
    <button className="mini-sidebar-btn" onClick={() => togglePopup('sound')}>
      <SoundIcon />
      {soundPlaying && <div className="sound-wave">...</div>}
      <span className="mini-sidebar-tooltip">Arka Plan Sesi</span>
    </button>
    {activePopup === 'sound' && <AmbientSoundPopup ... />}
  </div>

  <div className="relative">
    <button className="mini-sidebar-btn" onClick={() => togglePopup('pomodoro')}>
      <TimerIcon />
      {pomodoroRunning && <span className="pomodoro-indicator">{mm}:{ss}</span>}
      <span className="mini-sidebar-tooltip">Pomodoro</span>
    </button>
    {activePopup === 'pomodoro' && <PomodoroPopup ... />}
  </div>

  <div className="relative">
    <button className="mini-sidebar-btn" onClick={() => togglePopup('new-chat')} style={{background: 'var(--accent-primary)', color: 'white'}}>
      <PlusIcon />
      <span className="mini-sidebar-tooltip">Yeni Sohbet</span>
    </button>
    {activePopup === 'new-chat' && <NewChatPopup ... />}
  </div>

  {/* Clear Chat Confirm Dialog */}
  {showClearConfirm && <ConfirmDialog ... />}
</div>
```

**Step 2: Commit**

```bash
git add app/components/layout/MiniSidebar.tsx
git commit -m "feat: create MiniSidebar component with tool popups"
```

---

## Task 4: Create PomodoroPopup component

**Files:**
- Create: `app/components/tools/PomodoroPopup.tsx`

**Step 1: Create PomodoroPopup.tsx**

Small floating popup (260x auto) that appears to the right of the mini-sidebar button.

```tsx
interface PomodoroPopupProps {
  onClose: () => void;
  onTimerChange: (running: boolean, minutes: number, seconds: number) => void;
}
```

Features:
- Circular timer display (SVG circle with countdown, 100px diameter)
- Timer text in center (MM:SS)
- Mode label ("Odak" / "Mola")
- Play/Pause and Reset buttons
- Work/Break mode toggle
- Work duration: 25 min, Break: 5 min
- When running, calls `onTimerChange` every second with current state
- Uses `useEffect` with `setInterval` for countdown
- When timer reaches 0, auto-switch mode (work->break, break->work)
- Close button in top right

Styling uses existing CSS variables. The popup has `.tool-popup.tool-popup-pomodoro` class.

**Step 2: Commit**

```bash
git add app/components/tools/PomodoroPopup.tsx
git commit -m "feat: create PomodoroPopup component with timer"
```

---

## Task 5: Create AmbientSoundPopup component

**Files:**
- Create: `app/components/tools/AmbientSoundPopup.tsx`

**Step 1: Create AmbientSoundPopup.tsx**

Small floating popup (260x auto) for ambient sound controls.

```tsx
interface AmbientSoundPopupProps {
  onClose: () => void;
  onSoundChange: (playing: boolean) => void;
}
```

Features:
- Title: "Arka Plan Sesi"
- Grid of 8 sound options (2x4 grid): Rain, Forest, Ocean, Fire, Cafe, Lo-Fi, White Noise, Birds
- Each option: emoji + name, toggleable
- Volume slider (when a sound is active)
- Active sound highlighted with emerald green
- Placeholder only - no actual audio playback, just UI
- Close button in top right

Uses existing CSS classes. `.tool-popup.tool-popup-sound` class.

**Step 2: Commit**

```bash
git add app/components/tools/AmbientSoundPopup.tsx
git commit -m "feat: create AmbientSoundPopup component (UI only)"
```

---

## Task 6: Create NewChatPopup component

**Files:**
- Create: `app/components/tools/NewChatPopup.tsx`

**Step 1: Create NewChatPopup.tsx**

Popup showing 4 chat mode cards for starting a new conversation.

```tsx
interface NewChatPopupProps {
  onSelectMode: (mode: string) => void;
  onClose: () => void;
}
```

Features:
- Title: "Yeni Sohbet"
- 4 mode cards stacked vertically:
  1. Standart Sohbet (green, IconChat)
  2. Mindmap Chat (purple, IconMindMap)
  3. Flashcard (amber, IconFlashcard)
  4. Roadmap (red, IconRoadmap)
- Each card: colored icon (left) + name + short desc (right) + chevron
- Hover: scale(1.02) + colored border
- Click: calls `onSelectMode(mode.id)` then `onClose()`

Uses `.tool-popup.tool-popup-new-chat` class.

**Step 2: Commit**

```bash
git add app/components/tools/NewChatPopup.tsx
git commit -m "feat: create NewChatPopup component for chat mode selection"
```

---

## Task 7: Create ChatMap component (right panel replacement)

**Files:**
- Create: `app/components/layout/ChatMap.tsx`

**Step 1: Create ChatMap.tsx**

Replaces RightPanel. Shows a map of conversation messages for quick navigation.

```tsx
interface ChatMapProps {
  onClose?: () => void;
  chatStyle?: ChatStyle;
  messages?: ChatMessage[];
  isMobile?: boolean;
}
```

Features:
- Title: "Chat Map" with collapse icon
- For standard chat: Lists all USER messages, truncated to ~40 chars
  - Each item shows a chat bubble icon + truncated message text
  - Click scrolls to that message in the chat area (using `document.getElementById('msg-{id}')`)
  - Active (visible) message has green left border (`.chat-map-item.active`)
  - Uses IntersectionObserver to track which message is currently visible
- For mindmap chat: Shows node labels list
- For flashcard chat: Shows card numbers/questions list
- For roadmap chat: Shows step titles list
- Empty state: "Henuz mesaj yok" with subtle icon

The component uses `useConversation` to access messages or receives them as prop.

**Step 2: Commit**

```bash
git add app/components/layout/ChatMap.tsx
git commit -m "feat: create ChatMap component for conversation navigation"
```

---

## Task 8: Rewire Dashboard.tsx to use new layout

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`

**Step 1: Update imports**

Replace LeftPanel import with MiniSidebar import. Replace RightPanel import with ChatMap import.

```tsx
// Remove:
import LeftPanel from "../layout/LeftPanel";
import RightPanel from "../layout/RightPanel";

// Add:
import MiniSidebar from "../layout/MiniSidebar";
import ChatMap from "../layout/ChatMap";
```

**Step 2: Update the layout structure**

The main layout changes from:
```
[LeftPanel 280px] [Content] [RightPanel 300px]
```
to:
```
[MiniSidebar 48px] [Content] [ChatMap 300px]
```

Key changes in the JSX:
- Desktop: MiniSidebar is always visible (not collapsible) on the left
- ChatMap replaces RightPanel, still collapsible
- Remove the old left panel toggle buttons (the thin arrow buttons)
- Remove leftOpen/rightOpen state usage for desktop MiniSidebar (it's always visible)
- Keep rightOpen for ChatMap toggle

The overall structure becomes:
```tsx
<div className="flex flex-col overflow-hidden" style={{ height: "100dvh" }}>
  {!isMobile && <Header ... />}
  {isMobile && <MobileTopBar ... />}

  <div className="flex flex-1 overflow-hidden relative">
    {/* Mini Sidebar - always visible on desktop, hidden on mobile */}
    {!isMobile && showSidePanels && (
      <MiniSidebar
        onNewChat={handleSelectStyle}
        onClearChat={handleClearChat}
      />
    )}

    {/* Main Content */}
    <div className="flex-1 min-w-0 overflow-hidden">
      {renderPageContent()}
    </div>

    {/* Chat Map - collapsible right panel */}
    {showSidePanels && !["flashcard","roadmap"].includes(chatStyle) && rightOpen && !isMobile && (
      <ChatMap
        onClose={() => setRightOpen(false)}
        chatStyle={chatStyle}
      />
    )}
    {/* Toggle button for ChatMap when closed */}
    ...
  </div>

  {isMobile && <BottomNav ... />}
</div>
```

**Step 3: Add handleClearChat function**

```tsx
const handleClearChat = () => {
  startNewConversation();
  setShowModeSelector(true);
  setChatStyle("standard");
  setChatKey((k) => k + 1);
};
```

**Step 4: Update mobile layout**

For mobile:
- MiniSidebar is NOT shown
- Instead, mobile top bar gets Pomodoro/Sound icons
- Left swipe panel shows chat history (extract ChatHistorySidebar from old LeftPanel into its own component or keep it inline)
- Right swipe panel shows ChatMap
- Bottom nav stays the same
- '+' button appears as a floating action button or in the bottom nav Odak tab

Update mobile-top-bar to include:
- Left: hamburger/menu toggle
- Center: Logo
- Right: mini pomodoro icon + sound icon + profile avatar

**Step 5: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx
git commit -m "feat: rewire dashboard layout with MiniSidebar and ChatMap"
```

---

## Task 9: Extract ChatHistorySidebar as standalone component

**Files:**
- Create: `app/components/layout/ChatHistorySidebar.tsx`
- Modify: `app/components/layout/LeftPanel.tsx` (keep for reference but it will no longer be imported)

**Step 1: Extract ChatHistorySidebar**

Move the `ChatHistorySidebar` function from LeftPanel.tsx into its own file at `app/components/layout/ChatHistorySidebar.tsx`. Also move the `relativeTime` helper function.

This component will be used in the mobile left panel overlay.

**Step 2: Update Dashboard.tsx mobile section**

In Dashboard.tsx, import ChatHistorySidebar for the mobile left panel:

```tsx
import ChatHistorySidebar from "../layout/ChatHistorySidebar";
```

Use it in the mobile left panel overlay instead of the full LeftPanel.

**Step 3: Commit**

```bash
git add app/components/layout/ChatHistorySidebar.tsx app/components/dashboard/Dashboard.tsx
git commit -m "feat: extract ChatHistorySidebar as standalone component for mobile"
```

---

## Task 10: Update MainChat message styling

**Files:**
- Modify: `app/components/chatbot/MainChat.tsx`
- Modify: `app/globals.css` (message styles section)

**Step 1: Update AI avatar to use logo**

In MainChat.tsx, update the `AiAvatar` component to use the Odaklio logo SVG instead of the "O" letter:

```tsx
function AiAvatar() {
  return (
    <div
      className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl mr-3 mt-1 relative"
      style={{ background: "var(--accent-primary-light)" }}
    >
      <img src="/odaklio-logo.svg" alt="" className="h-5 w-5" />
      <div
        className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
        style={{ background: "var(--accent-success)", borderColor: "var(--bg-primary)" }}
      />
    </div>
  );
}
```

**Step 2: Add copy and like/dislike actions to AI messages**

After each AI message (non-welcome), add action buttons similar to the reference:

```tsx
{msg.role === "assistant" && msg.id !== "welcome" && msg.content && (
  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
    <button title="Kopyala" onClick={() => navigator.clipboard.writeText(msg.content)}>
      <CopyIcon size={14} />
    </button>
    <button title="Begendim"><ThumbUpIcon size={14} /></button>
    <button title="Begenmedim"><ThumbDownIcon size={14} /></button>
  </div>
)}
```

Add the necessary icons (CopyIcon, ThumbUpIcon, ThumbDownIcon) to Icons.tsx if not already present.

**Step 3: Update input bar styling**

Make the input bar match the reference design - rounder corners, cleaner look. Update the existing input wrapper styling to use `rounded-2xl` (already done) and adjust padding. The send button should be emerald green circle when active.

**Step 4: Commit**

```bash
git add app/components/chatbot/MainChat.tsx app/globals.css app/components/icons/Icons.tsx
git commit -m "feat: update chat message styling with actions and logo avatar"
```

---

## Task 11: Add mobile-specific tool popups (bottom sheets)

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`
- Modify: `app/globals.css`

**Step 1: Add bottom sheet CSS**

```css
/* ===== MOBILE BOTTOM SHEET ===== */
.bottom-sheet-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-overlay);
  z-index: 100;
  animation: fadeIn 0.15s ease-out;
}

.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 101;
  background: var(--bg-card);
  border-top-left-radius: var(--radius-2xl);
  border-top-right-radius: var(--radius-2xl);
  padding: 20px 16px;
  padding-bottom: calc(20px + env(safe-area-inset-bottom));
  animation: slideUp 0.3s ease-out;
  max-height: 70vh;
  overflow-y: auto;
}

.bottom-sheet-handle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-primary);
  margin: 0 auto 16px;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

**Step 2: Add mobile tool popup state to Dashboard**

Add state for mobile bottom sheets:
```tsx
const [mobileSheet, setMobileSheet] = useState<'pomodoro' | 'sound' | null>(null);
```

**Step 3: Update mobile top bar**

Add pomodoro and sound icons to mobile top bar. When tapped, open as bottom sheets:

```tsx
{isMobile && (
  <div className="mobile-top-bar">
    <button onClick={toggleLeft} className="mobile-sidebar-toggle">
      {/* hamburger icon */}
    </button>
    <div className="mobile-top-center">
      <img src="/odaklio-logo.svg" alt="Odaklio" className="h-6" />
    </div>
    <div className="flex items-center gap-1">
      <button onClick={() => setMobileSheet('pomodoro')} className="mobile-sidebar-toggle">
        <TimerIcon />
      </button>
      <button onClick={() => setMobileSheet('sound')} className="mobile-sidebar-toggle">
        <SoundIcon />
      </button>
      <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-sidebar-toggle">
        <AvatarIcon />
      </button>
    </div>
  </div>
)}
```

**Step 4: Render bottom sheets**

```tsx
{mobileSheet && (
  <>
    <div className="bottom-sheet-overlay" onClick={() => setMobileSheet(null)} />
    <div className="bottom-sheet">
      <div className="bottom-sheet-handle" />
      {mobileSheet === 'pomodoro' && <PomodoroPopup onClose={() => setMobileSheet(null)} ... />}
      {mobileSheet === 'sound' && <AmbientSoundPopup onClose={() => setMobileSheet(null)} ... />}
    </div>
  </>
)}
```

**Step 5: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx app/globals.css
git commit -m "feat: add mobile bottom sheet popups for pomodoro and sounds"
```

---

## Task 12: Update mobile bottom nav and add floating new chat button

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`

**Step 1: Update bottom nav styling**

Update the mobile bottom nav to use cleaner styling matching the new theme. The active tab should have emerald green color with subtle background.

**Step 2: Add floating action button for new chat**

When on the "focus" page on mobile, show a floating '+' button in bottom-right corner (above bottom nav):

```tsx
{isMobile && activePage === "focus" && (
  <button
    onClick={() => setShowStyleSelector(true)}
    className="fixed z-50 flex items-center justify-center w-12 h-12 rounded-full text-white shadow-lg active:scale-95 transition-all"
    style={{
      bottom: 72, // above bottom nav
      right: 16,
      background: "var(--gradient-primary)",
      boxShadow: "var(--shadow-glow)",
    }}
  >
    <PlusIcon size={20} />
  </button>
)}
```

**Step 3: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx
git commit -m "feat: update mobile bottom nav and add floating new chat button"
```

---

## Task 13: Light theme polish and animation refinements

**Files:**
- Modify: `app/globals.css`

**Step 1: Refine light theme colors to match reference**

The reference image shows a very clean, white design with subtle green accents. Ensure:
- Header background: pure white with subtle bottom border
- Card backgrounds: white with very light shadows
- Active nav pill: solid emerald green with white text
- Input area: clean white background with light border
- Message bubbles: AI messages on white, user messages on emerald

Review and adjust light mode CSS variables if needed.

**Step 2: Add smooth animations**

Ensure these animations exist and are polished:
- `animate-msg-in`: messages fade in + slide up
- `animate-fade-in`: general fade in
- `animate-float`: gentle floating animation
- Panel slide transitions: 300ms ease
- Button hover effects: subtle scale + shadow
- Page transition fade

**Step 3: Add stagger animation timing**

```css
.stagger-children > *:nth-child(1) { animation-delay: 0.05s; }
.stagger-children > *:nth-child(2) { animation-delay: 0.10s; }
.stagger-children > *:nth-child(3) { animation-delay: 0.15s; }
.stagger-children > *:nth-child(4) { animation-delay: 0.20s; }
```

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: polish light theme and refine animations"
```

---

## Task 14: Clean up and verify everything works

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx` (final cleanup)
- Delete references to LeftPanel import if still present
- Verify all imports resolve correctly

**Step 1: Remove unused imports and dead code**

Remove the import of LeftPanel from Dashboard.tsx if it was left. Remove old panel toggle buttons for the left sidebar. Clean up any unused state variables.

**Step 2: Verify the application builds**

```bash
cd /c/Users/kutayy/Desktop/odaklio && npm run build
```

Expected: Build succeeds with no errors.

**Step 3: Test manually**

Open the app in browser and verify:
- [ ] Header shows logo, pill nav, profile area
- [ ] Mini sidebar visible on desktop with 4 buttons
- [ ] '+' opens new chat mode selector popup
- [ ] Pomodoro icon opens timer popup, countdown works
- [ ] Sound icon opens ambient sound popup
- [ ] Trash icon opens clear chat confirmation
- [ ] Chat Map shows message summaries on right
- [ ] Clicking a message in Chat Map scrolls to it
- [ ] Dark/light theme both work
- [ ] Mobile: top bar, bottom nav, swipe panels all work
- [ ] Mobile: pomodoro/sound open as bottom sheets
- [ ] Mobile: floating '+' button appears on focus page
- [ ] All chat modes still function (standard, mindmap, flashcard, roadmap)
- [ ] Mentor, Tools, History, Analysis pages still work

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete dashboard redesign with new layout and styling"
```

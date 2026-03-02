# Focus Modes Viewport System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform Odaklio's focus mode section into 5 distinct AI-powered learning viewports (Standard, Mindmap, Flashcard, Note-Taking, Roadmap), each with a custom chat UI and mode-specific AI behavior.

**Architecture:** Extend the existing conversation type system to support 5 modes. Each mode uses the same Gemini streaming API with a mode-specific system prompt. The Dashboard shows a mode selector grid when no conversation is active, and renders the appropriate chat component based on conversation type. New chat components (FlashcardChat, NoteChat, RoadmapChat) parse AI responses into rich visual UI elements.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase, Google Generative AI (Gemini)

---

### Task 1: Extend Type System & Database Layer

**Files:**
- Modify: `lib/db/conversations.ts:1-3`
- Modify: `app/components/chatbot/ChatStyleSelector.tsx:5`

**Step 1: Update ConversationType union**

In `lib/db/conversations.ts`, change line 3:
```typescript
export type ConversationType = "standard" | "mindmap" | "flashcard" | "note" | "roadmap";
```

**Step 2: Update ChatStyle type**

In `app/components/chatbot/ChatStyleSelector.tsx`, change line 5:
```typescript
export type ChatStyle = "standard" | "mindmap" | "flashcard" | "note" | "roadmap";
```

**Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No errors (both types are string unions, Supabase doesn't enforce enum at type level)

**Step 4: Commit**

```bash
git add lib/db/conversations.ts app/components/chatbot/ChatStyleSelector.tsx
git commit -m "feat: extend conversation types for focus modes"
```

---

### Task 2: Add Mode-Specific System Prompts to Chat API

**Files:**
- Modify: `app/api/chat/route.ts`

**Step 1: Add mode-specific system prompts**

In `app/api/chat/route.ts`, after the existing `SYSTEM_INSTRUCTION` constant (line 38), add:

```typescript
const MODE_PROMPTS: Record<string, string> = {
  standard: SYSTEM_INSTRUCTION,
  mindmap: SYSTEM_INSTRUCTION,
  flashcard: `Sen Odaklio AI Flashcard asistanısın. Görevin kullanıcının istediği konuda flashcard'lar üretmek.

Kuralların:
- Her zaman Türkçe yanıt ver.
- Kullanıcı bir konu verdiğinde, o konuyla ilgili flashcard'lar üret.
- Her flashcard'ı şu formatta yaz:

[FLASHCARD]Soru metni|Cevap metni[/FLASHCARD]

- Bir mesajda 5-10 arası flashcard üret.
- Sorular kısa ve net olsun.
- Cevaplar açıklayıcı ama özlü olsun (1-3 cümle).
- Flashcard'lardan önce kısa bir giriş yaz (1 cümle).
- Flashcard'lardan sonra motivasyon cümlesi ekle.
- Kullanıcı "daha zor", "daha kolay", "daha fazla" derse ona göre ayarla.
- Matematiksel ifadelerde Unicode sembollerini kullan (∫, ∑, √, π, ², ³).`,

  note: `Sen Odaklio AI Not Asistanısın. Görevin kullanıcının istediği konuda düzenli, yapılandırılmış notlar üretmek.

Kuralların:
- Her zaman Türkçe yanıt ver.
- Notları şu formatta üret:

[NOTE_TITLE]Not Başlığı[/NOTE_TITLE]

[NOTE_SECTION]Bölüm Başlığı[/NOTE_SECTION]
İçerik buraya gelir. Bullet point'ler kullan:
• Madde 1
• Madde 2

[NOTE_HIGHLIGHT]Önemli kavram veya formül[/NOTE_HIGHLIGHT]

[NOTE_KEY]Anahtar Nokta: Önemli bilgi burada[/NOTE_KEY]

- Notları hiyerarşik yapıda düzenle (ana başlık → alt bölümler → maddeler).
- Formülleri [NOTE_HIGHLIGHT] içinde yaz.
- Her bölüm sonunda anahtar noktayı [NOTE_KEY] ile vurgula.
- Matematiksel ifadelerde Unicode sembollerini kullan (∫, ∑, √, π, ², ³).
- Kısa ve öz ol, gereksiz uzatma.
- Kullanıcı "detaylandır" derse o bölümü genişlet.`,

  roadmap: `Sen Odaklio AI Yol Haritası Asistanısın. Görevin kullanıcının öğrenmek istediği konu için adım adım öğrenme planı oluşturmak.

Kuralların:
- Her zaman Türkçe yanıt ver.
- Yol haritasını şu formatta üret:

[ROADMAP_TITLE]Yol Haritası Başlığı[/ROADMAP_TITLE]

[STEP]1|Adım Başlığı|Bu adımda ne öğrenilecek açıklaması|2 saat[/STEP]
[STEP]2|İkinci Adım|Açıklama metni|3 saat[/STEP]
[STEP]3|Üçüncü Adım|Açıklama metni|4 saat[/STEP]

- 5-10 adım arası plan oluştur.
- Her adımda: numara, başlık, açıklama, tahmini süre olsun.
- Adımlar mantıklı sırada ilerlesin (temelden ileri seviyeye).
- Adım açıklamaları 1-2 cümle olsun.
- Süreleri gerçekçi ver.
- Yol haritasından önce 1 cümle giriş yaz.
- Sonunda motivasyon mesajı ekle.
- Kullanıcı bir adım hakkında detay isterse, o adımı genişlet.`,
};
```

**Step 2: Update POST handler to accept mode parameter**

In the POST handler, change body destructuring (line 51) to:
```typescript
const { messages, mode } = body;
```

Change the model initialization (lines 62-65) to:
```typescript
const systemPrompt = MODE_PROMPTS[mode] || SYSTEM_INSTRUCTION;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-3-flash-preview",
  systemInstruction: systemPrompt,
});
```

**Step 3: Verify the file compiles**

Run: `npx tsc --noEmit`

**Step 4: Commit**

```bash
git add app/api/chat/route.ts
git commit -m "feat: add mode-specific system prompts for focus modes"
```

---

### Task 3: Update ConversationProvider for New Types

**Files:**
- Modify: `app/providers/ConversationProvider.tsx`

**Step 1: Add createTypedConversation method**

Add to the context interface (after `createMindmapConversation` at line 61):
```typescript
createTypedConversation: (type: ConversationType) => Promise<string>;
```

Add to default context (after line 84):
```typescript
createTypedConversation: async () => "",
```

**Step 2: Implement createTypedConversation**

After the `createMindmapConversation` callback (line 232), add:
```typescript
const createTypedConversation = useCallback(async (type: ConversationType): Promise<string> => {
  if (!user) throw new Error("Not authenticated");
  const conv = await createConversation(user.id, type);
  setActiveConversationId(conv.id);
  setActiveConversationType(type);
  return conv.id;
}, [user]);
```

**Step 3: Add to provider value**

Add `createTypedConversation` to the provider value object.

**Step 4: Update saveUserMessage to accept type**

Modify `saveUserMessage` (line 170-187) so that when creating a new conversation, it uses a `type` parameter:

Change the function signature to accept an optional type:
```typescript
const saveUserMessage = useCallback(
  async (content: string, nodeId: string | null = null, type: ConversationType = "standard"): Promise<{ conversationId: string; messageId: string }> => {
    if (!user) throw new Error("Not authenticated");
    let convId = activeConversationId;
    if (!convId) {
      const conv = await createConversation(user.id, type);
      convId = conv.id;
      setActiveConversationId(convId);
      setActiveConversationType(type);
    }
    const msg = await insertMessage(convId, "user", content, {}, nodeId);
    return { conversationId: convId, messageId: msg.id };
  },
  [user, activeConversationId]
);
```

Update the interface type for `saveUserMessage` accordingly.

**Step 5: Update loadConversation to handle new types**

In `loadConversation` (line 149), change the mindmap check:
```typescript
// For mindmap conversations, return empty — MindmapChat handles its own loading
if (conv.type === "mindmap") return [];
```

This stays the same - the new modes (flashcard, note, roadmap) load messages normally like standard.

**Step 6: Commit**

```bash
git add app/providers/ConversationProvider.tsx
git commit -m "feat: add typed conversation creation to provider"
```

---

### Task 4: Create ModeSelector Component (Dashboard Home Grid)

**Files:**
- Create: `app/components/dashboard/ModeSelector.tsx`

**Step 1: Create the ModeSelector component**

This is the 3-column grid of mode cards shown when no conversation is active. Each card has:
- Gradient icon background
- Mode name
- Short description
- Glassmorphism + hover glow effect

Mode configs:
```
Standard  → color: #10b981 (emerald), icon: IconChat,     desc: "Klasik AI sohbet deneyimi"
Mindmap   → color: #8b5cf6 (purple),  icon: IconMindMap,  desc: "2D paralel sohbet haritası"
Flashcard → color: #f59e0b (amber),   icon: IconFlashcard, desc: "AI destekli hafıza kartları"
Not Alma  → color: #3b82f6 (blue),    icon: IconEdit(new), desc: "Yapılandırılmış not çıkarma"
Roadmap   → color: #ef4444 (red),     icon: IconRoadmap(new), desc: "Adım adım öğrenme planı"
```

The component accepts `onSelectMode: (mode: ChatStyle) => void` prop.

Grid: 3 columns on desktop, 2 on mobile. Cards are ~160px tall with centered icon + text.

**Step 2: Commit**

```bash
git add app/components/dashboard/ModeSelector.tsx
git commit -m "feat: add ModeSelector component for dashboard home"
```

---

### Task 5: Add New Icons (IconEdit, IconRoadmap)

**Files:**
- Modify: `app/components/icons/Icons.tsx`

**Step 1: Add IconEdit (pencil) for Note-Taking mode**

```typescript
export function IconEdit({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
```

**Step 2: Add IconRoadmap (map/route) for Roadmap mode**

```typescript
export function IconRoadmap({ size = 22, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}
```

**Step 3: Commit**

```bash
git add app/components/icons/Icons.tsx
git commit -m "feat: add IconEdit and IconRoadmap icons"
```

---

### Task 6: Create FlashcardChat Component

**Files:**
- Create: `app/components/chatbot/FlashcardChat.tsx`

**Step 1: Build the FlashcardChat component**

Key features:
- Parse `[FLASHCARD]question|answer[/FLASHCARD]` from AI responses
- Render flippable cards with 3D CSS transform
- Card navigation (prev/next) + counter
- "Biliyorum" / "Bilmiyorum" score buttons
- Progress bar (correct ratio)
- Chat input at bottom for requesting cards
- Uses same `streamChat` pattern as MainChat but sends `mode: "flashcard"` to API
- Welcome message customized for flashcard mode

Card flip uses CSS:
```css
.flashcard-inner { transition: transform 0.6s; transform-style: preserve-3d; }
.flashcard-inner.flipped { transform: rotateY(180deg); }
.flashcard-front, .flashcard-back { backface-visibility: hidden; }
.flashcard-back { transform: rotateY(180deg); }
```

Parser function:
```typescript
function parseFlashcards(content: string): { question: string; answer: string }[] {
  const regex = /\[FLASHCARD\](.*?)\|(.*?)\[\/FLASHCARD\]/gs;
  const cards: { question: string; answer: string }[] = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    cards.push({ question: match[1].trim(), answer: match[2].trim() });
  }
  return cards;
}
```

**Step 2: Commit**

```bash
git add app/components/chatbot/FlashcardChat.tsx
git commit -m "feat: add FlashcardChat component with flip animation"
```

---

### Task 7: Create NoteChat Component

**Files:**
- Create: `app/components/chatbot/NoteChat.tsx`

**Step 1: Build the NoteChat component**

Key features:
- Parse `[NOTE_TITLE]`, `[NOTE_SECTION]`, `[NOTE_HIGHLIGHT]`, `[NOTE_KEY]` tags
- Render structured notes in a clean card with:
  - Large title heading
  - Section headers with accent color left border
  - Bullet points with proper indentation
  - Highlight boxes (formula/concept) with colored background
  - Key point boxes with icon
- "Kopyala" button copies note text to clipboard
- Chat input at bottom
- Sends `mode: "note"` to API
- Welcome message customized for note mode

Parser:
```typescript
function parseNoteContent(content: string): NoteBlock[] {
  // Parse [NOTE_TITLE], [NOTE_SECTION], [NOTE_HIGHLIGHT], [NOTE_KEY] tags
  // Return array of typed blocks for rendering
}
```

**Step 2: Commit**

```bash
git add app/components/chatbot/NoteChat.tsx
git commit -m "feat: add NoteChat component with structured note display"
```

---

### Task 8: Create RoadmapChat Component

**Files:**
- Create: `app/components/chatbot/RoadmapChat.tsx`

**Step 1: Build the RoadmapChat component**

Key features:
- Parse `[ROADMAP_TITLE]` and `[STEP]number|title|description|duration[/STEP]` from AI
- Render vertical timeline with:
  - Connected line (vertical bar)
  - Dots: filled green (completed) vs empty outline (pending)
  - Step cards with title, description, duration badge
  - Click on step to expand/ask AI for details
- Progress indicator at top (completed/total)
- Chat input at bottom
- Sends `mode: "roadmap"` to API
- Welcome message customized for roadmap mode

Parser:
```typescript
function parseRoadmapSteps(content: string): { number: number; title: string; description: string; duration: string }[] {
  const regex = /\[STEP\](\d+)\|(.*?)\|(.*?)\|(.*?)\[\/STEP\]/gs;
  // ...
}
```

**Step 2: Commit**

```bash
git add app/components/chatbot/RoadmapChat.tsx
git commit -m "feat: add RoadmapChat component with timeline visualization"
```

---

### Task 9: Update Dashboard to Handle All Modes

**Files:**
- Modify: `app/components/dashboard/Dashboard.tsx`

**Step 1: Import new components**

Add imports for `FlashcardChat`, `NoteChat`, `RoadmapChat`, and `ModeSelector`.

**Step 2: Update ChatStyle handling**

The `chatStyle` state already exists. Update it to use the expanded `ChatStyle` type.

**Step 3: Update `handleOpenConversation`**

Map all conversation types to the corresponding chatStyle:
```typescript
const typeToStyle: Record<string, ChatStyle> = {
  standard: "standard",
  mindmap: "mindmap",
  flashcard: "flashcard",
  note: "note",
  roadmap: "roadmap",
};
setChatStyle(typeToStyle[convType || "standard"] || "standard");
```

**Step 4: Update `renderPageContent`**

In the `"focus"` case, show `ModeSelector` when no active conversation, otherwise render the appropriate chat component:

```typescript
case "focus":
  if (!activeConversationId && chatStyle === "standard") {
    return <ModeSelector onSelectMode={handleSelectMode} />;
  }
  switch (chatStyle) {
    case "mindmap": return <MindmapChat key={chatKey} isMobile={isMobile} />;
    case "flashcard": return <FlashcardChat key={chatKey} isMobile={isMobile} />;
    case "note": return <NoteChat key={chatKey} isMobile={isMobile} />;
    case "roadmap": return <RoadmapChat key={chatKey} isMobile={isMobile} />;
    default: return <MainChat key={chatKey} isMobile={isMobile} />;
  }
```

**Step 5: Update handleSelectMode**

```typescript
const handleSelectMode = (style: ChatStyle) => {
  setChatStyle(style);
  setChatKey((k) => k + 1);
  setShowStyleSelector(false);
  // Hide right panel when entering a mode
  if (!isMobile) setRightOpen(false);
};
```

**Step 6: Sync chatStyle with activeConversationType for all types**

Update the existing useEffect (line 56-61) to handle all types:
```typescript
useEffect(() => {
  if (activeConversationType && activeConversationType !== chatStyle) {
    setChatStyle(activeConversationType as ChatStyle);
    setChatKey((k) => k + 1);
  }
}, [activeConversationType]);
```

**Step 7: Commit**

```bash
git add app/components/dashboard/Dashboard.tsx
git commit -m "feat: integrate all focus modes into Dashboard"
```

---

### Task 10: Update LeftPanel Focus Modes Section

**Files:**
- Modify: `app/components/layout/LeftPanel.tsx`

**Step 1: Replace FocusModesCompact with mode shortcuts**

Replace the existing `FocusModesCompact` component (lines 318-381) with a new version that:
- Shows 5 mode buttons: Standart, Mindmap, Flashcard, Not Alma, Roadmap
- Each has an icon + name + color
- Clicking triggers `onSelectMode` callback
- Active mode is highlighted

Update LeftPanel props to accept:
```typescript
interface LeftPanelProps {
  onClose?: () => void;
  onOpenConversation?: (id: string, type?: string) => void;
  onSelectMode?: (mode: string) => void;
}
```

Mode items:
```typescript
const modes = [
  { id: "standard", name: "Standart", icon: <IconChat size={14} />, color: "#10b981" },
  { id: "mindmap", name: "Mindmap", icon: <IconMindMap size={14} />, color: "#8b5cf6" },
  { id: "flashcard", name: "Flashcard", icon: <IconFlashcard size={14} />, color: "#f59e0b" },
  { id: "note", name: "Not Alma", icon: <IconEdit size={14} />, color: "#3b82f6" },
  { id: "roadmap", name: "Roadmap", icon: <IconRoadmap size={14} />, color: "#ef4444" },
];
```

**Step 2: Update LeftPanel usage in Dashboard.tsx**

Pass `onSelectMode={handleSelectMode}` to LeftPanel.

**Step 3: Update ChatHistorySidebar to show mode icons**

In the conversation list, show appropriate icon based on `conv.type`:
- standard → IconChat
- mindmap → IconGitBranch (existing)
- flashcard → IconFlashcard
- note → IconEdit
- roadmap → IconRoadmap

**Step 4: Commit**

```bash
git add app/components/layout/LeftPanel.tsx app/components/dashboard/Dashboard.tsx
git commit -m "feat: update LeftPanel with focus mode shortcuts"
```

---

### Task 11: Update ChatStyleSelector Modal

**Files:**
- Modify: `app/components/chatbot/ChatStyleSelector.tsx`

**Step 1: Expand the modal to show all 5 modes**

Change the 2-column grid to 3-column grid showing all 5 modes. Each card shows:
- Icon with mode color
- Mode name
- Short description
- "YENİ" badge for flashcard, note, roadmap

**Step 2: Commit**

```bash
git add app/components/chatbot/ChatStyleSelector.tsx
git commit -m "feat: expand ChatStyleSelector with all 5 focus modes"
```

---

### Task 12: Add CSS for New Components

**Files:**
- Modify: `app/globals.css`

**Step 1: Add flashcard flip animation styles**

```css
/* Flashcard flip */
.flashcard-container { perspective: 1000px; }
.flashcard-inner {
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  position: relative;
}
.flashcard-inner.flipped { transform: rotateY(180deg); }
.flashcard-front, .flashcard-back {
  backface-visibility: hidden;
  position: absolute;
  inset: 0;
}
.flashcard-back { transform: rotateY(180deg); }
```

**Step 2: Add note block styles**

```css
/* Note blocks */
.note-section-header {
  border-left: 3px solid var(--accent-secondary);
  padding-left: 12px;
}
.note-highlight {
  background: var(--accent-info-light);
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}
.note-key {
  background: var(--accent-primary-light);
  border: 1px solid rgba(16, 185, 129, 0.15);
  border-radius: var(--radius-md);
  padding: 12px 16px;
}
```

**Step 3: Add roadmap timeline styles**

```css
/* Roadmap timeline */
.roadmap-timeline {
  position: relative;
  padding-left: 32px;
}
.roadmap-timeline::before {
  content: '';
  position: absolute;
  left: 11px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: var(--border-primary);
}
.roadmap-step-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid var(--border-primary);
  position: absolute;
  left: 0;
  background: var(--bg-primary);
}
.roadmap-step-dot.completed {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
}
```

**Step 4: Commit**

```bash
git add app/globals.css
git commit -m "feat: add CSS styles for flashcard, note, and roadmap modes"
```

---

### Task 13: Create Branch, Push, and Verify

**Step 1: Create feature branch from master**

```bash
git checkout -b feature/focus-modes
```

Note: All previous commits in Tasks 1-12 should be done on this branch. If they were done on master, cherry-pick or reset.

**Step 2: Push to remote**

```bash
git push -u origin feature/focus-modes
```

**Step 3: Verify Vercel preview deployment**

Check the Vercel preview URL for the branch and confirm the build succeeds.

**Step 4: Manual smoke test**

- Login → Dashboard shows mode selector grid
- Click each mode → correct chat UI opens
- Send a message in each mode → AI responds in correct format
- Left panel shows mode shortcuts
- Chat history shows correct icons per conversation type

---

## Execution Order

**CRITICAL: Create the feature branch FIRST (Task 13 Step 1), then do Tasks 1-12 sequentially.**

Dependencies:
- Task 1 (types) → all other tasks
- Task 2 (API) → Tasks 6, 7, 8 (chat components need API support)
- Task 3 (provider) → Tasks 6, 7, 8, 9 (components use provider)
- Task 5 (icons) → Tasks 4, 6, 7, 8, 10 (components use icons)
- Tasks 4-8 (components) → Task 9 (Dashboard integrates them)
- Task 9 (Dashboard) → Task 10 (LeftPanel needs Dashboard changes)
- Task 12 (CSS) can be done alongside Tasks 6-8

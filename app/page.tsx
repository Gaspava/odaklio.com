"use client";

import { useState } from "react";
import Header from "./components/layout/Header";
import type { PageMode } from "./components/layout/Header";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";
import MainChat from "./components/chatbot/MainChat";
import ExamMode from "./components/modes/ExamMode";
import ReadingMode from "./components/modes/ReadingMode";
import ExploreMode from "./components/modes/ExploreMode";

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeMode, setActiveMode] = useState<PageMode>("study");

  // Some modes hide sidebars automatically
  const showLeftPanel = activeMode === "study";
  const showRightPanel = activeMode === "study";
  const effectiveLeftOpen = showLeftPanel && leftOpen;
  const effectiveRightOpen = showRightPanel && rightOpen;

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Header
        onToggleLeft={() => setLeftOpen(!leftOpen)}
        onToggleRight={() => setRightOpen(!rightOpen)}
        leftOpen={effectiveLeftOpen}
        rightOpen={effectiveRightOpen}
        activeMode={activeMode}
        onModeChange={setActiveMode}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: effectiveLeftOpen ? 280 : 0,
            borderRight: effectiveLeftOpen ? "1px solid var(--border-primary)" : "none",
            background: "var(--bg-secondary)",
          }}
        >
          {effectiveLeftOpen && <LeftPanel />}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {activeMode === "study" && <MainChat />}
          {activeMode === "exam" && <ExamMode />}
          {activeMode === "reading" && <ReadingMode />}
          {activeMode === "explore" && <ExploreMode />}
        </div>

        {/* Right Panel */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: effectiveRightOpen ? 300 : 0,
            borderLeft: effectiveRightOpen ? "1px solid var(--border-primary)" : "none",
            background: "var(--bg-secondary)",
          }}
        >
          {effectiveRightOpen && <RightPanel />}
        </div>
      </div>
    </div>
  );
}

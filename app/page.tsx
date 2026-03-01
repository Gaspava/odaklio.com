"use client";

import { useState } from "react";
import Header, { type ActiveTab } from "./components/layout/Header";
import LeftPanel from "./components/layout/LeftPanel";
import RightPanel from "./components/layout/RightPanel";
import MainChat from "./components/chatbot/MainChat";
import TekrarEt from "./components/pages/TekrarEt";
import Degerlendirme from "./components/pages/Degerlendirme";

export default function Home() {
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>("ogren");

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: "var(--bg-primary)" }}>
      <Header
        onToggleLeft={() => setLeftOpen(!leftOpen)}
        onToggleRight={() => setRightOpen(!rightOpen)}
        leftOpen={leftOpen}
        rightOpen={rightOpen}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: leftOpen ? 280 : 0,
            borderRight: leftOpen ? "1px solid var(--border-primary)" : "none",
            background: "var(--bg-secondary)",
          }}
        >
          {leftOpen && <LeftPanel />}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0 overflow-hidden">
          {activeTab === "ogren" && <MainChat />}
          {activeTab === "tekrar" && <TekrarEt />}
          {activeTab === "degerlendirme" && <Degerlendirme />}
        </div>

        {/* Right Panel */}
        <div
          className="flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            width: rightOpen ? 300 : 0,
            borderLeft: rightOpen ? "1px solid var(--border-primary)" : "none",
            background: "var(--bg-secondary)",
          }}
        >
          {rightOpen && <RightPanel />}
        </div>
      </div>
    </div>
  );
}

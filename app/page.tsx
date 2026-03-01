"use client";

import { useState, useEffect } from "react";
import Header from "./components/layout/Header";
import MainChat from "./components/chatbot/MainChat";
import LearningMenu, {
  type LearningTab,
} from "./components/layout/LearningMenu";
import ChatHistoryTab from "./components/tabs/ChatHistoryTab";
import ToolsTab from "./components/tabs/ToolsTab";
import MentorTab from "./components/tabs/MentorTab";
import SelfAnalysisTab from "./components/tabs/SelfAnalysisTab";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<LearningTab>("odaklan");
  const isMobile = useIsMobile();

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: "var(--bg-primary)" }}
    >
      <Header activeTab={activeTab} />

      <LearningMenu activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "gecmis" && <ChatHistoryTab />}
        {activeTab === "araclar" && <ToolsTab />}
        {activeTab === "odaklan" && <MainChat isMobile={isMobile} />}
        {activeTab === "mentor" && <MentorTab />}
        {activeTab === "analiz" && <SelfAnalysisTab />}
      </div>
    </div>
  );
}

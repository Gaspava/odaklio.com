"use client";

import { useState } from "react";
import Header from "./components/Header";
import LeftSidebar, { type PanelType } from "./components/LeftSidebar";
import ChatArea from "./components/ChatArea";
import MentorBot from "./components/MentorBot";

export default function Home() {
  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [mentorOpen, setMentorOpen] = useState(false);

  return (
    <div
      className="flex h-screen flex-col overflow-hidden"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <Header mentorOpen={mentorOpen} setMentorOpen={setMentorOpen} />
      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar activePanel={activePanel} setActivePanel={setActivePanel} />
        <ChatArea />
        {mentorOpen && <MentorBot onClose={() => setMentorOpen(false)} />}
      </div>
    </div>
  );
}

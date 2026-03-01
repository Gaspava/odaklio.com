"use client";

import FocusModeSelector from "../components/focus/FocusMode";
import MentorBot from "../components/mentor/MentorBot";

export default function FocusPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Focus Modları
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Çalışma tarzına uygun odaklanma modunu seç. Arka plan sesleri ve özel
          ayarlarla dikkatini topla.
        </p>
      </div>

      <FocusModeSelector />

      <MentorBot />
    </div>
  );
}

"use client";

import SpeedReader from "../components/speed-reading/SpeedReader";
import MentorBot from "../components/mentor/MentorBot";

export default function SpeedReadingPage() {
  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-6">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: "var(--text-primary)" }}
        >
          Hızlı Okuma
        </h1>
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          Okuma hızını artır, göz hareketlerini optimize et ve kavrama gücünü
          geliştir.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Mevcut Hız", value: "250 WPM", color: "var(--accent-primary)" },
          { label: "Hedef Hız", value: "500 WPM", color: "var(--accent-success)" },
          { label: "Kavrama", value: "85%", color: "var(--accent-secondary)" },
        ].map((stat) => (
          <div key={stat.label} className="card-static p-4 text-center">
            <div
              className="text-2xl font-bold"
              style={{ color: stat.color }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs mt-1"
              style={{ color: "var(--text-tertiary)" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <SpeedReader />

      {/* Mentor Bot */}
      <MentorBot />
    </div>
  );
}

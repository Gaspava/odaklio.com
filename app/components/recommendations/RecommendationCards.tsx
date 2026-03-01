"use client";

import { IconChevronRight, IconStar, IconLightning, IconBookmark } from "../icons/Icons";

interface Recommendation {
  id: string;
  title: string;
  description: string;
  type: "suggestion" | "question" | "resource";
  tag: string;
  icon: React.ReactNode;
}

const recommendations: Recommendation[] = [
  {
    id: "1",
    title: "Kuantum Fiziği - Dalga-Parçacık İkiliği",
    description:
      "Newton Yasaları çalışmanıza dayanarak, bu konuya geçmenizi öneriyoruz.",
    type: "suggestion",
    tag: "Önerilen",
    icon: <IconLightning size={16} />,
  },
  {
    id: "2",
    title: "İntegral konusunda pratik soruları",
    description:
      "Flashcard çalışmanıza göre bu sorular sizi zorlayabilir.",
    type: "question",
    tag: "Soru Bankası",
    icon: <IconStar size={16} />,
  },
  {
    id: "3",
    title: "Hücre Bölünmesi - Video Ders",
    description:
      "Mind map çalışmanızı tamamlayacak görsel bir kaynak.",
    type: "resource",
    tag: "Kaynak",
    icon: <IconBookmark size={16} />,
  },
];

export default function RecommendationCards() {
  const getTypeColor = (type: Recommendation["type"]) => {
    switch (type) {
      case "suggestion":
        return {
          bg: "var(--accent-primary-light)",
          color: "var(--accent-primary)",
          gradient: "var(--gradient-primary)",
        };
      case "question":
        return {
          bg: "var(--accent-warning-light)",
          color: "var(--accent-warning)",
          gradient: "var(--gradient-accent)",
        };
      case "resource":
        return {
          bg: "var(--accent-secondary-light)",
          color: "var(--accent-secondary)",
          gradient: "var(--gradient-secondary)",
        };
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2
          className="text-lg font-semibold"
          style={{ color: "var(--text-primary)" }}
        >
          Sana Özel Öneriler
        </h2>
        <button
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "var(--accent-primary)" }}
        >
          Tümünü gör
          <IconChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendations.map((rec) => {
          const style = getTypeColor(rec.type);
          return (
            <div
              key={rec.id}
              className="card group cursor-pointer p-4 relative overflow-hidden"
            >
              {/* Top gradient accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: style.gradient }}
              />

              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium"
                  style={{ background: style.bg, color: style.color }}
                >
                  {rec.icon}
                  {rec.tag}
                </span>
              </div>

              <h3
                className="text-sm font-semibold mb-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {rec.title}
              </h3>

              <p
                className="text-xs leading-relaxed mb-3"
                style={{ color: "var(--text-tertiary)" }}
              >
                {rec.description}
              </p>

              <button
                className="flex items-center gap-1 text-xs font-medium transition-all group-hover:gap-2"
                style={{ color: style.color }}
              >
                Keşfet
                <IconChevronRight size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

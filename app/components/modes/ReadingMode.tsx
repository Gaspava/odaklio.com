"use client";

import { useState } from "react";
import {
  IconBookmark,
  IconChevronDown,
  IconPlus,
  IconEye,
} from "../icons/Icons";

const sampleContent = {
  title: "Kuantum Mekaniği: Temel Kavramlar",
  subject: "Fizik",
  readTime: "12 dk",
  sections: [
    {
      heading: "Giriş",
      content: `Kuantum mekaniği, atomaltı parçacıkların davranışlarını inceleyen fizik dalıdır. 20. yüzyılın başlarında klasik fiziğin açıklayamadığı fenomenleri anlamak için geliştirilmiştir.

Klasik fizik, makroskopik dünyayı mükemmel bir şekilde tanımlarken, atom ve atom altı ölçekte yetersiz kalmaktadır. Siyah cisim ışıması, fotoelektrik etki ve atom spektrumları gibi deneysel gözlemler, yeni bir fizik anlayışını zorunlu kılmıştır.`,
    },
    {
      heading: "Dalga-Parçacık İkiliği",
      content: `Kuantum mekaniğinin en temel ilkelerinden biri dalga-parçacık ikiliğidir. Bu ilkeye göre, tüm maddeler ve enerji hem dalga hem de parçacık özelliği gösterir.

Louis de Broglie, 1924 yılında her parçacığın bir dalga boyuna sahip olduğunu öne sürmüştür. De Broglie dalga boyu şu formülle ifade edilir:

λ = h / p

Burada λ dalga boyu, h Planck sabiti (6.626 × 10⁻³⁴ J·s) ve p parçacığın momentumudur.

Young'ın çift yarık deneyi, bu ikiliği en açık şekilde gösteren deneylerden biridir. Tek tek gönderilen elektronlar bile yarıklardan geçtiklerinde girişim deseni oluşturur — bu, her elektronun aynı anda her iki yarıktan da geçtiğini gösterir.`,
    },
    {
      heading: "Heisenberg Belirsizlik İlkesi",
      content: `Werner Heisenberg, 1927 yılında belirsizlik ilkesini formüle etmiştir. Bu ilkeye göre, bir parçacığın konumu ve momentumu aynı anda kesin olarak belirlenemez:

Δx · Δp ≥ ℏ/2

Burada Δx konum belirsizliği, Δp momentum belirsizliği ve ℏ indirgenmiş Planck sabitidir.

Bu belirsizlik, ölçüm cihazlarının yetersizliğinden kaynaklanmaz — doğanın temel bir özelliğidir. Bir parçacığın konumunu ne kadar kesin ölçerseniz, momentumu hakkında o kadar az bilgi sahibi olursunuz ve tersi de geçerlidir.

Bu ilke, kuantum mekaniğinin deterministik olmayan doğasını yansıtır. Klasik fiziğin aksine, kuantum dünyasında olaylar olasılıksal olarak tanımlanır.`,
    },
    {
      heading: "Süperpozisyon İlkesi",
      content: `Süperpozisyon, kuantum mekaniğinin en şaşırtıcı kavramlarından biridir. Bir kuantum sistemi, ölçüm yapılana kadar birden fazla durumun doğrusal bir kombinasyonunda bulunabilir.

Schrödinger'in kedisi düşünce deneyi, bu kavramı makroskopik dünyaya taşıyarak paradoksal durumu gözler önüne serer: bir kutu içindeki kedi, kutu açılana (ölçüm yapılana) kadar hem canlı hem ölü durumundadır.

Matematiksel olarak, bir kuantum durumu |ψ⟩ şu şekilde ifade edilir:

|ψ⟩ = α|0⟩ + β|1⟩

Burada α ve β karmaşık sayılardır ve |α|² + |β|² = 1 koşulunu sağlar. |α|² ve |β|², ilgili durumların ölçülme olasılıklarını verir.`,
    },
    {
      heading: "Kuantum Dolanıklık",
      content: `Kuantum dolanıklık, iki veya daha fazla parçacığın, aralarındaki mesafeden bağımsız olarak birbirleriyle ilişkili kalma durumudur. Einstein bu fenomeni "uzaktaki ürkütücü eylem" (spooky action at a distance) olarak nitelendirmiştir.

Dolanık parçacık çiftlerinde, bir parçacığın durumu ölçüldüğünde, diğer parçacığın durumu da anında belirlenir — aralarında ışık yılları mesafe olsa bile.

John Bell, 1964 yılında Bell eşitsizliklerini formüle etmiştir. Alain Aspect ve ekibinin 1982'deki deneyleri, bu eşitsizliklerin ihlal edildiğini göstererek kuantum dolanıklığın gerçekliğini kanıtlamıştır.

Bugün kuantum dolanıklık, kuantum bilgisayarlar, kuantum kriptografi ve kuantum teleportasyon gibi teknolojilerin temelini oluşturmaktadır.`,
    },
  ],
};

const notes = [
  { id: 1, text: "Dalga-parçacık ikiliği önemli!", color: "var(--accent-primary)" },
  { id: 2, text: "λ = h/p formülünü unutma", color: "var(--accent-warning)" },
  { id: 3, text: "Bell eşitsizlikleri soruluyor", color: "var(--accent-success)" },
];

export default function ReadingMode() {
  const [fontSize, setFontSize] = useState(15);
  const [activeSection, setActiveSection] = useState(0);
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [showNotes, setShowNotes] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [userNotes, setUserNotes] = useState(notes);

  const toggleBookmark = (index: number) => {
    setBookmarked((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const totalWords = sampleContent.sections.reduce(
    (sum, s) => sum + s.content.split(/\s+/).length, 0
  );

  const addNote = () => {
    if (!noteInput.trim()) return;
    const colors = ["var(--accent-primary)", "var(--accent-warning)", "var(--accent-success)", "var(--accent-secondary)"];
    setUserNotes((prev) => [
      ...prev,
      { id: Date.now(), text: noteInput, color: colors[prev.length % colors.length] },
    ]);
    setNoteInput("");
  };

  return (
    <div className="flex h-full">
      {/* Main Reading Area */}
      <div className="flex-1 overflow-y-auto">
        {/* Reading Header */}
        <div
          className="sticky top-0 z-10 px-8 py-3 flex items-center justify-between"
          style={{
            background: "var(--bg-primary)",
            borderBottom: "1px solid var(--border-secondary)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
              style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
            >
              {sampleContent.subject}
            </span>
            <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              <IconEye size={12} />
              {sampleContent.readTime} okuma
            </span>
            <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
              {totalWords} kelime
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size */}
            <div
              className="flex items-center gap-1 rounded-lg px-2 py-1"
              style={{ background: "var(--bg-tertiary)" }}
            >
              <button
                onClick={() => setFontSize(Math.max(12, fontSize - 1))}
                className="text-xs font-bold px-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                A-
              </button>
              <span className="text-[10px] px-1 tabular-nums" style={{ color: "var(--text-secondary)" }}>
                {fontSize}
              </span>
              <button
                onClick={() => setFontSize(Math.min(22, fontSize + 1))}
                className="text-xs font-bold px-1"
                style={{ color: "var(--text-tertiary)" }}
              >
                A+
              </button>
            </div>

            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[11px] font-medium transition-all"
              style={{
                background: showNotes ? "var(--accent-primary-light)" : "var(--bg-tertiary)",
                color: showNotes ? "var(--accent-primary)" : "var(--text-tertiary)",
              }}
            >
              Notlar
              <span
                className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white"
                style={{ background: "var(--accent-primary)" }}
              >
                {userNotes.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-8 py-10">
          {/* Title */}
          <h1
            className="text-3xl font-bold mb-8 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {sampleContent.title}
          </h1>

          {/* Table of Contents */}
          <div
            className="rounded-xl p-5 mb-10"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              İçindekiler
            </h3>
            <div className="space-y-1">
              {sampleContent.sections.map((section, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActiveSection(i);
                    document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-all"
                  style={{
                    background: activeSection === i ? "var(--accent-primary-light)" : "transparent",
                    color: activeSection === i ? "var(--accent-primary)" : "var(--text-secondary)",
                  }}
                >
                  <span className="text-[10px] font-bold tabular-nums" style={{ opacity: 0.5 }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium">{section.heading}</span>
                  {bookmarked.includes(i) && (
                    <IconBookmark size={12} style={{ color: "var(--accent-warning)", marginLeft: "auto" }} />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Sections */}
          {sampleContent.sections.map((section, i) => (
            <div key={i} id={`section-${i}`} className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                <h2
                  className="text-xl font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  {section.heading}
                </h2>
                <button
                  onClick={() => toggleBookmark(i)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
                  style={{
                    background: bookmarked.includes(i) ? "var(--accent-warning)" : "var(--bg-tertiary)",
                    color: bookmarked.includes(i) ? "#fff" : "var(--text-tertiary)",
                  }}
                >
                  <IconBookmark size={13} />
                </button>
              </div>
              <div
                className="leading-[1.9] whitespace-pre-line select-text"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: `${fontSize}px`,
                }}
              >
                {section.content}
              </div>
            </div>
          ))}

          {/* End Card */}
          <div
            className="rounded-2xl p-8 text-center mb-8"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4"
              style={{ background: "var(--accent-success)", boxShadow: "0 0 30px var(--accent-success)40" }}
            >
              <IconEye size={24} className="text-white" />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "var(--text-primary)" }}>
              Okuma Tamamlandı!
            </h3>
            <p className="text-sm" style={{ color: "var(--text-tertiary)" }}>
              {totalWords} kelime okudun. Notlarını gözden geçirmeyi unutma.
            </p>
          </div>
        </div>
      </div>

      {/* Notes Sidebar */}
      {showNotes && (
        <div
          className="w-72 flex-shrink-0 overflow-y-auto border-l flex flex-col"
          style={{
            borderColor: "var(--border-primary)",
            background: "var(--bg-secondary)",
          }}
        >
          <div className="p-4 flex-shrink-0" style={{ borderBottom: "1px solid var(--border-primary)" }}>
            <h3
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--text-tertiary)" }}
            >
              Notlarım
            </h3>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addNote()}
                placeholder="Not ekle..."
                className="input"
                style={{ height: 32, fontSize: 11, padding: "0 10px" }}
              />
              <button
                onClick={addNote}
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-white"
                style={{ background: "var(--accent-primary)" }}
              >
                <IconPlus size={14} />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-2 flex-1 overflow-y-auto">
            {userNotes.map((note) => (
              <div
                key={note.id}
                className="rounded-lg p-3"
                style={{
                  background: "var(--bg-card)",
                  borderLeft: `3px solid ${note.color}`,
                }}
              >
                <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                  {note.text}
                </p>
              </div>
            ))}
          </div>

          {/* Bookmarked Sections */}
          {bookmarked.length > 0 && (
            <div className="p-4 flex-shrink-0" style={{ borderTop: "1px solid var(--border-primary)" }}>
              <h4
                className="text-[10px] font-semibold uppercase tracking-wider mb-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                Yer İmleri
              </h4>
              <div className="space-y-1">
                {bookmarked.map((i) => (
                  <button
                    key={i}
                    onClick={() => document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth" })}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <IconBookmark size={10} style={{ color: "var(--accent-warning)" }} />
                    <span className="text-[11px] font-medium">{sampleContent.sections[i].heading}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

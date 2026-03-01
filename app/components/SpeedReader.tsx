"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const SAMPLE_TEXT = `Kuantum mekanigi, atom alti parcaciklarin davranislarini inceleyen fizik dalidir. Bu alanda parcaciklar hem dalga hem de parcacik ozelligi gosterir. Heisenberg belirsizlik ilkesine gore, bir parcacigin hem konumunu hem de momentumunu ayni anda kesin olarak belirlemek mumkun degildir. Bu durum, klasik fizikten tamamen farkli bir yaklasim gerektirir. Kuantum dolanikligi ise iki parcacigin birbirine bagli olmasidir.`;

export default function SpeedReader() {
  const [text, setText] = useState(SAMPLE_TEXT);
  const [words, setWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState(0);
  const [wpm, setWpm] = useState(250);
  const [playing, setPlaying] = useState(false);
  const [editing, setEditing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setWords(text.split(/\s+/).filter(Boolean));
  }, [text]);

  const progress = words.length > 0 ? ((currentWord + 1) / words.length) * 100 : 0;

  const tick = useCallback(() => {
    setCurrentWord((c) => {
      if (c >= words.length - 1) {
        setPlaying(false);
        return c;
      }
      return c + 1;
    });
  }, [words.length]);

  useEffect(() => {
    if (playing) {
      const ms = 60000 / wpm;
      intervalRef.current = setInterval(tick, ms);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playing, wpm, tick]);

  const reset = () => {
    setPlaying(false);
    setCurrentWord(0);
  };

  const displayWord = words[currentWord] || "";

  // Find pivot letter (roughly the center, slightly left)
  const pivotIndex = Math.max(0, Math.floor(displayWord.length / 2) - 1);
  const before = displayWord.slice(0, pivotIndex);
  const pivot = displayWord[pivotIndex] || "";
  const after = displayWord.slice(pivotIndex + 1);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
          Hizli Okuma
        </h3>
        <button
          onClick={() => setEditing(!editing)}
          className="rounded-lg px-2 py-1 text-xs"
          style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          {editing ? "Okuyucu" : "Metin Duzenle"}
        </button>
      </div>

      {editing ? (
        <textarea
          value={text}
          onChange={(e) => { setText(e.target.value); setCurrentWord(0); }}
          className="mb-4 flex-1 resize-none rounded-xl border p-3 text-xs leading-relaxed outline-none"
          style={{
            backgroundColor: "var(--bg-tertiary)",
            borderColor: "var(--border-color)",
            color: "var(--text-primary)",
          }}
          placeholder="Okumak istediginiz metni yapisirin..."
        />
      ) : (
        <>
          {/* RSVP Display */}
          <div
            className="mb-6 flex flex-col items-center justify-center rounded-2xl py-12"
            style={{ backgroundColor: "var(--bg-tertiary)" }}
          >
            <div className="relative flex items-baseline font-mono text-2xl font-bold">
              <span style={{ color: "var(--text-secondary)" }} className="text-right" dir="ltr">
                {before}
              </span>
              <span style={{ color: "#e74c3c" }}>{pivot}</span>
              <span style={{ color: "var(--text-secondary)" }}>{after}</span>
            </div>
            <div className="mt-1 h-0.5 w-24 rounded" style={{ backgroundColor: "var(--accent)", opacity: 0.3 }} />
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="mb-1 flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
              <span>Kelime {currentWord + 1}/{words.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ backgroundColor: "var(--border-color)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${progress}%`, backgroundColor: "var(--accent)" }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="mb-4 flex justify-center gap-3">
            <button
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              ↺
            </button>
            <button
              onClick={() => setPlaying(!playing)}
              className="rounded-xl px-8 py-2.5 text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}
            >
              {playing ? "Duraklat" : "Baslat"}
            </button>
            <button
              onClick={() => setCurrentWord((c) => Math.min(c + 5, words.length - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm"
              style={{ backgroundColor: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
            >
              ⏭
            </button>
          </div>
        </>
      )}

      {/* WPM slider */}
      <div className="rounded-xl p-3" style={{ backgroundColor: "var(--bg-tertiary)" }}>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Hiz</span>
          <span className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            {wpm} KPD
          </span>
        </div>
        <input
          type="range"
          min={100}
          max={800}
          step={25}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="w-full accent-purple-500"
        />
        <div className="mt-1 flex justify-between text-[10px]" style={{ color: "var(--text-tertiary)" }}>
          <span>Yavas</span>
          <span>Hizli</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="mt-3 flex gap-2">
        <div className="flex-1 rounded-xl p-2 text-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {Math.round(words.length / (wpm / 60))}s
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Tahmini Sure
          </div>
        </div>
        <div className="flex-1 rounded-xl p-2 text-center" style={{ backgroundColor: "var(--bg-tertiary)" }}>
          <div className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>
            {words.length}
          </div>
          <div className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>
            Kelime
          </div>
        </div>
      </div>
    </div>
  );
}

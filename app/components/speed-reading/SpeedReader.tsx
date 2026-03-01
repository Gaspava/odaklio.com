"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconPlay,
  IconPause,
  IconRefresh,
  IconEye,
  IconHelp,
} from "../icons/Icons";

const sampleText = `Kuantum mekaniği, atomaltı parçacıkların davranışlarını inceleyen fizik dalıdır.
Klasik fiziğin aksine, kuantum dünyasında parçacıklar aynı anda birden fazla durumda bulunabilir.
Bu kavrama süperpozisyon denir. Werner Heisenberg'in belirsizlik ilkesine göre,
bir parçacığın hem konumunu hem de momentumunu aynı anda kesin olarak bilmek imkansızdır.
Kuantum dolanıklık ise iki parçacığın aralarındaki mesafeden bağımsız olarak
birbirleriyle bağlantılı kalmasıdır. Albert Einstein bu fenomeni "uzaktaki ürkütücü eylem" olarak nitelendirmiştir.
Kuantum mekaniği modern teknolojinin temelini oluşturur: lazerler, transistörler, MRI cihazları
ve yakın gelecekte kuantum bilgisayarları bu bilim dalının uygulamalarıdır.`.split(/\s+/);

export default function SpeedReader() {
  const [words] = useState<string[]>(sampleText);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [wpm, setWpm] = useState(300);
  const [chunkSize, setChunkSize] = useState(1);
  const [highlightMode, setHighlightMode] = useState<"single" | "rsvp" | "highlight">("rsvp");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentWord = words.slice(currentIndex, currentIndex + chunkSize).join(" ");
  const progress = Math.round((currentIndex / words.length) * 100);

  const tick = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev + chunkSize >= words.length) {
        setIsPlaying(false);
        return 0;
      }
      return prev + chunkSize;
    });
  }, [chunkSize, words.length]);

  useEffect(() => {
    if (isPlaying) {
      const interval = (60 / wpm) * 1000;
      intervalRef.current = setInterval(tick, interval);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, wpm, tick]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* RSVP Display */}
      <div
        className="card-static flex flex-col items-center justify-center p-12 relative overflow-hidden"
        style={{ minHeight: 240 }}
      >
        {/* Focus Guide Lines */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[2px] h-full opacity-10"
          style={{ background: "var(--accent-primary)" }}
        />

        {highlightMode === "rsvp" && (
          <div className="text-center">
            <p
              className="text-4xl font-semibold tracking-wide transition-all duration-75"
              style={{ color: "var(--text-primary)" }}
            >
              {currentWord || "Başlamak için oynat butonuna bas"}
            </p>
            <div
              className="mt-4 h-[2px] mx-auto transition-all duration-300"
              style={{
                width: `${progress}%`,
                maxWidth: 200,
                background: "var(--gradient-primary)",
              }}
            />
          </div>
        )}

        {highlightMode === "highlight" && (
          <div className="max-w-2xl text-center leading-loose">
            {words.map((word, i) => (
              <span
                key={i}
                className="inline-block mx-0.5 transition-all duration-75"
                style={{
                  color:
                    i >= currentIndex && i < currentIndex + chunkSize
                      ? "var(--accent-primary)"
                      : i < currentIndex
                        ? "var(--text-tertiary)"
                        : "var(--text-secondary)",
                  fontWeight:
                    i >= currentIndex && i < currentIndex + chunkSize
                      ? 700
                      : 400,
                  fontSize:
                    i >= currentIndex && i < currentIndex + chunkSize
                      ? "18px"
                      : "15px",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}

        {/* "Anlamadım" Overlay on Hover */}
        <div className="absolute bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity">
          <button
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{
              background: "var(--accent-warning-light)",
              color: "var(--accent-warning)",
            }}
          >
            <IconHelp size={12} />
            Anlamadım
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="card-static p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-primary)" }}
            >
              {isPlaying ? <IconPause size={18} /> : <IconPlay size={18} />}
            </button>
            <button
              onClick={reset}
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "var(--bg-tertiary)",
                color: "var(--text-secondary)",
              }}
            >
              <IconRefresh size={18} />
            </button>
          </div>

          {/* WPM Control */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              Hız
            </span>
            <input
              type="range"
              min="100"
              max="800"
              step="50"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
              className="h-1.5 w-32 cursor-pointer appearance-none rounded-full"
              style={{ accentColor: "var(--accent-primary)" }}
            />
            <span
              className="min-w-[64px] rounded-lg px-2 py-1 text-center text-xs font-bold"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              {wpm} WPM
            </span>
          </div>

          {/* Chunk Size */}
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-tertiary)" }}
            >
              Kelime Grubu
            </span>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                onClick={() => setChunkSize(n)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-medium"
                style={{
                  background:
                    chunkSize === n
                      ? "var(--accent-primary)"
                      : "var(--bg-tertiary)",
                  color: chunkSize === n ? "white" : "var(--text-secondary)",
                }}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Display Mode */}
          <div className="flex items-center gap-2">
            <span style={{ color: "var(--text-tertiary)" }}>
              <IconEye size={14} />
            </span>
            {(["rsvp", "highlight"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHighlightMode(mode)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{
                  background:
                    highlightMode === mode
                      ? "var(--accent-primary-light)"
                      : "var(--bg-tertiary)",
                  color:
                    highlightMode === mode
                      ? "var(--accent-primary)"
                      : "var(--text-tertiary)",
                }}
              >
                {mode === "rsvp" ? "RSVP" : "Vurgula"}
              </button>
            ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs"
              style={{ color: "var(--text-tertiary)" }}
            >
              İlerleme
            </span>
            <span
              className="text-xs font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {currentIndex}/{words.length} kelime ({progress}%)
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                background: "var(--gradient-primary)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  IconCheck,
  IconX,
  IconChevronRight,
  IconChevronLeft,
  IconClock,
  IconTarget,
  IconAward,
  IconLightning,
  IconRefresh,
} from "../icons/Icons";

interface Question {
  id: number;
  type: "multiple" | "truefalse" | "fill";
  question: string;
  options?: string[];
  correctAnswer: number | string;
  subject: string;
  difficulty: "Kolay" | "Orta" | "Zor";
}

const questions: Question[] = [
  {
    id: 1,
    type: "multiple",
    question: "Newton'un ikinci hareket yasası hangi formülle ifade edilir?",
    options: ["F = ma", "E = mc²", "F = mv", "P = mv"],
    correctAnswer: 0,
    subject: "Fizik",
    difficulty: "Kolay",
  },
  {
    id: 2,
    type: "multiple",
    question: "Mitoz bölünme sonucunda kaç hücre oluşur?",
    options: ["1", "2", "4", "8"],
    correctAnswer: 1,
    subject: "Biyoloji",
    difficulty: "Kolay",
  },
  {
    id: 3,
    type: "truefalse",
    question: "Işık hızı vakumda yaklaşık 3 × 10⁸ m/s'dir.",
    options: ["Doğru", "Yanlış"],
    correctAnswer: 0,
    subject: "Fizik",
    difficulty: "Kolay",
  },
  {
    id: 4,
    type: "multiple",
    question: "∫ 2x dx ifadesinin sonucu nedir?",
    options: ["x² + C", "2x² + C", "x + C", "2 + C"],
    correctAnswer: 0,
    subject: "Matematik",
    difficulty: "Orta",
  },
  {
    id: 5,
    type: "multiple",
    question: "DNA'nın yapı taşı olan nükleotidler hangi bileşenlerden oluşur?",
    options: [
      "Şeker, Fosfat, Baz",
      "Amino asit, Şeker, Baz",
      "Protein, Fosfat, Baz",
      "Şeker, Lipid, Baz",
    ],
    correctAnswer: 0,
    subject: "Biyoloji",
    difficulty: "Orta",
  },
  {
    id: 6,
    type: "truefalse",
    question: "Entropi, kapalı bir sistemde her zaman artar veya sabit kalır.",
    options: ["Doğru", "Yanlış"],
    correctAnswer: 0,
    subject: "Fizik",
    difficulty: "Zor",
  },
  {
    id: 7,
    type: "multiple",
    question: "Aşağıdakilerden hangisi bir vektörel büyüklüktür?",
    options: ["Kütle", "Sıcaklık", "Hız", "Enerji"],
    correctAnswer: 2,
    subject: "Fizik",
    difficulty: "Kolay",
  },
  {
    id: 8,
    type: "multiple",
    question: "pH değeri 7'den küçük olan çözeltiler nasıl sınıflandırılır?",
    options: ["Bazik", "Nötr", "Asidik", "Amfoter"],
    correctAnswer: 2,
    subject: "Kimya",
    difficulty: "Kolay",
  },
];

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors = {
    Kolay: { bg: "var(--accent-success)", text: "#fff" },
    Orta: { bg: "var(--accent-warning)", text: "#fff" },
    Zor: { bg: "var(--accent-danger)", text: "#fff" },
  };
  const c = colors[difficulty as keyof typeof colors] || colors.Orta;
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{ background: c.bg, color: c.text }}
    >
      {difficulty}
    </span>
  );
}

export default function ExamMode() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string>>({});
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const q = questions[currentQuestion];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter(
    (a, i) => a === questions[Object.keys(answers).map(Number)[Object.values(answers).indexOf(a)]]?.correctAnswer
  ).length;

  const progress = (answeredCount / totalQuestions) * 100;

  const handleAnswer = (optionIndex: number) => {
    if (isAnswered) return;
    setSelectedAnswer(optionIndex);
    setIsAnswered(true);
    setAnswers((prev) => ({ ...prev, [q.id]: optionIndex }));
  };

  const goNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
    }
  };

  const goPrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      const prevAnswer = answers[questions[currentQuestion - 1].id];
      setSelectedAnswer(typeof prevAnswer === "number" ? prevAnswer : null);
      setIsAnswered(prevAnswer !== undefined);
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setSelectedAnswer(null);
    setIsAnswered(false);
  };

  const getScore = () => {
    let correct = 0;
    for (const [qId, answer] of Object.entries(answers)) {
      const question = questions.find((q) => q.id === Number(qId));
      if (question && answer === question.correctAnswer) correct++;
    }
    return correct;
  };

  if (showResult) {
    const score = getScore();
    const percentage = Math.round((score / totalQuestions) * 100);

    return (
      <div className="flex flex-col h-full items-center justify-center p-8">
        <div
          className="w-full max-w-lg rounded-2xl p-8 text-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-primary)",
            boxShadow: "var(--shadow-xl)",
          }}
        >
          {/* Trophy */}
          <div
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full mb-6"
            style={{
              background: percentage >= 70 ? "var(--accent-success)" : percentage >= 40 ? "var(--accent-warning)" : "var(--accent-danger)",
              boxShadow: `0 0 40px ${percentage >= 70 ? "var(--accent-success)" : percentage >= 40 ? "var(--accent-warning)" : "var(--accent-danger)"}40`,
            }}
          >
            <IconAward size={36} className="text-white" />
          </div>

          <h2
            className="text-2xl font-bold mb-2"
            style={{ color: "var(--text-primary)" }}
          >
            {percentage >= 70 ? "Harika!" : percentage >= 40 ? "İyi Gidiyorsun!" : "Tekrar Dene!"}
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-tertiary)" }}>
            Sınav tamamlandı
          </p>

          {/* Score Circle */}
          <div className="relative mx-auto w-32 h-32 mb-6">
            <svg width="128" height="128" className="-rotate-90">
              <circle cx="64" cy="64" r="56" fill="none" stroke="var(--bg-tertiary)" strokeWidth="8" />
              <circle
                cx="64" cy="64" r="56"
                fill="none"
                stroke={percentage >= 70 ? "var(--accent-success)" : percentage >= 40 ? "var(--accent-warning)" : "var(--accent-danger)"}
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 56}
                strokeDashoffset={2 * Math.PI * 56 * (1 - percentage / 100)}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 1s ease" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                %{percentage}
              </span>
              <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                {score}/{totalQuestions}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-xl p-3" style={{ background: "var(--bg-tertiary)" }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconCheck size={12} style={{ color: "var(--accent-success)" }} />
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--accent-success)" }}>{score}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Doğru</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--bg-tertiary)" }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconX size={12} style={{ color: "var(--accent-danger)" }} />
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--accent-danger)" }}>{totalQuestions - score}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Yanlış</p>
            </div>
            <div className="rounded-xl p-3" style={{ background: "var(--bg-tertiary)" }}>
              <div className="flex items-center justify-center gap-1 mb-1">
                <IconTarget size={12} style={{ color: "var(--accent-primary)" }} />
              </div>
              <p className="text-lg font-bold" style={{ color: "var(--accent-primary)" }}>%{percentage}</p>
              <p className="text-[10px]" style={{ color: "var(--text-tertiary)" }}>Başarı</p>
            </div>
          </div>

          <button
            onClick={resetQuiz}
            className="flex items-center gap-2 mx-auto rounded-xl px-6 py-3 text-sm font-medium text-white transition-all hover:opacity-90"
            style={{ background: "var(--gradient-primary)" }}
          >
            <IconRefresh size={16} />
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-primary)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <IconClock size={13} style={{ color: "var(--accent-primary)" }} />
            <span className="text-xs font-medium tabular-nums" style={{ color: "var(--text-primary)" }}>
              25:00
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              {q.subject}
            </span>
            <DifficultyBadge difficulty={q.difficulty} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>
            {answeredCount}/{totalQuestions} cevaplandı
          </span>
          <div
            className="w-32 h-2 rounded-full overflow-hidden"
            style={{ background: "var(--bg-tertiary)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: "var(--gradient-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* Question Navigation Dots */}
      <div
        className="flex items-center justify-center gap-1.5 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid var(--border-secondary)" }}
      >
        {questions.map((_, i) => {
          const isAnsweredQ = answers[questions[i].id] !== undefined;
          const isCurrent = i === currentQuestion;
          const isCorrectQ = isAnsweredQ && answers[questions[i].id] === questions[i].correctAnswer;
          return (
            <button
              key={i}
              onClick={() => {
                setCurrentQuestion(i);
                const prevA = answers[questions[i].id];
                setSelectedAnswer(typeof prevA === "number" ? prevA : null);
                setIsAnswered(prevA !== undefined);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold transition-all"
              style={{
                background: isCurrent
                  ? "var(--accent-primary)"
                  : isAnsweredQ
                    ? isCorrectQ
                      ? "var(--accent-success)"
                      : "var(--accent-danger)"
                    : "var(--bg-tertiary)",
                color: isCurrent || isAnsweredQ ? "#fff" : "var(--text-tertiary)",
                transform: isCurrent ? "scale(1.1)" : "scale(1)",
                boxShadow: isCurrent ? "0 0 12px var(--accent-primary)" : "none",
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Area */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Question Card */}
          <div
            className="rounded-2xl p-8 mb-6"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="flex items-start gap-4 mb-8">
              <span
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                style={{ background: "var(--gradient-primary)" }}
              >
                {currentQuestion + 1}
              </span>
              <h2
                className="text-lg font-semibold leading-relaxed pt-1.5"
                style={{ color: "var(--text-primary)" }}
              >
                {q.question}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {q.options?.map((option, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === q.correctAnswer;
                const showCorrectness = isAnswered;

                let optBg = "var(--bg-tertiary)";
                let optBorder = "1px solid transparent";
                let optColor = "var(--text-primary)";
                let indicatorBg = "var(--bg-secondary)";
                let indicatorColor = "var(--text-tertiary)";

                if (showCorrectness && isCorrect) {
                  optBg = "rgba(16, 185, 129, 0.1)";
                  optBorder = "1px solid var(--accent-success)";
                  indicatorBg = "var(--accent-success)";
                  indicatorColor = "#fff";
                } else if (showCorrectness && isSelected && !isCorrect) {
                  optBg = "rgba(239, 68, 68, 0.1)";
                  optBorder = "1px solid var(--accent-danger)";
                  indicatorBg = "var(--accent-danger)";
                  indicatorColor = "#fff";
                } else if (isSelected) {
                  optBg = "var(--accent-primary-light)";
                  optBorder = "1px solid var(--accent-primary)";
                  indicatorBg = "var(--accent-primary)";
                  indicatorColor = "#fff";
                }

                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={isAnswered}
                    className="flex w-full items-center gap-4 rounded-xl px-5 py-4 text-left transition-all hover:scale-[1.01]"
                    style={{
                      background: optBg,
                      border: optBorder,
                      opacity: isAnswered && !isSelected && !isCorrect ? 0.5 : 1,
                      cursor: isAnswered ? "default" : "pointer",
                    }}
                  >
                    <span
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{ background: indicatorBg, color: indicatorColor }}
                    >
                      {showCorrectness && isCorrect ? (
                        <IconCheck size={14} />
                      ) : showCorrectness && isSelected ? (
                        <IconX size={14} />
                      ) : (
                        String.fromCharCode(65 + i)
                      )}
                    </span>
                    <span className="text-sm font-medium" style={{ color: optColor }}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {isAnswered && (
              <div
                className="mt-6 rounded-xl p-4 flex items-center gap-3 animate-fade-in"
                style={{
                  background: selectedAnswer === q.correctAnswer
                    ? "rgba(16, 185, 129, 0.1)"
                    : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${selectedAnswer === q.correctAnswer ? "var(--accent-success)" : "var(--accent-danger)"}`,
                }}
              >
                {selectedAnswer === q.correctAnswer ? (
                  <IconCheck size={18} style={{ color: "var(--accent-success)" }} />
                ) : (
                  <IconLightning size={18} style={{ color: "var(--accent-danger)" }} />
                )}
                <span
                  className="text-sm font-medium"
                  style={{
                    color: selectedAnswer === q.correctAnswer
                      ? "var(--accent-success)"
                      : "var(--accent-danger)",
                  }}
                >
                  {selectedAnswer === q.correctAnswer
                    ? "Doğru cevap! Harika gidiyorsun!"
                    : `Yanlış! Doğru cevap: ${q.options?.[q.correctAnswer as number]}`}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ borderTop: "1px solid var(--border-primary)" }}
      >
        <button
          onClick={goPrev}
          disabled={currentQuestion === 0}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all disabled:opacity-30"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
        >
          <IconChevronLeft size={16} />
          Önceki
        </button>

        <span className="text-sm font-medium" style={{ color: "var(--text-tertiary)" }}>
          Soru {currentQuestion + 1} / {totalQuestions}
        </span>

        <button
          onClick={goNext}
          disabled={!isAnswered}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-all disabled:opacity-30 hover:opacity-90"
          style={{ background: "var(--gradient-primary)" }}
        >
          {currentQuestion === totalQuestions - 1 ? "Bitir" : "Sonraki"}
          <IconChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

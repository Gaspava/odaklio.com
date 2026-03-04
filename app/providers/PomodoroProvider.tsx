"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import { useConversation } from "./ConversationProvider";
import {
  createPomodoroSession,
  completePomodoroSession,
  cancelPomodoroSession,
  updatePomodoroSubject,
  getTodayPomodoros,
} from "@/lib/db/pomodoro";

interface PomodoroSettings {
  workMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
}

interface PomodoroContextType {
  isRunning: boolean;
  isPaused: boolean;
  mode: "work" | "break";
  timeLeft: number;
  totalTime: number;
  settings: PomodoroSettings;
  completedPomodoros: number;
  currentSubject: string | null;
  currentPage: string;
  start: () => Promise<void>;
  pause: () => void;
  resume: () => void;
  reset: () => Promise<void>;
  skip: () => Promise<void>;
  updateSettings: (settings: Partial<PomodoroSettings>) => void;
  setCurrentPage: (page: string) => void;
  setCurrentSubject: (subject: string | null) => void;
}

const defaultSettings: PomodoroSettings = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
};

const TIMER_STORAGE_KEY = "odaklio-pomodoro-timer";
const SETTINGS_STORAGE_KEY = "odaklio-pomodoro-settings";

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  mode: "work" | "break";
  endTime: number; // timestamp when timer should end
  pausedTimeLeft: number; // seconds left when paused
  totalTime: number;
  sessionId: string | null;
  pomodoroCount: number;
  currentSubject: string | null;
  elapsedSeconds: number;
}

function saveTimerState(state: TimerState) {
  try {
    localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

function loadTimerState(): TimerState | null {
  try {
    const saved = localStorage.getItem(TIMER_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return null;
}

function clearTimerState() {
  try {
    localStorage.removeItem(TIMER_STORAGE_KEY);
  } catch { /* ignore */ }
}

const PomodoroContext = createContext<PomodoroContextType>({
  isRunning: false,
  isPaused: false,
  mode: "work",
  timeLeft: 25 * 60,
  totalTime: 25 * 60,
  settings: defaultSettings,
  completedPomodoros: 0,
  currentSubject: null,
  currentPage: "focus",
  start: async () => {},
  pause: () => {},
  resume: () => {},
  reset: async () => {},
  skip: async () => {},
  updateSettings: () => {},
  setCurrentPage: () => {},
  setCurrentSubject: () => {},
});

export function usePomodoro() {
  return useContext(PomodoroContext);
}

export default function PomodoroProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const { activeConversationId } = useConversation();

  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          /* use default */
        }
      }
    }
    return defaultSettings;
  });

  // Restore timer state from localStorage
  const [isRunning, setIsRunning] = useState(() => {
    const saved = loadTimerState();
    return saved ? saved.isRunning : false;
  });
  const [isPaused, setIsPaused] = useState(() => {
    const saved = loadTimerState();
    return saved ? saved.isPaused : false;
  });
  const [mode, setMode] = useState<"work" | "break">(() => {
    const saved = loadTimerState();
    return saved ? saved.mode : "work";
  });
  const [timeLeft, setTimeLeft] = useState(() => {
    const saved = loadTimerState();
    if (!saved || !saved.isRunning) {
      return saved?.pausedTimeLeft || settings.workMinutes * 60;
    }
    if (saved.isPaused) {
      return saved.pausedTimeLeft;
    }
    // Calculate remaining time from endTime
    const remaining = Math.ceil((saved.endTime - Date.now()) / 1000);
    return remaining > 0 ? remaining : 0;
  });
  const [totalTime, setTotalTime] = useState(() => {
    const saved = loadTimerState();
    return saved ? saved.totalTime : settings.workMinutes * 60;
  });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentSubject, setCurrentSubject] = useState<string | null>(() => {
    const saved = loadTimerState();
    return saved ? saved.currentSubject : null;
  });
  const [currentPage, setCurrentPage] = useState("focus");
  const [pomodoroCount, setPomodoroCount] = useState(() => {
    const saved = loadTimerState();
    return saved ? saved.pomodoroCount : 0;
  });

  const _savedForRefs = loadTimerState();
  const sessionIdRef = useRef<string | null>(_savedForRefs?.sessionId ?? null);
  const elapsedRef = useRef(_savedForRefs?.elapsedSeconds ?? 0);
  const modeRef = useRef(mode);
  const settingsRef = useRef(settings);
  const pomodoroCountRef = useRef(pomodoroCount);
  const currentSubjectRef = useRef(currentSubject);
  const currentPageRef = useRef(currentPage);
  const activeConversationIdRef = useRef(activeConversationId);

  // Keep refs in sync
  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { settingsRef.current = settings; }, [settings]);
  useEffect(() => { pomodoroCountRef.current = pomodoroCount; }, [pomodoroCount]);
  useEffect(() => { currentSubjectRef.current = currentSubject; }, [currentSubject]);
  useEffect(() => { currentPageRef.current = currentPage; }, [currentPage]);
  useEffect(() => { activeConversationIdRef.current = activeConversationId; }, [activeConversationId]);

  // Persist timer state whenever it changes
  useEffect(() => {
    if (isRunning) {
      const endTime = isPaused ? 0 : Date.now() + timeLeft * 1000;
      saveTimerState({
        isRunning,
        isPaused,
        mode,
        endTime,
        pausedTimeLeft: isPaused ? timeLeft : 0,
        totalTime,
        sessionId: sessionIdRef.current,
        pomodoroCount,
        currentSubject,
        elapsedSeconds: elapsedRef.current,
      });
    } else {
      clearTimerState();
    }
  }, [isRunning, isPaused, mode, totalTime, pomodoroCount, currentSubject]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load today's completed count on mount
  useEffect(() => {
    if (user) {
      getTodayPomodoros(user.id)
        .then(setCompletedPomodoros)
        .catch(console.error);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle timer that completed while page was closed
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft <= 0) {
      handleTimerComplete();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    }
  }, [settings]);

  const handleTimerComplete = useCallback(async () => {
    if (!user) return;

    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;
    const currentCount = pomodoroCountRef.current;

    // Complete current session in DB
    const completedSessionId = sessionIdRef.current;
    if (completedSessionId) {
      try {
        await completePomodoroSession(completedSessionId, elapsedRef.current);
      } catch (e) {
        console.error("Failed to complete pomodoro session:", e);
      }
      sessionIdRef.current = null;
    }

    if (currentMode === "work") {
      // Classify subject via LLM in background (fire-and-forget)
      const subjectTitle = currentSubjectRef.current;
      if (completedSessionId && subjectTitle) {
        fetch("/api/classify-subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: subjectTitle }),
        })
          .then((res) => res.json())
          .then(({ subject }) => {
            if (subject) {
              updatePomodoroSubject(completedSessionId, subject).catch(console.error);
            }
          })
          .catch(console.error);
      }
      const newCount = currentCount + 1;
      setPomodoroCount(newCount);
      setCompletedPomodoros((prev) => prev + 1);

      const isLongBreak = newCount % 4 === 0;
      const breakMinutes = isLongBreak
        ? currentSettings.longBreakMinutes
        : currentSettings.shortBreakMinutes;
      setMode("break");
      setTimeLeft(breakMinutes * 60);
      setTotalTime(breakMinutes * 60);
      elapsedRef.current = 0;

      try {
        const session = await createPomodoroSession(
          user.id,
          "break",
          breakMinutes,
          currentSubjectRef.current,
          activeConversationIdRef.current,
          currentPageRef.current
        );
        sessionIdRef.current = session.id;
      } catch (e) {
        console.error("Failed to create break session:", e);
      }
    } else {
      setMode("work");
      setTimeLeft(currentSettings.workMinutes * 60);
      setTotalTime(currentSettings.workMinutes * 60);
      elapsedRef.current = 0;
      setIsRunning(false);
      setIsPaused(false);
      clearTimerState();
    }
  }, [user]);

  // Timer interval
  useEffect(() => {
    if (!isRunning || isPaused) return;
    const interval = setInterval(() => {
      elapsedRef.current += 1;
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, isPaused, handleTimerComplete]);

  const start = useCallback(async () => {
    if (!user) return;
    const minutes =
      mode === "work"
        ? settings.workMinutes
        : settings.shortBreakMinutes;
    setTimeLeft(minutes * 60);
    setTotalTime(minutes * 60);
    elapsedRef.current = 0;
    setIsRunning(true);
    setIsPaused(false);

    try {
      const session = await createPomodoroSession(
        user.id,
        mode,
        minutes,
        currentSubject,
        activeConversationId,
        currentPage
      );
      sessionIdRef.current = session.id;
    } catch (e) {
      console.error("Failed to create pomodoro session:", e);
    }
  }, [user, mode, settings, currentSubject, activeConversationId, currentPage]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(async () => {
    // Save refs before resetting
    const prevSessionId = sessionIdRef.current;
    const elapsed = elapsedRef.current;

    // Reset state IMMEDIATELY (before any await)
    sessionIdRef.current = null;
    elapsedRef.current = 0;
    setIsRunning(false);
    setIsPaused(false);
    setMode("work");
    setTimeLeft(settings.workMinutes * 60);
    setTotalTime(settings.workMinutes * 60);
    clearTimerState();

    // Cancel DB session in background
    if (prevSessionId) {
      cancelPomodoroSession(prevSessionId, elapsed).catch(console.error);
    }
  }, [settings]);

  const skip = useCallback(async () => {
    if (mode === "break") {
      const prevSessionId = sessionIdRef.current;
      const elapsed = elapsedRef.current;

      // Reset state IMMEDIATELY
      sessionIdRef.current = null;
      elapsedRef.current = 0;
      setMode("work");
      setTimeLeft(settings.workMinutes * 60);
      setTotalTime(settings.workMinutes * 60);
      setIsRunning(false);
      setIsPaused(false);
      clearTimerState();

      // Complete DB session in background
      if (prevSessionId) {
        completePomodoroSession(prevSessionId, elapsed).catch(console.error);
      }
    }
  }, [mode, settings]);

  const updateSettings = useCallback(
    (newSettings: Partial<PomodoroSettings>) => {
      setSettings((prev) => {
        const updated = { ...prev, ...newSettings };
        if (!isRunning) {
          if (mode === "work") {
            setTimeLeft(updated.workMinutes * 60);
            setTotalTime(updated.workMinutes * 60);
          }
        }
        return updated;
      });
    },
    [isRunning, mode]
  );

  return (
    <PomodoroContext.Provider
      value={{
        isRunning,
        isPaused,
        mode,
        timeLeft,
        totalTime,
        settings,
        completedPomodoros,
        currentSubject,
        currentPage,
        start,
        pause,
        resume,
        reset,
        skip,
        updateSettings,
        setCurrentPage,
        setCurrentSubject,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

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

  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState<"work" | "break">("work");
  const [settings, setSettings] = useState<PomodoroSettings>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("odaklio-pomodoro-settings");
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
  const [timeLeft, setTimeLeft] = useState(settings.workMinutes * 60);
  const [totalTime, setTotalTime] = useState(settings.workMinutes * 60);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentSubject, setCurrentSubject] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState("focus");
  const [pomodoroCount, setPomodoroCount] = useState(0);

  const sessionIdRef = useRef<string | null>(null);
  const elapsedRef = useRef(0);
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

  // Load today's completed count on mount
  useEffect(() => {
    if (user) {
      getTodayPomodoros(user.id)
        .then(setCompletedPomodoros)
        .catch(console.error);
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist settings
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "odaklio-pomodoro-settings",
        JSON.stringify(settings)
      );
    }
  }, [settings]);

  const handleTimerComplete = useCallback(async () => {
    if (!user) return;

    const currentMode = modeRef.current;
    const currentSettings = settingsRef.current;
    const currentCount = pomodoroCountRef.current;

    // Complete current session in DB
    if (sessionIdRef.current) {
      try {
        await completePomodoroSession(sessionIdRef.current, elapsedRef.current);
      } catch (e) {
        console.error("Failed to complete pomodoro session:", e);
      }
      sessionIdRef.current = null;
    }

    if (currentMode === "work") {
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
    if (sessionIdRef.current) {
      try {
        await cancelPomodoroSession(sessionIdRef.current, elapsedRef.current);
      } catch (e) {
        console.error("Failed to cancel pomodoro session:", e);
      }
      sessionIdRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    setMode("work");
    setTimeLeft(settings.workMinutes * 60);
    setTotalTime(settings.workMinutes * 60);
    elapsedRef.current = 0;
  }, [settings]);

  const skip = useCallback(async () => {
    if (mode === "break") {
      if (sessionIdRef.current) {
        try {
          await completePomodoroSession(
            sessionIdRef.current,
            elapsedRef.current
          );
        } catch (e) {
          console.error("Failed to complete break session:", e);
        }
        sessionIdRef.current = null;
      }
      setMode("work");
      setTimeLeft(settings.workMinutes * 60);
      setTotalTime(settings.workMinutes * 60);
      elapsedRef.current = 0;
      setIsRunning(false);
      setIsPaused(false);
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

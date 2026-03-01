import { create } from "zustand";

type TimerStatus = "idle" | "running" | "paused" | "break";

interface TimerState {
  status: TimerStatus;
  minutesRemaining: number;
  secondsRemaining: number;
  totalSessions: number;
  completedSessions: number;
  workMinutes: number;
  breakMinutes: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  setWorkMinutes: (minutes: number) => void;
  setBreakMinutes: (minutes: number) => void;
}

export const useTimerStore = create<TimerState>((set) => ({
  status: "idle",
  minutesRemaining: 25,
  secondsRemaining: 0,
  totalSessions: 4,
  completedSessions: 0,
  workMinutes: 25,
  breakMinutes: 5,
  start: () => set({ status: "running" }),
  pause: () => set({ status: "paused" }),
  reset: () =>
    set((state) => ({
      status: "idle",
      minutesRemaining: state.workMinutes,
      secondsRemaining: 0,
    })),
  setWorkMinutes: (minutes) => set({ workMinutes: minutes }),
  setBreakMinutes: (minutes) => set({ breakMinutes: minutes }),
}));

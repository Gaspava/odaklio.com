import { create } from "zustand";
import type { FocusModeType } from "@/types/focus";

interface FocusState {
  activeMode: FocusModeType | null;
  setActiveMode: (mode: FocusModeType | null) => void;
}

export const useFocusStore = create<FocusState>((set) => ({
  activeMode: null,
  setActiveMode: (mode) => set({ activeMode: mode }),
}));

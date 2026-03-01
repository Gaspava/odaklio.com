import { create } from "zustand";

interface AudioState {
  isPlaying: boolean;
  currentSounds: Array<{ soundId: string; volume: number }>;
  masterVolume: number;
  toggle: () => void;
  addSound: (soundId: string) => void;
  removeSound: (soundId: string) => void;
  setVolume: (soundId: string, volume: number) => void;
  setMasterVolume: (volume: number) => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isPlaying: false,
  currentSounds: [],
  masterVolume: 0.5,
  toggle: () => set((state) => ({ isPlaying: !state.isPlaying })),
  addSound: (soundId) =>
    set((state) => ({
      currentSounds: [...state.currentSounds, { soundId, volume: 0.5 }],
    })),
  removeSound: (soundId) =>
    set((state) => ({
      currentSounds: state.currentSounds.filter((s) => s.soundId !== soundId),
    })),
  setVolume: (soundId, volume) =>
    set((state) => ({
      currentSounds: state.currentSounds.map((s) =>
        s.soundId === soundId ? { ...s, volume } : s
      ),
    })),
  setMasterVolume: (volume) => set({ masterVolume: volume }),
}));

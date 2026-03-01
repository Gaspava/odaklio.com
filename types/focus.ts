export type FocusModeType =
  | "derin-odak"
  | "okuma"
  | "yazma"
  | "pratik"
  | "ozel";

export interface FocusMode {
  id: string;
  type: FocusModeType;
  label: { tr: string; en: string };
  description: { tr: string; en: string };
  icon: string;
  settings: FocusModeSettings;
}

export interface FocusModeSettings {
  hideNavigation: boolean;
  enablePomodoro: boolean;
  enableAmbience: boolean;
  ambiencePreset?: string;
  pomodoroMinutes: number;
  breakMinutes: number;
}

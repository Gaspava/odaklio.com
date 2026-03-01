export interface AmbienceSound {
  id: string;
  label: { tr: string; en: string };
  category: "doga" | "sehir" | "muzik" | "beyaz-gurultu";
  iconName: string;
  audioSrc: string;
  defaultVolume: number;
}

export interface AmbienceMix {
  id: string;
  label: string;
  sounds: Array<{
    soundId: string;
    volume: number;
  }>;
}

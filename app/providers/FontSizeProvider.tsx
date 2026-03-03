"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

type FontSize = "small" | "normal" | "large";

interface FontSizeContextValue {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const FontSizeContext = createContext<FontSizeContextValue>({
  fontSize: "normal",
  setFontSize: () => {},
});

export function useFontSize() {
  return useContext(FontSizeContext);
}

const fontScales: Record<FontSize, string> = {
  small: "13px",
  normal: "15px",
  large: "17px",
};

export default function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<FontSize>("normal");

  useEffect(() => {
    const saved = localStorage.getItem("odaklio-font-size") as FontSize | null;
    if (saved && fontScales[saved]) {
      setFontSizeState(saved);
      document.documentElement.style.fontSize = fontScales[saved];
    }
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    document.documentElement.style.fontSize = fontScales[size];
    localStorage.setItem("odaklio-font-size", size);
  }, []);

  return (
    <FontSizeContext.Provider value={{ fontSize, setFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}

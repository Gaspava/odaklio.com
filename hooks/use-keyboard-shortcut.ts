"use client";

import { useEffect } from "react";

interface ShortcutOptions {
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
}

export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: ShortcutOptions = {}
) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === key.toLowerCase() &&
        !!e.ctrlKey === !!options.ctrlKey &&
        !!e.shiftKey === !!options.shiftKey &&
        !!e.altKey === !!options.altKey
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [key, callback, options.ctrlKey, options.shiftKey, options.altKey]);
}

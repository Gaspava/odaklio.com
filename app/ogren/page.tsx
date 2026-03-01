"use client";

import { useState, useEffect } from "react";
import MainChat from "../components/chatbot/MainChat";

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= breakpoint);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [breakpoint]);

  return isMobile;
}

export default function OgrenPage() {
  const isMobile = useIsMobile();

  return (
    <div className="h-full overflow-hidden">
      <MainChat isMobile={isMobile} />
    </div>
  );
}

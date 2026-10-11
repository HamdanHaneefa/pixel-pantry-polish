import { useEffect, useState, useRef } from "react";
import { useRouterState } from "@tanstack/react-router";

/**
 * TopNavigationProgress
 * 
 * High-performance, non-intrusive top-of-viewport progress bar (similar to YouTube, GitHub, Linear).
 * Automatically detects TanStack Router pending state (isLoading) and provides immediate,
 * 0ms feedback that navigation has started, without blocking the user interface with a heavy loader.
 */
export default function TopNavigationProgress() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isLoading) {
      setVisible(true);
      setProgress(20);

      // Smoothly advance progress while waiting for route transition
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          if (prev >= 70) return prev + 1.5;
          if (prev >= 40) return prev + 4;
          return prev + 12;
        });
      }, 100);
    } else if (visible) {
      // Complete to 100% when finished
      setProgress(100);
      timeoutRef.current = setTimeout(() => {
        setVisible(false);
        timeoutRef.current = setTimeout(() => {
          setProgress(0);
        }, 200);
      }, 250);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isLoading, visible]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[99999] pointer-events-none h-[2.5px] bg-transparent"
      style={{
        opacity: visible ? 1 : 0,
        transition: "opacity 200ms ease-out",
      }}
    >
      <div
        className="h-full relative"
        style={{
          width: `${progress}%`,
          background: "linear-gradient(90deg, #FF5B00 0%, #FF8A3D 50%, #FFB020 100%)",
          boxShadow: "0 0 10px rgba(255, 91, 0, 0.8), 0 0 5px rgba(255, 138, 61, 0.5)",
          transition: progress === 100 ? "width 150ms ease-out" : "width 200ms cubic-bezier(0.1, 0.8, 0.3, 1)",
        }}
      >
        {/* Glow bead at the front edge */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full blur-[2px] opacity-80" />
      </div>
    </div>
  );
}

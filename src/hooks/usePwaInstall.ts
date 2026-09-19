import { useState, useEffect, useCallback } from "react";

// Global cache for beforeinstallprompt event so any component can trigger it
let globalDeferredPrompt: any = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    globalDeferredPrompt = null;
    notifyListeners();
  });
}

export function usePwaInstall() {
  const [hasPrompt, setHasPrompt] = useState(Boolean(globalDeferredPrompt));
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    const updatePromptState = () => {
      setHasPrompt(Boolean(globalDeferredPrompt));
    };

    listeners.add(updatePromptState);
    updatePromptState();

    return () => {
      listeners.delete(updatePromptState);
    };
  }, []);

  const promptInstall = useCallback(async (): Promise<"accepted" | "dismissed" | "unavailable"> => {
    if (!globalDeferredPrompt) {
      return "unavailable";
    }

    try {
      globalDeferredPrompt.prompt();
      const choiceResult = await globalDeferredPrompt.userChoice;
      if (choiceResult?.outcome === "accepted") {
        globalDeferredPrompt = null;
        setHasPrompt(false);
        notifyListeners();
        return "accepted";
      }
      return "dismissed";
    } catch (err) {
      console.warn("[PWA] Installation prompt error:", err);
      return "unavailable";
    }
  }, []);

  return {
    isInstallable: hasPrompt || isIOS,
    hasPrompt,
    isStandalone,
    isIOS,
    promptInstall,
  };
}

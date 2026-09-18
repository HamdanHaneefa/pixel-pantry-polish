import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already dismissed recently
    const dismissedUntil = localStorage.getItem("petpedia_pwa_dismissed_until");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      return;
    }

    // Check if running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Check for iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      // Show iOS prompt after 4 seconds
      const timer = setTimeout(() => setShowPrompt(true), 4000);
      return () => clearTimeout(timer);
    }

    // Standard Android/Chrome beforeinstallprompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // Dismiss for 7 days
    localStorage.setItem(
      "petpedia_pwa_dismissed_until",
      (Date.now() + 7 * 24 * 60 * 60 * 1000).toString()
    );
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="rounded-2xl border border-orange-200/80 bg-white/95 p-4 shadow-xl backdrop-blur-md">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF5B00] to-amber-500 text-white font-black text-lg shadow-md shadow-orange-500/20">
              P
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Install Petpedia App
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Fast shopping, instant stock & 1-tap orders
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showIOSInstructions ? (
          <div className="mt-3 rounded-xl bg-orange-50/80 p-3 text-xs text-slate-700 space-y-1.5 border border-orange-200/50">
            <p className="font-semibold text-orange-950 flex items-center gap-1.5">
              <span>To install on iPhone / iPad:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
              <li className="flex items-center gap-1.5">
                <span>1. Tap Share</span> <Share className="h-3.5 w-3.5 text-blue-500 inline" />
              </li>
              <li className="flex items-center gap-1.5">
                <span>2. Select</span> <PlusSquare className="h-3.5 w-3.5 text-slate-700 inline" /> <span className="font-semibold">Add to Home Screen</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#FF5B00] px-4 py-2 text-xs font-bold text-white shadow-md shadow-orange-500/25 hover:bg-[#e05000] active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              {isIOS ? "How to Install" : "Install Free App"}
            </button>
            <button
              onClick={handleDismiss}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

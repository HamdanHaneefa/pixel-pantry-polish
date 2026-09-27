import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, ShieldCheck, Sparkles } from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export default function PwaInstallPrompt() {
  const routerState = useRouterState();
  const pathname = routerState.location.pathname;
  const isAdmin = pathname.startsWith("/admin");

  const { isInstallable, hasPrompt, isStandalone, isIOS, promptInstall } = usePwaInstall();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const storageKey = "petpedia_admin_pwa_dismissed_until";

  useEffect(() => {
    // STRICT REQUIREMENT: Never show any PWA install banner, popup or prompt on the client storefront.
    // PWA installation prompt is exclusively reserved for the Admin side.
    if (!isAdmin) {
      return;
    }

    // If already running standalone (installed), never prompt
    if (isStandalone) {
      setShowPrompt(false);
      return;
    }

    // Check recent dismissal for this context
    const dismissedUntil = localStorage.getItem(storageKey);
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setShowPrompt(false);
      return;
    }

    if (isInstallable) {
      const delay = isIOS ? 3500 : 2000;
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowPrompt(false);
    }
  }, [isInstallable, isStandalone, isIOS, isAdmin, storageKey]);

  if (!isAdmin) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }

    const outcome = await promptInstall();
    if (outcome === "accepted") {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // Dismiss for 5 days
    localStorage.setItem(
      storageKey,
      (Date.now() + 5 * 24 * 60 * 60 * 1000).toString()
    );
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px] z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div
        className={`rounded-2xl border p-4 shadow-2xl backdrop-blur-xl ${
          isAdmin
            ? "border-slate-700 bg-slate-900/95 text-white shadow-orange-500/10"
            : "border-orange-200/80 bg-white/95 text-slate-900 shadow-xl"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-lg shadow-md ${
                isAdmin
                  ? "bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-orange-500/20 ring-2 ring-orange-500/30"
                  : "bg-gradient-to-br from-[#FF5B00] to-amber-500 text-white shadow-orange-500/20"
              }`}
            >
              P
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4
                  className={`text-sm font-bold leading-tight ${
                    isAdmin ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isAdmin ? "Install Petpedia Admin" : "Install Petpedia App"}
                </h4>
                {isAdmin && (
                  <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-500/20 px-1.5 py-0.5 text-[9px] font-bold text-orange-400">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Portal
                  </span>
                )}
              </div>
              <p
                className={`text-xs mt-0.5 leading-snug ${
                  isAdmin ? "text-slate-400" : "text-slate-500"
                }`}
              >
                {isAdmin
                  ? "Instant order alerts, live stock editor & merchant tools"
                  : "Fast shopping, instant stock & 1-tap orders"}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className={`rounded-full p-1 transition-colors cursor-pointer ${
              isAdmin
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            }`}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {showIOSInstructions ? (
          <div
            className={`mt-3 rounded-xl p-3 text-xs space-y-1.5 border ${
              isAdmin
                ? "bg-slate-800/90 border-slate-700 text-slate-300"
                : "bg-orange-50/80 border-orange-200/50 text-slate-700"
            }`}
          >
            <p
              className={`font-semibold flex items-center gap-1.5 ${
                isAdmin ? "text-orange-400" : "text-orange-950"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>To install {isAdmin ? "Admin Portal" : "App"} on iPhone / iPad:</span>
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1">
              <li className="flex items-center gap-1.5">
                <span>1. Tap Safari Share</span>{" "}
                <Share className="h-3.5 w-3.5 text-blue-400 inline" />
              </li>
              <li className="flex items-center gap-1.5">
                <span>2. Select</span>{" "}
                <PlusSquare className="h-3.5 w-3.5 text-slate-300 inline" />{" "}
                <span className="font-semibold text-white">Add to Home Screen</span>
              </li>
            </ol>
          </div>
        ) : (
          <div className="mt-3.5 flex items-center gap-2">
            <button
              onClick={handleInstallClick}
              className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold text-white shadow-md active:scale-[0.98] transition-all cursor-pointer ${
                isAdmin
                  ? "bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/20 hover:brightness-105"
                  : "bg-[#FF5B00] shadow-orange-500/25 hover:bg-[#e05000]"
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              {isIOS ? "How to Install" : isAdmin ? "Install Merchant App" : "Install Free App"}
            </button>
            <button
              onClick={handleDismiss}
              className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors cursor-pointer ${
                isAdmin
                  ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              Not now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

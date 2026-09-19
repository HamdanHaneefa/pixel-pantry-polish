import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { loginAdminFn } from "@/lib/admin/auth";
import { Lock, ArrowRight, Loader2, ShieldCheck, Download } from "lucide-react";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Petpedia Admin Login" },
      { name: "apple-mobile-web-app-title", content: "Petpedia Admin" },
      { name: "theme-color", content: "#0f172a" },
    ],
    links: [
      { rel: "manifest", href: "/manifest-admin.json" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const router = useRouter();
  const [passcode, setPasscode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isStandalone, isIOS, promptInstall } = usePwaInstall();

  const handleInstallClick = async () => {
    if (isStandalone) {
      toast.info("Petpedia Admin is already installed!");
      return;
    }

    if (isIOS) {
      toast("To install on iOS:", {
        description: "Tap Safari Share button at bottom -> select 'Add to Home Screen'.",
      });
      return;
    }

    const outcome = await promptInstall();
    if (outcome === "accepted") {
      toast.success("Petpedia Admin installed successfully!");
    } else {
      toast("Install via browser menu", {
        description: "Tap browser menu (⋮ or ⋯) and select 'Install app' or 'Add to Home screen'.",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await loginAdminFn({ data: { passcode } });
      if (res.success) {
        router.navigate({ to: "/admin" });
      } else {
        setError(res.error || "Incorrect passcode.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white font-black text-2xl shadow-xl shadow-orange-500/30">
            P
          </div>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white">
            Petpedia Merchant Portal
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Enter your admin passcode to access store management
          </p>
        </div>

        <div className="rounded-2xl border border-slate-700/60 bg-slate-800/80 p-6 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="passcode"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5"
              >
                Admin Passcode
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="passcode"
                  type="password"
                  autoFocus
                  required
                  placeholder="Enter passcode"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-900/60 pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-medium text-red-400 animate-in fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !passcode.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Enter Dashboard
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {!isStandalone && (
            <div className="mt-4 pt-4 border-t border-slate-700/60">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-orange-400" />
                Install Admin Web App (PWA)
              </button>
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-700/60 pt-3">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            Protected by Server-Side Admin Authentication
          </div>
        </div>
      </div>
    </div>
  );
}

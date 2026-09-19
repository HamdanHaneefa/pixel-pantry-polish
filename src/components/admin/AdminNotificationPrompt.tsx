import { useState, useEffect } from "react";
import { Bell, BellRing, CheckCircle2, ShieldCheck, Sparkles, X, Volume2, Loader2 } from "lucide-react";
import {
  getVapidPublicKeyFn,
  savePushSubscriptionFn,
  sendTestPushNotificationFn,
} from "@/lib/admin/push-notifications";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminNotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaired, setIsPaired] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const supported = "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      if (Notification.permission === "granted") {
        // Check if existing push subscription is active
        navigator.serviceWorker.ready.then(async (reg) => {
          const sub = await reg.pushManager.getSubscription();
          if (sub) {
            setIsPaired(true);
          }
        });
      }
    }

    const dismissedUntil = localStorage.getItem("petpedia_admin_notif_prompt_dismissed");
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 24 hours
    localStorage.setItem(
      "petpedia_admin_notif_prompt_dismissed",
      (Date.now() + 24 * 60 * 60 * 1000).toString()
    );
  };

  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
        gain.gain.setValueAtTime(0, audioCtx.currentTime + start);
        gain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + start + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
        osc.start(audioCtx.currentTime + start);
        osc.stop(audioCtx.currentTime + start + duration);
      };
      playTone(587.33, 0, 0.2); // D5
      playTone(880, 0.15, 0.35); // A5
    } catch {
      // Ignored
    }
  };

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error("Push Notifications are not supported in this browser window. Make sure you opened the installed PWA on your home screen!");
      return;
    }

    setIsSubscribing(true);

    try {
      // 1. Request native browser notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        toast.error("Notification permission was denied. Please allow notifications in device settings.");
        setIsSubscribing(false);
        return;
      }

      playChime();

      // 2. Wait for service worker registration
      const reg = await navigator.serviceWorker.ready;

      // 3. Get VAPID Public Key from server
      const { publicKey } = await getVapidPublicKeyFn();

      // 4. Subscribe to Push Manager
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
      }

      // 5. Send subscription to server
      const subJson = sub.toJSON();
      if (subJson.endpoint && subJson.keys) {
        await savePushSubscriptionFn({
          data: {
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys.p256dh || "",
              auth: subJson.keys.auth || "",
            },
            userAgent: navigator.userAgent,
          },
        });
      }

      setIsPaired(true);
      toast.success("Push Notifications successfully enabled!");

      // 6. Send test push alert directly from server to verify sound & banner
      setTimeout(async () => {
        try {
          await sendTestPushNotificationFn();
        } catch {
          // Fallback to local SW notification if offline
          reg.showNotification("🎉 Petpedia Alert: Push Connected!", {
            body: "Your phone is successfully paired to receive instant alerts when orders arrive.",
            icon: "/icon-192.png",
            badge: "/favicon-32x32.png",
            tag: "petpedia-admin-order",
          });
        }
      }, 600);
    } catch (err: any) {
      console.error("[NotificationPrompt] Error enabling notifications:", err);
      toast.error(err.message || "Failed to enable notifications");
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTestPush = async () => {
    setIsSubscribing(true);
    playChime();
    try {
      const res = await sendTestPushNotificationFn();
      if (res.success) {
        toast.success("Test alert sent to your phone!");
      } else {
        toast.error(res.error || "Failed to send test alert");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to trigger test push");
    } finally {
      setIsSubscribing(false);
    }
  };

  // If already granted and paired, don't show the full prompt banner, but keep a tiny status bar
  if (permission === "granted" && isPaired) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-2.5 text-xs text-emerald-900 shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-bold">Order Push Alerts Active:</span>{" "}
            <span className="text-emerald-700">This device receives native sound alerts on new orders even when closed.</span>
          </div>
        </div>
        <button
          onClick={handleSendTestPush}
          disabled={isSubscribing}
          className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50"
        >
          {isSubscribing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Volume2 className="h-3 w-3" />}
          Test Sound Alert
        </button>
      </div>
    );
  }

  // If dismissed or unsupported, hide banner
  if (isDismissed || !isSupported) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-orange-400/80 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 p-4 text-white shadow-xl shadow-orange-500/20 animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md text-white shadow-inner">
            <BellRing className="h-6 w-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight">
                Turn On Instant Order Notifications
              </h3>
              <span className="inline-flex items-center gap-0.5 rounded-full bg-black/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
                <Sparkles className="h-2.5 w-2.5" />
                Phone Alerts
              </span>
            </div>
            <p className="mt-1 text-xs sm:text-sm text-orange-50/90 leading-snug max-w-xl">
              Never miss a customer sale! Receive instant sound and vibration alerts on your phone whenever orders arrive, even when Petpedia is closed or your phone is locked.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            onClick={handleEnableNotifications}
            disabled={isSubscribing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-orange-600 shadow-md hover:bg-orange-50 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                Pairing Device...
              </>
            ) : (
              <>
                <Bell className="h-4 w-4 text-orange-600" />
                Enable Order Alerts
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="rounded-full p-2 text-white/80 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
            title="Dismiss for today"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import SiteHeader, { Logo } from "@/components/home/SiteHeader";
import SiteFooter from "@/components/home/SiteFooter";
import TrustBar from "@/components/home/TrustBar";
import MobileTabBar from "@/components/home/MobileTabBar";
import { useCustomer } from "@/context/CustomerContext";
import {
  Smartphone,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ChevronDown,
  Edit2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { exchangeGoogleAuthCodeFn, getGoogleClientIdFn } from "@/lib/customer/auth";

export const Route = createFileRoute("/account/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
      code: typeof search["code"] === "string" ? (search["code"] as string) : undefined,
      state: typeof search["state"] === "string" ? (search["state"] as string) : undefined,
      error: typeof search["error"] === "string" ? (search["error"] as string) : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Login with OTP — Petpedia" },
      { name: "description", content: "Fast and secure OTP login for Petpedia customers." },
    ],
  }),
  component: CustomerLoginPage,
});

function CustomerLoginPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/account/login" });
  const { customer, isAuthenticated, requestOtp, verifyOtp, googleLogin, refreshSession } = useCustomer();

  // Step: "phone" | "otp" | "success"
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [phone, setPhone] = useState("");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [sessionToken, setSessionToken] = useState<string | undefined>(undefined);
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testHint, setTestHint] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already logged in, redirect right away
  useEffect(() => {
    if (isAuthenticated && customer) {
      navigate({ to: (search.redirect as any) || "/account" });
    }
  }, [isAuthenticated, customer, navigate, search.redirect]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    } else if (step === "otp" && countdown === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);

  // Handle Google OAuth callback on same page
  useEffect(() => {
    if (search.code) {
      let isMounted = true;
      setIsProcessingGoogle(true);
      setLoading(true);
      setError(null);

      const processGoogleCallback = async () => {
        try {
          let redirectUri = window.location.origin;
          if (search.state) {
            try {
              const parsed = JSON.parse(search.state);
              if (parsed.ru) redirectUri = parsed.ru;
            } catch {}
          }

          const res = await exchangeGoogleAuthCodeFn({
            data: {
              code: search.code!,
              redirectUri,
            },
          });

          if (!isMounted) return;

          if (res.success && res.customer) {
            setStep("success");
            toast.success("Signed in with Google!");
            await refreshSession();

            let targetUrl = "/account";
            if (search.state) {
              try {
                const parsed = JSON.parse(search.state);
                if (parsed.redirect) targetUrl = parsed.redirect;
              } catch {}
            } else if (search.redirect) {
              targetUrl = search.redirect;
            }

            setTimeout(() => {
              navigate({ to: targetUrl as any });
            }, 800);
          } else {
            setError(res.error || "Google sign-in failed. Please try again.");
            toast.error(res.error || "Google sign-in failed.");
          }
        } catch (err: any) {
          if (!isMounted) return;
          setError(err?.message || "Failed to complete Google login.");
          toast.error(err?.message || "Failed to complete Google login.");
        } finally {
          if (isMounted) {
            setIsProcessingGoogle(false);
            setLoading(false);
          }
        }
      };

      processGoogleCallback();
      return () => {
        isMounted = false;
      };
    } else if (search.error) {
      setError("Google sign-in was cancelled or encountered an error.");
    }
  }, [search.code, search.error, search.state, search.redirect, refreshSession, navigate]);

  const handleGoogleLogin = async () => {
    let clientId =
      (import.meta.env as Record<string, string>)["GOOGLE_CLIENT_ID"] ||
      (import.meta.env as Record<string, string>)["VITE_GOOGLE_CLIENT_ID"] ||
      (typeof process !== "undefined" && (process.env?.GOOGLE_CLIENT_ID || process.env?.VITE_GOOGLE_CLIENT_ID)) ||
      "";

    if (!clientId.trim()) {
      try {
        const fetched = await getGoogleClientIdFn();
        if (fetched && typeof fetched === "string") {
          clientId = fetched;
        }
      } catch {
        // Fallback continues
      }
    }

    if (!clientId.trim()) {
      const msg = "Google Client ID is not configured. Please add GOOGLE_CLIENT_ID to your environment variables (e.g. in your Render dashboard).";
      setError(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    // Use window.location.origin (e.g. http://localhost:8080 or https://www.petpedia.in)
    // which exactly matches the Authorized redirect URIs configured in Google Cloud Console
    const redirectUri = window.location.origin;
    const state = JSON.stringify({
      redirect: (search.redirect as string) || "/account",
      ru: redirectUri,
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      clientId.trim()
    )}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=openid%20profile%20email&prompt=select_account&state=${encodeURIComponent(
      state
    )}`;

    window.location.href = googleAuthUrl;
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = phone.replace(/\D/g, "");
    if (clean.length !== 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await requestOtp(clean);
      if (res.success) {
        setSessionToken(res.token);
        if (res.testOtpHint) {
          setTestHint(res.testOtpHint);
        }
        setStep("otp");
        setCountdown(30);
        setCanResend(false);
        toast.success(res.message || "OTP sent successfully to your mobile!");
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        setError(res.error || "Failed to send OTP. Please check your number.");
        toast.error(res.error || "Failed to send OTP.");
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const newArr = [...otpValues];
    newArr[index] = digit;
    setOtpValues(newArr);

    // Auto-focus next input
    if (digit && index < 3) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    const completeOtp = newArr.join("");
    if (completeOtp.length === 4) {
      triggerVerify(completeOtp);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;

    const newArr = ["", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newArr[i] = pasted[i] || "";
    }
    setOtpValues(newArr);

    if (pasted.length === 4) {
      triggerVerify(pasted);
    } else {
      otpInputRefs.current[pasted.length]?.focus();
    }
  };

  const triggerVerify = async (enteredOtp?: string) => {
    const code = enteredOtp || otpValues.join("");
    if (code.length < 4) {
      setError("Please enter the complete 4-digit OTP.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await verifyOtp(phone, code, sessionToken);
      if (res.success) {
        setStep("success");
        toast.success("Verification successful!");
        setTimeout(() => {
          navigate({ to: (search.redirect as any) || "/account" });
        }, 1200);
      } else {
        setError(res.error || "Invalid OTP. Please try again.");
        toast.error(res.error || "Invalid OTP.");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to verify OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError(null);
    setOtpValues(["", "", "", ""]);

    try {
      const res = await requestOtp(phone);
      if (res.success) {
        setSessionToken(res.token);
        if (res.testOtpHint) {
          setTestHint(res.testOtpHint);
        }
        setCountdown(30);
        setCanResend(false);
        toast.success("A fresh OTP has been sent!");
        otpInputRefs.current[0]?.focus();
      } else {
        setError(res.error || "Could not resend OTP right now.");
      }
    } catch (err: any) {
      setError(err?.message || "Resend failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF9F3] flex flex-col justify-between">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <div className="w-full max-w-[460px] bg-white rounded-2xl md:rounded-3xl border border-slate-200/80 shadow-xl shadow-slate-900/5 p-6 md:p-10 transition-all">
          {/* Brand Logo Header */}
          <div className="flex justify-center mb-6">
            <Logo className="h-8 md:h-9" />
          </div>

          {/* Processing Google OAuth Callback State */}
          {isProcessingGoogle && (
            <div className="py-12 flex flex-col items-center justify-center gap-4 text-center animate-in fade-in duration-200">
              <Loader2 className="w-10 h-10 animate-spin text-[#FF5B00]" />
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-slate-800">Signing in with Google...</h2>
                <p className="text-xs text-slate-500">Connecting your account, please wait</p>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 1: Phone Number Input (Zigly Screen 1)        */}
          {/* ================================================= */}
          {!isProcessingGoogle && step === "phone" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Login with OTP
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your mobile number to view orders & manage account
                </p>
              </div>

              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="phone-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Phone
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#FF5B00] focus-within:ring-2 focus-within:ring-[#FF5B00]/10 bg-slate-50/50 transition-all overflow-hidden">
                    {/* Country Code Selector */}
                    <div className="flex items-center gap-1.5 px-3 py-3 border-r border-slate-200 bg-white text-slate-700 text-sm font-medium shrink-0">
                      <span className="text-base" role="img" aria-label="India Flag">
                        🇮🇳
                      </span>
                      <span className="text-xs font-semibold text-slate-700">+91</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </div>

                    {/* Phone Input */}
                    <input
                      id="phone-input"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel"
                      maxLength={10}
                      value={phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                        setPhone(val);
                        if (error) setError(null);
                      }}
                      placeholder="Phone number"
                      className="w-full px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium tracking-wide"
                      autoFocus
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || phone.replace(/\D/g, "").length !== 10}
                  className="w-full h-12 rounded-xl bg-[#FF5B00] hover:bg-[#E05000] active:scale-[0.99] text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending OTP...</span>
                    </>
                  ) : (
                    <span>Request OTP</span>
                  )}
                </button>
              </form>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="shrink-0 px-4 text-xs font-medium text-slate-400">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading || isProcessingGoogle}
                className="w-full h-12 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-700 text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessingGoogle ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Signing in with Google...</span>
                  </>
                ) : (
                  <>
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Consent & Security Badges */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Verified 100% Secure via Shiprocket Fastrr</span>
                </div>

                <p className="text-[11px] leading-relaxed text-center text-slate-400">
                  I accept that I have read & understood the{" "}
                  <a href="/privacy-policy" className="text-slate-600 underline hover:text-slate-900">
                    Privacy Policy
                  </a>{" "}
                  and{" "}
                  <a href="/terms" className="text-slate-600 underline hover:text-slate-900">
                    T&Cs
                  </a>
                  . An SMS containing your OTP will be delivered directly from Petpedia.
                </p>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 2: OTP Verification Box                      */}
          {/* ================================================= */}
          {step === "otp" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Verify OTP
                </h1>
                <div className="flex items-center justify-center gap-1.5 text-sm text-slate-500">
                  <span>Code sent to +91 {phone}</span>
                  <button
                    onClick={() => {
                      setStep("phone");
                      setOtpValues(["", "", "", ""]);
                      setError(null);
                    }}
                    className="text-[#FF5B00] hover:underline font-semibold flex items-center gap-0.5 text-xs ml-1"
                  >
                    <Edit2 className="w-3 h-3" /> Change
                  </button>
                </div>
              </div>

              {testHint && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl p-3 text-center flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Test Mode: OTP is <strong>{testHint}</strong> (or <strong>1234</strong>)
                  </span>
                </div>
              )}

              {/* 4 Digit OTP Inputs */}
              <div className="space-y-4">
                <div className="flex justify-center gap-3" onPaste={handlePaste}>
                  {otpValues.map((val, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-14 h-14 md:w-16 md:h-16 text-center text-2xl font-bold text-slate-900 rounded-xl border border-slate-300 focus:border-[#FF5B00] focus:ring-2 focus:ring-[#FF5B00]/15 bg-white shadow-sm outline-none transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-xs font-medium text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5 text-center">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={() => triggerVerify()}
                  disabled={loading || otpValues.join("").length < 4}
                  className="w-full h-12 rounded-xl bg-[#FF5B00] hover:bg-[#E05000] active:scale-[0.99] text-white text-sm font-bold tracking-wide transition-all shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <span>Verify & Login</span>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                  <span>Didn't receive SMS?</span>
                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={loading}
                      className="text-[#FF5B00] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Resend OTP
                    </button>
                  ) : (
                    <span className="text-slate-400">
                      Resend in <strong className="text-slate-600 font-semibold">{countdown}s</strong>
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================================================= */}
          {/* STEP 3: Verification Success (Zigly Screen 2)     */}
          {/* ================================================= */}
          {step === "success" && (
            <div className="py-8 text-center space-y-5 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-2xl font-black text-slate-900">
                  🎉 Congratulations!
                </h2>
                <p className="text-base font-semibold text-slate-700">
                  Verification Successful
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 pt-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#FF5B00]" />
                <span>Logging you in...</span>
              </div>
            </div>
          )}
        </div>
      </main>

      <TrustBar />
      <SiteFooter />
      <MobileTabBar />
    </div>
  );
}

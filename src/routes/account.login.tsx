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
import { useGoogleAuth } from "@/lib/customer/useGoogleAuth";

export const Route = createFileRoute("/account/login")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      redirect: typeof search["redirect"] === "string" ? (search["redirect"] as string) : undefined,
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
  const { customer, isAuthenticated, requestOtp, verifyOtp, googleLogin } = useCustomer();

  // Step: "phone" | "otp" | "success"
  const [step, setStep] = useState<"phone" | "otp" | "success">("phone");
  const [identifier, setIdentifier] = useState("");
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

  const googleClientId = (import.meta.env as Record<string, string>)["VITE_GOOGLE_CLIENT_ID"] || "";

  const { loginWithGoogle, isLoading: isGoogleLoading } = useGoogleAuth({
    clientId: googleClientId,
    onSuccess: async (userInfo) => {
      setLoading(true);
      setError(null);
      try {
        const authRes = await googleLogin(userInfo.email, userInfo.firstName, userInfo.lastName);
        if (authRes.success) {
          setStep("success");
          toast.success("Signed in with Google!");
          setTimeout(() => {
            navigate({ to: (search.redirect as any) || "/account" });
          }, 1200);
        } else {
          setError(authRes.error || "Google login failed.");
          toast.error(authRes.error || "Google login failed.");
        }
      } catch (err: any) {
        setError(err?.message || "Google login failed.");
        toast.error(err?.message || "Google login failed.");
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      setError(err);
      toast.error(err);
      setLoading(false);
    },
  });

  const handleIdentifierSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = identifier.includes("@");
    let clean = identifier.trim();

    if (isEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
        setError("Please enter a valid email address.");
        return;
      }
    } else {
      clean = identifier.replace(/\D/g, "");
      if (clean.length !== 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
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
        toast.success(res.message || "OTP sent successfully from Petpedia!");
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
      const res = await verifyOtp(identifier, code, sessionToken);
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
      const res = await requestOtp(identifier);
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

          {/* ================================================= */}
          {/* STEP 1: Phone Number Input (Zigly Screen 1)        */}
          {/* ================================================= */}
          {step === "phone" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Login with OTP
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your email or mobile number to view orders & manage account
                </p>
              </div>

              <form onSubmit={handleIdentifierSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="identifier-input"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    Email or Phone
                  </label>
                  <div className="flex items-center rounded-xl border border-slate-300 focus-within:border-[#FF5B00] focus-within:ring-2 focus-within:ring-[#FF5B00]/10 bg-slate-50/50 transition-all overflow-hidden">
                    {/* Country Code Selector - only if typing numbers */}
                    {!identifier.includes("@") && (
                      <div className="flex items-center gap-1.5 px-3 py-3 border-r border-slate-200 bg-white text-slate-700 text-sm font-medium shrink-0">
                        <span className="text-base" role="img" aria-label="India Flag">
                          🇮🇳
                        </span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                    )}

                    {/* Identifier Input */}
                    <input
                      id="identifier-input"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (error) setError(null);
                      }}
                      placeholder="Email or phone number"
                      className="w-full px-3.5 py-3 text-base text-slate-900 placeholder:text-slate-400 bg-transparent outline-none font-medium"
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
                  disabled={loading || identifier.trim().length < 5}
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
                onClick={loginWithGoogle}
                disabled={loading || isGoogleLoading}
                className="w-full h-12 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 active:scale-[0.99] text-slate-700 text-sm font-bold tracking-wide transition-all shadow-sm flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-600" />
                    <span>Connecting to Google...</span>
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
                  <span>Code sent to {identifier.includes("@") ? identifier : `+91 ${identifier}`}</span>
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

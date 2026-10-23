/**
 * MSG91 SMS & OTP Integration Service
 *
 * Documentation: https://docs.msg91.com/p/tf9GTextN/t/send-otp-tTz42fN23
 * Control Panel: https://control.msg91.com
 */

export interface Msg91Config {
  authKey?: string;
  templateId?: string;
  otpLength?: number;
  otpExpiryMinutes?: number;
}

export function getMsg91Config(): Msg91Config {
  let envAuthKey = "";
  let envTemplateId = "";
  let envOtpLength = "4";
  let envOtpExpiry = "10";

  // 1. Try reading directly from .env file if in Node.js server environment
  try {
    if (typeof process !== "undefined" && typeof (process as any).cwd === "function") {
      const fs = (globalThis as any).process
        ? (globalThis as any).process.mainModule?.require("fs")
        : null;
      // or node fs
    }
  } catch {}

  const env =
    typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);
  const importMetaEnv =
    typeof import.meta !== "undefined" && (import.meta as any).env
      ? ((import.meta as any).env as Record<string, string | undefined>)
      : {};

  return {
    authKey: (env["MSG91_AUTH_KEY"] || importMetaEnv["MSG91_AUTH_KEY"] || "").trim(),
    templateId: (
      env["MSG91_OTP_TEMPLATE_ID"] ||
      importMetaEnv["MSG91_OTP_TEMPLATE_ID"] ||
      ""
    ).trim(),
    otpLength:
      parseInt(env["MSG91_OTP_LENGTH"] || importMetaEnv["MSG91_OTP_LENGTH"] || "4", 10) || 4,
    otpExpiryMinutes:
      parseInt(env["MSG91_OTP_EXPIRY"] || importMetaEnv["MSG91_OTP_EXPIRY"] || "10", 10) || 10,
  };
}

/**
 * Ensures phone number is formatted as 91XXXXXXXXXX (without leading + or spaces)
 */
export function formatIndianMobileForMsg91(rawPhone: string): string {
  const digits = rawPhone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `91${digits}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits;
  }
  if (digits.length > 10) {
    return `91${digits.slice(-10)}`;
  }
  return digits;
}

export function maskMobileForLogs(rawPhone: string): string {
  const digits = (rawPhone || "").replace(/\D/g, "");
  if (digits.length < 4) return "****";
  return `******${digits.slice(-4)}`;
}

// Resilient multi-host list: api.msg91.com (low-latency primary API edge) and control.msg91.com (fallback)
const MSG91_API_HOSTS = ["https://api.msg91.com/api/v5", "https://control.msg91.com/api/v5"];

/**
 * Robust dispatcher for MSG91 requests:
 * - Tries primary low-latency endpoint first (api.msg91.com)
 * - Automatically falls back to secondary endpoint (control.msg91.com) on timeout or network errors
 * - Sets a sensible timeout to avoid hanging Vite SSR or user requests
 */
async function executeMsg91Request(
  endpointPath: string,
  authKey: string,
  searchParams: Record<string, string>,
  method: "GET" | "POST" = "POST",
  timeoutMs = 6000,
): Promise<{ ok: boolean; status: number; data: any; error?: string }> {
  let lastError: any = null;

  for (const host of MSG91_API_HOSTS) {
    try {
      const url = new URL(`${host}${endpointPath}`);
      for (const [key, value] of Object.entries(searchParams)) {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, value);
        }
      }

      const response = await fetch(url.toString(), {
        method,
        headers: {
          authkey: authKey,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(timeoutMs),
      });

      const data = await response.json().catch(() => null);
      return { ok: response.ok, status: response.status, data };
    } catch (err: any) {
      lastError = err;
      console.warn(
        `[MSG91 Request Notice] Host ${host} failed (${err?.name || "NetworkError"}: ${err?.message}). Attempting fallback if available...`,
      );
    }
  }

  return {
    ok: false,
    status: 0,
    data: null,
    error: lastError?.message || "Network error while connecting to MSG91 OTP service.",
  };
}

/**
 * 1. Send OTP to customer via MSG91 SendOTP API v5
 */
export async function sendMsg91Otp(params: {
  phone: string;
  otp?: string;
}): Promise<{ success: boolean; message?: string; error?: string; raw?: unknown }> {
  const config = getMsg91Config();

  if (!config.authKey) {
    return {
      success: false,
      error: "MSG91_AUTH_KEY is not configured in environment variables.",
    };
  }

  if (!config.templateId) {
    return {
      success: false,
      error: "MSG91_OTP_TEMPLATE_ID is not configured in environment variables.",
    };
  }

  const formattedMobile = formatIndianMobileForMsg91(params.phone);
  if (!/^91[6-9]\d{9}$/.test(formattedMobile)) {
    return {
      success: false,
      error: "Invalid 10-digit Indian mobile number.",
    };
  }

  const queryParams: Record<string, string> = {
    template_id: config.templateId,
    mobile: formattedMobile,
    otp_length: String(config.otpLength || 4),
    otp_expiry: String(config.otpExpiryMinutes || 10),
  };

  if (params.otp) {
    queryParams.otp = params.otp;
  }

  try {
    const res = await executeMsg91Request("/otp", config.authKey, queryParams, "POST");

    if (
      res.ok &&
      (res.data?.type === "success" || res.data?.message?.toLowerCase().includes("success"))
    ) {
      console.log(`[MSG91 OTP Success]: Sent to ${maskMobileForLogs(formattedMobile)}`);
      return {
        success: true,
        message: res.data?.message || "OTP sent successfully via MSG91",
        raw: res.data,
      };
    }

    const errorMessage = res.data?.message || res.error || `MSG91 HTTP Error ${res.status}`;
    console.error(`[MSG91 OTP Error]:`, errorMessage);
    return {
      success: false,
      error: errorMessage,
      raw: res.data,
    };
  } catch (error: any) {
    console.error("[MSG91 OTP Network Error]:", error);
    return {
      success: false,
      error: error?.message || "Network error while connecting to MSG91 OTP service.",
    };
  }
}

/**
 * 2. Verify OTP with MSG91 API v5
 */
export async function verifyMsg91Otp(params: {
  phone: string;
  otp: string;
}): Promise<{ success: boolean; message?: string; error?: string; raw?: unknown }> {
  const config = getMsg91Config();

  if (!config.authKey) {
    return {
      success: false,
      error: "MSG91_AUTH_KEY is not configured.",
    };
  }

  const formattedMobile = formatIndianMobileForMsg91(params.phone);
  const cleanOtp = (params.otp || "").trim();

  try {
    const res = await executeMsg91Request(
      "/otp/verify",
      config.authKey,
      { mobile: formattedMobile, otp: cleanOtp },
      "GET",
    );

    if (
      res.ok &&
      (res.data?.type === "success" || res.data?.message?.toLowerCase().includes("success"))
    ) {
      console.log(`[MSG91 Verify Success]: Verified for ${maskMobileForLogs(formattedMobile)}`);
      return {
        success: true,
        message: res.data?.message || "OTP verified successfully",
        raw: res.data,
      };
    }

    const errorMessage = res.data?.message || res.error || "Invalid or expired OTP.";
    console.warn(`[MSG91 Verify Failed]: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      raw: res.data,
    };
  } catch (error: any) {
    console.error("[MSG91 Verify Network Error]:", error);
    return {
      success: false,
      error: error?.message || "Network error while verifying OTP with MSG91.",
    };
  }
}

/**
 * 3. Retry / Resend OTP via MSG91
 */
export async function retryMsg91Otp(params: {
  phone: string;
  retryType?: "text" | "voice";
}): Promise<{ success: boolean; message?: string; error?: string }> {
  const config = getMsg91Config();
  if (!config.authKey) {
    return { success: false, error: "MSG91_AUTH_KEY is not configured." };
  }

  const formattedMobile = formatIndianMobileForMsg91(params.phone);
  const retryType = params.retryType || "text";

  try {
    const res = await executeMsg91Request(
      "/otp/retry",
      config.authKey,
      { mobile: formattedMobile, retrytype: retryType },
      "GET",
    );

    if (
      res.ok &&
      (res.data?.type === "success" || res.data?.message?.toLowerCase().includes("success"))
    ) {
      return { success: true, message: res.data?.message || "OTP resent successfully." };
    }

    return {
      success: false,
      error: res.data?.message || res.error || "Failed to resend OTP.",
    };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error resending OTP." };
  }
}

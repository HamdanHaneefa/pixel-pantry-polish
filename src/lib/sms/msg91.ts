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
  const env = typeof process !== "undefined" ? process.env : ({} as Record<string, string | undefined>);
  return {
    authKey: (env["MSG91_AUTH_KEY"] || "").trim(),
    templateId: (env["MSG91_OTP_TEMPLATE_ID"] || "").trim(),
    otpLength: parseInt(env["MSG91_OTP_LENGTH"] || "4", 10) || 4,
    otpExpiryMinutes: parseInt(env["MSG91_OTP_EXPIRY"] || "5", 10) || 5,
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

  try {
    const url = new URL("https://control.msg91.com/api/v5/otp");
    url.searchParams.set("template_id", config.templateId);
    url.searchParams.set("mobile", formattedMobile);
    url.searchParams.set("otp_length", String(config.otpLength || 4));
    url.searchParams.set("otp_expiry", String(config.otpExpiryMinutes || 5));

    if (params.otp) {
      url.searchParams.set("otp", params.otp);
    }

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "authkey": config.authKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Optional custom body parameters if used in template variables
        company_name: "Petpedia",
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && (data?.type === "success" || data?.message?.toLowerCase().includes("success"))) {
      console.log(`[MSG91 OTP Success]: Sent to ${formattedMobile}`);
      return {
        success: true,
        message: data?.message || "OTP sent successfully via MSG91",
        raw: data,
      };
    }

    const errorMessage = data?.message || `MSG91 HTTP Error ${response.status}: ${response.statusText}`;
    console.error(`[MSG91 OTP Error]:`, errorMessage, data);
    return {
      success: false,
      error: errorMessage,
      raw: data,
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
    const url = new URL("https://control.msg91.com/api/v5/otp/verify");
    url.searchParams.set("mobile", formattedMobile);
    url.searchParams.set("otp", cleanOtp);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "authkey": config.authKey,
      },
    });

    const data = await response.json().catch(() => null);

    // MSG91 returns {"message":"OTP verified success","type":"success"} on valid OTP
    if (response.ok && (data?.type === "success" || data?.message?.toLowerCase().includes("success"))) {
      console.log(`[MSG91 Verify Success]: Verified for ${formattedMobile}`);
      return {
        success: true,
        message: data?.message || "OTP verified successfully",
        raw: data,
      };
    }

    const errorMessage = data?.message || "Invalid or expired OTP.";
    console.warn(`[MSG91 Verify Failed]: ${errorMessage}`);
    return {
      success: false,
      error: errorMessage,
      raw: data,
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
    const url = new URL("https://control.msg91.com/api/v5/otp/retry");
    url.searchParams.set("mobile", formattedMobile);
    url.searchParams.set("retrytype", retryType);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "authkey": config.authKey,
      },
    });

    const data = await response.json().catch(() => null);
    if (response.ok && (data?.type === "success" || data?.message?.toLowerCase().includes("success"))) {
      return { success: true, message: data?.message || "OTP resent successfully." };
    }

    return {
      success: false,
      error: data?.message || "Failed to resend OTP.",
    };
  } catch (error: any) {
    return { success: false, error: error?.message || "Network error resending OTP." };
  }
}

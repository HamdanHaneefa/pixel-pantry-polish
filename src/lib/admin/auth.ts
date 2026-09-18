import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { ADMIN_CONFIG } from "./config";

function getExpectedSessionToken(): string {
  return Buffer.from(`petpedia-admin:${ADMIN_CONFIG.adminPasscode}`).toString("base64");
}

export const checkAdminAuthFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = getCookie(ADMIN_CONFIG.sessionCookieName);
  const expected = getExpectedSessionToken();
  return { authenticated: Boolean(session && session === expected) };
});

export const loginAdminFn = createServerFn({ method: "POST" })
  .validator((data: { passcode: string }) => data)
  .handler(async ({ data }) => {
    const cleanPasscode = (data.passcode || "").trim();
    if (cleanPasscode !== ADMIN_CONFIG.adminPasscode) {
      return { success: false, error: "Incorrect passcode. Please try again." };
    }

    const token = getExpectedSessionToken();
    setCookie(ADMIN_CONFIG.sessionCookieName, token, {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return { success: true };
  });

export const logoutAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(ADMIN_CONFIG.sessionCookieName);
  return { success: true };
});

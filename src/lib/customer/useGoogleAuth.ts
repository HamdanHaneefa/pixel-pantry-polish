import { useEffect, useRef, useState, useCallback } from "react";

interface UseGoogleAuthOptions {
  clientId: string;
  onSuccess: (userInfo: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }) => Promise<void> | void;
  onError?: (error: string) => void;
}

export function useGoogleAuth({ clientId, onSuccess, onError }: UseGoogleAuthOptions) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const tokenClientRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !clientId) return;

    const setupClient = () => {
      try {
        if ((window as any).google?.accounts?.oauth2) {
          tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
            client_id: clientId,
            scope: "openid profile email",
            callback: async (tokenResponse: any) => {
              if (tokenResponse?.error) {
                setIsLoading(false);
                onError?.(tokenResponse.error_description || tokenResponse.error || "Google sign-in was cancelled.");
                return;
              }

              if (!tokenResponse?.access_token) {
                setIsLoading(false);
                onError?.("No access token received from Google.");
                return;
              }

              try {
                const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                
                if (!res.ok) {
                  throw new Error(`Failed to fetch user profile: ${res.statusText}`);
                }

                const data = await res.json();
                await onSuccess({
                  email: data.email || "",
                  firstName: data.given_name || data.name || "Pet",
                  lastName: data.family_name || "Parent",
                  picture: data.picture,
                });
              } catch (err: any) {
                console.error("[GoogleAuth] Profile fetch error:", err);
                onError?.(err?.message || "Failed to fetch Google profile details.");
              } finally {
                setIsLoading(false);
              }
            },
            error_callback: (err: any) => {
              setIsLoading(false);
              console.warn("[GoogleAuth] OAuth error:", err);
              onError?.(err?.message || "Google OAuth initialization error.");
            },
          });
          setIsReady(true);
        }
      } catch (e: any) {
        console.error("[GoogleAuth] Failed to initialize token client:", e);
      }
    };

    if ((window as any).google?.accounts?.oauth2) {
      setupClient();
      return;
    }

    // Check if script is already in document
    const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existingScript) {
      existingScript.addEventListener("load", setupClient);
      return () => {
        existingScript.removeEventListener("load", setupClient);
      };
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = setupClient;
    script.onerror = () => {
      console.warn("[GoogleAuth] Failed to load Google Identity Services SDK.");
    };
    document.body.appendChild(script);

    return () => {
      // Keep script in document to prevent reloading
    };
  }, [clientId, onSuccess, onError]);

  const loginWithGoogle = useCallback(() => {
    if (!clientId) {
      onError?.("Google Client ID is not configured.");
      return;
    }

    setIsLoading(true);

    if (tokenClientRef.current) {
      try {
        // Prompt user to select account
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err: any) {
        setIsLoading(false);
        console.error("[GoogleAuth] Request token error:", err);
        onError?.(err?.message || "Failed to open Google Sign-in popup.");
      }
    } else if (typeof window !== "undefined" && (window as any).google?.accounts?.oauth2) {
      // Re-try initialization on demand
      try {
        tokenClientRef.current = (window as any).google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid profile email",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.error) {
              setIsLoading(false);
              onError?.(tokenResponse.error_description || tokenResponse.error || "Google sign-in was cancelled.");
              return;
            }

            try {
              const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
              });
              const data = await res.json();
              await onSuccess({
                email: data.email || "",
                firstName: data.given_name || data.name || "Pet",
                lastName: data.family_name || "Parent",
                picture: data.picture,
              });
            } catch (err: any) {
              onError?.(err?.message || "Failed to fetch Google profile details.");
            } finally {
              setIsLoading(false);
            }
          },
        });
        tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
      } catch (err: any) {
        setIsLoading(false);
        onError?.("Google Sign-in is not ready yet. Please try again.");
      }
    } else {
      setIsLoading(false);
      onError?.("Google Sign-in service is loading. Please wait a moment.");
    }
  }, [clientId, onSuccess, onError]);

  return {
    loginWithGoogle,
    isLoading,
    isReady,
  };
}

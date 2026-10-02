import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  CustomerSession,
  getCustomerSessionFn,
  initiateCustomerOtpFn,
  verifyCustomerOtpFn,
  logoutCustomerFn,
  autoAuthenticateAfterOrderFn,
} from "@/lib/customer/auth";

interface CustomerContextType {
  customer: CustomerSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  requestOtp: (phone: string) => Promise<{
    success: boolean;
    token?: string;
    error?: string;
    testOtpHint?: string;
    message?: string;
  }>;
  verifyOtp: (phone: string, otp: string, token?: string) => Promise<{
    success: boolean;
    customer?: CustomerSession;
    error?: string;
  }>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  autoLoginAfterCheckout: (data: {
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    orderId?: string;
  }) => Promise<void>;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    try {
      const res = await getCustomerSessionFn();
      if (res?.authenticated && res.customer) {
        setCustomer(res.customer);
        setIsAuthenticated(true);
      } else {
        setCustomer(null);
        setIsAuthenticated(false);
      }
    } catch (e) {
      console.warn("[CustomerContext] Failed to check customer session:", e);
      setCustomer(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const requestOtp = async (phone: string) => {
    try {
      const res = await initiateCustomerOtpFn({ data: { phone } });
      if (res.success) {
        return {
          success: true,
          token: res.fastrrToken,
          testOtpHint: res.testOtpHint,
          message: res.message,
        };
      }
      return { success: false, error: res.error || "Failed to send OTP" };
    } catch (err: any) {
      return { success: false, error: err?.message || "Network error sending OTP" };
    }
  };

  const verifyOtp = async (phone: string, otp: string, token?: string) => {
    try {
      const res = await verifyCustomerOtpFn({
        data: { phone, otp, token },
      });
      if (res.success && res.customer) {
        setCustomer(res.customer);
        setIsAuthenticated(true);
        return { success: true, customer: res.customer };
      }
      return { success: false, error: res.error || "Invalid OTP" };
    } catch (err: any) {
      return { success: false, error: err?.message || "Verification failed" };
    }
  };

  const logout = async () => {
    try {
      await logoutCustomerFn();
    } catch (e) {
      console.warn("Logout error:", e);
    } finally {
      setCustomer(null);
      setIsAuthenticated(false);
      if (typeof window !== "undefined") {
        window.location.href = "/";
      }
    }
  };

  const autoLoginAfterCheckout = async (data: {
    phone: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    orderId?: string;
  }) => {
    try {
      const res = await autoAuthenticateAfterOrderFn({ data });
      if (res.success && res.customer) {
        setCustomer(res.customer);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.warn("Auto-login error:", e);
    }
  };

  return (
    <CustomerContext.Provider
      value={{
        customer,
        isAuthenticated,
        isLoading,
        requestOtp,
        verifyOtp,
        logout,
        refreshSession,
        autoLoginAfterCheckout,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error("useCustomer must be used within a CustomerProvider");
  }
  return context;
}

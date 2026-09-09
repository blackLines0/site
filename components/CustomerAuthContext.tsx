"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  clearCustomerSession,
  getCustomerSession,
  loginCustomer,
  registerCustomer,
  setCustomerSession,
  type SessionCustomer,
} from "@/lib/api";

interface CustomerAuthContextValue {
  customer: SessionCustomer | null;
  isAuthenticated: boolean;
  login: (identifiant: string, password: string) => Promise<void>;
  register: (input: { nom: string; email?: string; telephone?: string; password: string }) => Promise<void>;
  logout: () => void;
}

const CustomerAuthContext = createContext<CustomerAuthContextValue | null>(null);

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  // Starts signed-out on both server and client's first render so hydration
  // matches, then loads the real session from localStorage right after mount.
  const [customer, setCustomer] = useState<SessionCustomer | null>(null);

  useEffect(() => {
    setCustomer(getCustomerSession()?.customer ?? null);
  }, []);

  const value = useMemo<CustomerAuthContextValue>(
    () => ({
      customer,
      isAuthenticated: Boolean(customer),
      async login(identifiant, password) {
        const session = await loginCustomer(identifiant, password);
        setCustomerSession(session);
        setCustomer(session.customer);
      },
      async register(input) {
        const session = await registerCustomer(input);
        setCustomerSession(session);
        setCustomer(session.customer);
      },
      logout() {
        clearCustomerSession();
        setCustomer(null);
      },
    }),
    [customer],
  );

  return <CustomerAuthContext.Provider value={value}>{children}</CustomerAuthContext.Provider>;
}

export function useCustomerAuth(): CustomerAuthContextValue {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) {
    throw new Error("useCustomerAuth must be used within a CustomerAuthProvider");
  }
  return ctx;
}

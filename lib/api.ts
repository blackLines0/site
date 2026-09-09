const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3333";
const SESSION_KEY = "blacklines_customer_session";

export interface SessionCustomer {
  id: string;
  nom: string;
  email: string | null;
  telephone: string | null;
  adresse: string | null;
}

interface CustomerSession {
  token: string;
  customer: SessionCustomer;
}

function hasWindow(): boolean {
  return typeof window !== "undefined";
}

export function getCustomerSession(): CustomerSession | null {
  if (!hasWindow()) return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CustomerSession;
  } catch {
    return null;
  }
}

export function setCustomerSession(session: CustomerSession) {
  if (!hasWindow()) return;
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearCustomerSession() {
  if (!hasWindow()) return;
  window.localStorage.removeItem(SESSION_KEY);
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getCustomerSession();
  const headers = new Headers(init?.headers);

  if (session?.token) {
    headers.set("Authorization", `Bearer ${session.token}`);
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `API error ${res.status}: ${path}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export async function registerCustomer(input: {
  nom: string;
  email?: string;
  telephone?: string;
  password: string;
}): Promise<CustomerSession> {
  const res = await fetch(`${API_URL}/customers/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Échec de l'inscription");
  return body as CustomerSession;
}

export async function loginCustomer(identifiant: string, password: string): Promise<CustomerSession> {
  const res = await fetch(`${API_URL}/customers/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifiant, password }),
  });

  const body = await res.json();
  if (!res.ok) throw new Error(body?.error ?? "Échec de la connexion");
  return body as CustomerSession;
}

import { api } from "./api";
import { MembershipPlan, BillingCycle } from "../types/plan";

const BASE = "/api/membership";

/* ================= TYPES ================= */

export interface MemberSnapshot {
  name: string;
  mobile: string | null;
  address: string | null;
}

export interface Subscription {
  _id: string;
  business: string;
  memberSnapshot: MemberSnapshot;
  plan: MembershipPlan;
  code: string;
  startDate: string;
  expiryDate: string | null;
  amountPaid: number;
  durationUsed: number;
  billingCycleUsed: BillingCycle;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPayload {
  name: string;
  mobile?: string;
  address?: string;
  code?: string;
  planId?: string;
  planData?: {
    name: string;
    price: number;
    duration: number;
    billingCycle?: BillingCycle;
  };
  duration?: number;
  billingCycle?: BillingCycle;
}

export interface UpdateSubscriptionPayload {
  name?: string;
  mobile?: string;
  address?: string;
  code?: string;
}

export interface RenewSubscriptionPayload {
  duration?: number;
  billingCycle?: BillingCycle;
}

/* ================= GET ALL ================= */
export const getSubscriptions = async (): Promise<Subscription[]> => {
  const res = await api.get<{ success: boolean; subscriptions: Subscription[] }>(
    `${BASE}/subscription`
  );
  return res.data.subscriptions;
};

/* ================= GET ONE ================= */
export const getSubscription = async (id: string): Promise<Subscription> => {
  const res = await api.get<{ success: boolean; subscription: Subscription }>(
    `${BASE}/subscription/${id}`
  );
  return res.data.subscription;
};

/* ================= CREATE ================= */
export const createSubscription = async (
  data: CreateSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.post<{ success: boolean; subscription: Subscription }>(
    `${BASE}/subscription`,
    data
  );
  return res.data.subscription;
};

/* ================= UPDATE ================= */
export const updateSubscription = async (
  id: string,
  data: UpdateSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.put<{ success: boolean; subscription: Subscription }>(
    `${BASE}/subscription/${id}`,
    data
  );
  return res.data.subscription;
};

/* ================= RENEW ================= */
export const renewSubscription = async (
  id: string,
  data?: RenewSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.put<{ success: boolean; subscription: Subscription }>(
    `${BASE}/subscription/renew/${id}`,
    data ?? {}
  );
  return res.data.subscription;
};

/* ================= CANCEL ================= */
export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const res = await api.put<{ success: boolean; subscription: Subscription }>(
    `${BASE}/subscription/cancel/${id}`
  );
  return res.data.subscription;
};

/* ================= HISTORY ================= */

export interface SubscriptionHistoryEntry {
  _id: string;
  subscription: string;
  business: string;
  event: "CREATE" | "RENEW" | "CANCEL" | "EXPIRE";
  startDate: string | null;
  expiryDate: string | null;
  amountPaid: number;
  durationUsed: number | null;
  billingCycleUsed: string | null;
  status: string | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export const getSubscriptionHistory = async (
  id: string
): Promise<SubscriptionHistoryEntry[]> => {
  const res = await api.get<{ success: boolean; history: SubscriptionHistoryEntry[] }>(
    `${BASE}/subscription/${id}/history`
  );
  return res.data.history;
};

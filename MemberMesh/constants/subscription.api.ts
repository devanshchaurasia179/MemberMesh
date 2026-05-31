import { api } from "./api";

export interface Subscription {
  _id: string;
  code?: string;
  memberSnapshot: { name: string; mobile?: string | null; address?: string | null } | null;
  plan: { _id: string; name: string; price: number; duration: number; billingCycle: string } | null;
  startDate: string;
  expiryDate: string | null;
  amountPaid: number;
  durationUsed?: number;
  billingCycleUsed?: string;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING";
}

export interface CreateSubscriptionPayload {
  name: string;
  mobile?: string;
  address?: string;
  planId?: string;
  planData?: {
    name: string;
    price: number;
    duration: number;
    billingCycle?: "DAYS" | "MONTH" | "YEAR" | "LIFETIME";
  };
  duration?: number;
  billingCycle?: "DAYS" | "MONTH" | "YEAR";
}

export interface UpdateSubscriptionPayload {
  name?: string;
  mobile?: string;
  address?: string;
}

export interface RenewSubscriptionPayload {
  duration?: number;
  billingCycle?: "DAYS" | "MONTH" | "YEAR";
}

export const createSubscription = async (data: CreateSubscriptionPayload) => {
  const res = await api.post("/subscription", data);
  return res.data;
};

export const getSubscriptions = async (): Promise<Subscription[]> => {
  const res = await api.get("/subscription");
  return res.data.subscriptions;
};

export const getSubscription = async (id: string): Promise<Subscription> => {
  const res = await api.get(`/subscription/${id}`);
  return res.data.subscription;
};

export const getMemberSubscriptions = async (memberId: string): Promise<Subscription[]> => {
  const res = await api.get(`/subscription/member/${memberId}`);
  return res.data.subscriptions;
};

export const updateSubscription = async (
  id: string,
  payload: UpdateSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.put(`/subscription/${id}`, payload);
  return res.data.subscription;
};

export const renewSubscription = async (
  id: string,
  payload?: RenewSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.put(`/subscription/renew/${id}`, payload ?? {});
  return res.data.subscription;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  console.log("Cancelling subscription with ID:", id);
  try {
    const res = await api.put(`/subscription/cancel/${id}`);
    console.log("Cancel response:", res.data);
    return res.data.subscription;
  } catch (error: any) {
    console.error("Cancel subscription error:", error.response?.data || error.message);
    throw error;
  }
};
import { api } from "./api";

export interface Subscription {
  _id: string;
  code?: string;
  member: { _id: string; name: string; phone?: string };
  plan: { _id: string; name: string; price: number; duration: number; billingCycle: string };
  startDate: string;
  expiryDate: string | null;
  amountPaid: number;
  status: "ACTIVE" | "EXPIRED" | "CANCELLED";
  paymentStatus: "PAID" | "PENDING";
}

export interface CreateSubscriptionPayload {
  memberId?: string;
  memberName?: string;
  phone?: string;
  planId?: string;
  planData?: {
    name: string;
    price: number;
    duration: number;
    billingCycle?: "DAYS" | "MONTH" | "YEAR" | "LIFETIME";
  };
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

export const renewSubscription = async (
  id: string,
  payload?: RenewSubscriptionPayload
): Promise<Subscription> => {
  const res = await api.put(`/subscription/renew/${id}`, payload ?? {});
  return res.data.subscription;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
  const res = await api.put(`/subscription/cancel/${id}`);
  return res.data.subscription;
};
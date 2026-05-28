export type BillingCycle = "DAYS" | "MONTH" | "YEAR" | "LIFETIME";

export interface MembershipPlan {
  _id: string;
  name: string;
  price: number;
  duration: number;
  billingCycle: BillingCycle;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePlanPayload {
  name: string;
  price: number;
  duration: number;
  billingCycle?: BillingCycle;
  isActive?: boolean;
}
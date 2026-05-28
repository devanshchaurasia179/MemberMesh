import { api } from "./api";
import { MembershipPlan, CreatePlanPayload } from "../types/plan";

/* ================= CREATE PLAN ================= */
export const createPlanApi = async (data: CreatePlanPayload) => {
  const res = await api.post<{ success: boolean; plan: MembershipPlan }>(
    "/plans",
    data
  );
  return res.data.plan;
};

/* ================= GET ALL PLANS ================= */
export const getAllPlansApi = async (onlyActive?: boolean) => {
  const res = await api.get<{ success: boolean; plans: MembershipPlan[] }>(
    "/plans",
    {
      params: { onlyActive },
    }
  );
  return res.data.plans;
};

/* ================= UPDATE PLAN ================= */
export const updatePlanApi = async (
  id: string,
  data: Partial<CreatePlanPayload>
) => {
  const res = await api.put<{ success: boolean; plan: MembershipPlan }>(
    `/plans/${id}`,
    data
  );
  return res.data.plan;
};

/* ================= TOGGLE STATUS ================= */
export const togglePlanStatusApi = async (id: string) => {
  const res = await api.patch<{ success: boolean; isActive: boolean }>(
    `/plans/${id}/toggle`
  );
  return res.data;
};

/* ================= DELETE ================= */
export const deletePlanApi = async (id: string) => {
  const res = await api.delete<{ success: boolean }>(`/plans/${id}`);
  return res.data;
};
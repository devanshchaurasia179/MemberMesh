import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createPlanApi,
  getAllPlansApi,
  updatePlanApi,
  togglePlanStatusApi,
  deletePlanApi,
} from "../constants/plans.api";
import { CreatePlanPayload } from "../types/plan";

/* ================= GET PLANS ================= */
export const usePlans = (onlyActive?: boolean) => {
  return useQuery({
    queryKey: ["plans", onlyActive],
    queryFn: () => getAllPlansApi(onlyActive),
  });
};

/* ================= CREATE ================= */
export const useCreatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePlanPayload) => createPlanApi(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

/* ================= UPDATE ================= */
export const useUpdatePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePlanPayload> }) =>
      updatePlanApi(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

/* ================= TOGGLE ================= */
export const useTogglePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => togglePlanStatusApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

/* ================= DELETE ================= */
export const useDeletePlan = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePlanApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};
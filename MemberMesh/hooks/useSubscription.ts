import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSubscription,
  cancelSubscription,
  getSubscriptions,
  renewSubscription,
  RenewSubscriptionPayload,
} from "../constants/subscription.api";

const QUERY_KEY = ["subscriptions"];

export const useSubscriptions = () =>
  useQuery({ queryKey: QUERY_KEY, queryFn: getSubscriptions });

export const useCreateSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useRenewSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: RenewSubscriptionPayload }) =>
      renewSubscription(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};

export const useCancelSubscription = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY }),
  });
};
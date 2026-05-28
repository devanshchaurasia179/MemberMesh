import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getMembers,
  getMember,
  createMember,
  updateMember,
  deleteMember,
} from "../constants/member.api";

import { Member } from "../types/member";
import { QUERY_KEYS } from "../constants/querykey";

/* ================= GET ALL MEMBERS ================= */
export const useMembers = () => {
  return useQuery<Member[], Error>({
    queryKey: QUERY_KEYS.MEMBERS,
    queryFn: getMembers,
  });
};

/* ================= GET SINGLE MEMBER ================= */
export const useMember = (id?: string) => {
  return useQuery<Member, Error>({
    queryKey: id ? QUERY_KEYS.MEMBER(id) : ["member"],
    queryFn: async () => {
      if (!id) throw new Error("Member ID required");
      return getMember(id);
    },
    enabled: !!id, // ✅ prevents unnecessary calls
  });
};

/* ================= CREATE MEMBER ================= */
export const useCreateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createMember,

    onSuccess: (newMember) => {
      // 🔥 Optimistic update (better UX)
      queryClient.setQueryData<Member[]>(
        QUERY_KEYS.MEMBERS,
        (old = []) => [newMember, ...old]
      );
    },
  });
};

/* ================= UPDATE MEMBER ================= */
export const useUpdateMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Member>;
    }) => updateMember(id, data),

    onSuccess: (updatedMember) => {
      // ✅ Update list cache
      queryClient.setQueryData<Member[]>(
        QUERY_KEYS.MEMBERS,
        (old = []) =>
          old.map((m) =>
            m._id === updatedMember._id ? updatedMember : m
          )
      );

      // ✅ Update single cache
      queryClient.setQueryData(
        QUERY_KEYS.MEMBER(updatedMember._id),
        updatedMember
      );
    },
  });
};

/* ================= DELETE MEMBER ================= */
export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMember,

    onSuccess: (_, deletedId) => {
      // ✅ Remove from list
      queryClient.setQueryData<Member[]>(
        QUERY_KEYS.MEMBERS,
        (old = []) => old.filter((m) => m._id !== deletedId)
      );

      // ✅ Remove single cache
      queryClient.removeQueries({
        queryKey: QUERY_KEYS.MEMBER(deletedId),
      });
    },
  });
};
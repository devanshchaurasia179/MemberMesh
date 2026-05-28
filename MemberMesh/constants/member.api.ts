import { api } from "./api";
import {
  Member,
  CreateMemberPayload,
  UpdateMemberPayload,
} from "../types/member";

/* ================= CREATE ================= */
export const createMember = async (data: CreateMemberPayload) => {
  const res = await api.post("/customer", data);
  return res.data.member as Member;
};

/* ================= GET ALL ================= */
export const getMembers = async () => {
  const res = await api.get("/customer");
  return res.data.members as Member[];
};

/* ================= GET SINGLE ================= */
export const getMember = async (id: string) => {
  const res = await api.get(`/customer/${id}`);
  return res.data.member as Member;
};

/* ================= UPDATE ================= */
export const updateMember = async (
  id: string,
  data: UpdateMemberPayload
) => {
  const res = await api.put(`/customer/${id}`, data);
  return res.data.member as Member;
};

/* ================= DELETE ================= */
export const deleteMember = async (id: string) => {
  const res = await api.delete(`/customer/${id}`);
  return res.data;
};
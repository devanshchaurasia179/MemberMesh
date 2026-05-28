export interface Member {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateMemberPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface UpdateMemberPayload {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}
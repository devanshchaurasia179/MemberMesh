import { api } from "./api";

const BASE = "/api/membership";

export const sendOtpApi = (mobileNumber: string) =>
  api.post(`${BASE}/auth/send-otp`, { mobileNumber });

export const verifyOtpApi = (mobileNumber: string, otp: string) =>
  api.post(`${BASE}/auth/verify-otp`, { mobileNumber, otp });

export const getMeApi = () => api.get(`${BASE}/auth/me`);

export const logoutApi = () => api.post(`${BASE}/auth/logout`);

export const updateProfileApi = (data: {
  ownerName?: string;
  businessName?: string;
  gstNumber?: string;
  upiId?: string;
  location?: string;
}) => api.put(`${BASE}/auth/profile`, data);
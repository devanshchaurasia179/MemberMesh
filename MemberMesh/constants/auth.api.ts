import { api } from "./api";

export const sendOtpApi = (mobileNumber: string) =>
  api.post("/auth/send-otp", { mobileNumber });

export const verifyOtpApi = (mobileNumber: string, otp: string) =>
  api.post("/auth/verify-otp", { mobileNumber, otp });

export const getMeApi = () => api.get("/auth/me");

export const logoutApi = () => api.post("/auth/logout");

export const updateProfileApi = (data: {
  ownerName?: string;
  businessName?: string;
  gstNumber?: string;
  upiId?: string;
  location?: string;
}) => api.put("/auth/profile", data);
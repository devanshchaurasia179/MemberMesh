import axios from "axios";

export const API_URL = "https://membermesh-proxy.vercel.app";
  console.log("🔥 RUNTIME API URL:", API_URL);
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // 🔥 THIS IS THE KEY
});



import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Get the local network IP for Expo Go
const getApiUrl = () => {
  // If running in Expo Go, use the manifest's debuggerHost to get local IP
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(':')[0];
    return `http://${host}:5000/api/membership/`;
  }
  
  // Fallback for production or when hostUri is not available
  return "http://localhost:5000/api/membership/";
};

export const API_URL = getApiUrl();
console.log("🔥 RUNTIME API URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true, // 🔥 THIS IS THE KEY
});


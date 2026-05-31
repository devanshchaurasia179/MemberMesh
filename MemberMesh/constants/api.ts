import axios from "axios";
import Constants from "expo-constants";

// Production HTTPS proxy (Vercel → AWS Elastic Beanstalk)
const PROD_API_URL = "https://membermesh-api.vercel.app/api/membership/";

// Get the local network IP for Expo Go in dev
const getApiUrl = () => {
  if (__DEV__ && Constants.expoConfig?.hostUri) {
    const host = Constants.expoConfig.hostUri.split(":")[0];
    return `http://${host}:5000/api/membership/`;
  }
  return PROD_API_URL;
};

export const API_URL = getApiUrl();
console.log("🔥 RUNTIME API URL:", API_URL);

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
  withCredentials: true,
});

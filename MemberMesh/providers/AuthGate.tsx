import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function AuthGate({ children }: any) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    const inAuthScreen =
  segments[0] === "login" || segments[0] === "verify-otp";

  
    if (!user && !inAuthScreen) {
      router.replace("/login");
    } else if (user && inAuthScreen) {
      router.replace("/dashboard");
    }
  }, [user, loading]);

  return children;
}
import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../providers/AuthProvider";

export default function Index() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [user, loading]);

  return null;
}
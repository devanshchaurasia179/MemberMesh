import React, { useMemo } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text,
  SafeAreaView 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { logoutApi } from "../../constants/auth.api";
import FooterBar from "../components/FooterBar";
import ProfileCard from "./components/profileCard";
import StatCard from "./components/StatCard";
import ActivePlansCard from "./components/ActivePlansCard";
import SubscriptionStatusCard from "./components/SubscriptionStatusCard";
import { usePlans } from "../../hooks/useMembership";
import { useSubscriptions } from "../../hooks/useSubscription";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const { data: plans = [] } = usePlans(true);
  const { data: subscriptions = [] } = useSubscriptions();

  // Calculate subscription statistics
  const subscriptionStats = useMemo(() => {
    const activeCount = subscriptions.filter((sub: any) => sub.status === "ACTIVE").length;
    const expiredCount = subscriptions.filter((sub: any) => sub.status === "EXPIRED").length;
    return { activeCount, expiredCount };
  }, [subscriptions]);

  const handleLogout = async () => {
    try {
      await logoutApi();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback to clear local state if API fails
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Section */}
        <ProfileCard business={user} />

        {/* Dashboard Content Area */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Overview</Text>
          
          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <StatCard 
              title="Active Plans"
              count={plans.length}
              icon="layers"
              color="#aa3e36"
              onPress={() => router.push("/plans")}
              subtitle="Available"
            />
            <StatCard 
              title="Active Subscriptions"
              count={subscriptionStats.activeCount}
              icon="checkmark-circle"
              color="#10b981"
              onPress={() => router.push("/subscription")}
              subtitle="Active now"
            />
            <StatCard 
              title="Expired Subscriptions"
              count={subscriptionStats.expiredCount}
              icon="alert-circle"
              color="#ef4444"
              onPress={() => router.push("/subscription")}
              subtitle="Need renewal"
            />
            <StatCard 
              title="Printer Setup"
              count={0}
              icon="print"
              color="#8b5cf6"
              onPress={() => router.push("/printer")}
              subtitle="Configure"
            />
          </View>

          {/* Active Plans Card */}
          <View style={styles.sectionContainer}>
            <ActivePlansCard />
          </View>

          {/* Subscription Status Cards */}
          <View style={styles.sectionContainer}>
            <Text style={styles.subscriptionSectionTitle}>Subscriptions</Text>
            <SubscriptionStatusCard status="ACTIVE" />
            <SubscriptionStatusCard status="EXPIRED" />
          </View>

          {/* Logout Button at bottom */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#64748b" />
            <Text style={styles.logoutText}>Logout from Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FooterBar/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFAFC",
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  content: {
    paddingHorizontal: 0,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 16,
    marginTop: 20,
    paddingHorizontal: 20,
    fontFamily: "Poppins-Bold",
  },
  subscriptionSectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 12,
    marginTop: 20,
    paddingHorizontal: 20,
    fontFamily: "Jost-Bold",
  },
  statsGrid: {
    paddingHorizontal: 20,
    gap: 8,
  },
  sectionContainer: {
    marginVertical: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    marginHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 15,
    gap: 8,
    backgroundColor: "#fff"
  },
  logoutText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 14,
    fontFamily: "Jost-Bold",
  },
});
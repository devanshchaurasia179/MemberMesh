import React, { useMemo } from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { logoutApi } from "../../constants/auth.api";
import FooterBar from "../components/FooterBar";
import ProfileCard from "./components/profileCard";
import OverviewCard from "./components/OverviewCard";
import ActivePlansCard from "./components/ActivePlansCard";
import SubscriptionStatusCard from "./components/SubscriptionStatusCard";
import { usePlans } from "../../hooks/useMembership";
import { useSubscriptions } from "../../hooks/useSubscription";
import type { Subscription } from "../../constants/subscription.api";

// ─── Near Expiry Card ─────────────────────────────────────────────────────────
// NearExpiryCard — replace your existing one

function NearExpiryCard({
  subscriptions,
  onPress,
}: {
  subscriptions: Subscription[];
  onPress: () => void;
}) {
  if (subscriptions.length === 0) return null;

  return (
    <View style={ne.wrapper}>
      {/* Header */}
      <View style={ne.header}>
        <View style={ne.headerLeft}>
          <View style={ne.iconWrap}>
            <Feather name="alert-triangle" size={15} color="#BA7517" />
          </View>
          <View>
            <Text style={ne.title}>Expiring soon</Text>
            <Text style={ne.subtitle}>
              {subscriptions.length} member{subscriptions.length > 1 ? "s" : ""} · next 7 days
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onPress} style={ne.viewAllBtn} activeOpacity={0.75}>
          <Text style={ne.viewAllText}>View all</Text>
          <Feather name="arrow-right" size={12} color="#0C447C" />
        </TouchableOpacity>
      </View>

      {/* Rows */}
      {subscriptions.map((sub, index) => {
        const daysLeft = sub.expiryDate
          ? Math.ceil((new Date(sub.expiryDate).getTime() - Date.now()) / 86400000)
          : null;

        const urgency =
          daysLeft !== null && daysLeft <= 2
            ? { color: "#A32D2D", bg: "#FCEBEB", bar: "#E24B4A", progress: Math.max(4, ((daysLeft ?? 0) / 7) * 100) }
            : daysLeft !== null && daysLeft <= 5
            ? { color: "#854F0B", bg: "#FAEEDA", bar: "#EF9F27", progress: ((daysLeft ?? 0) / 7) * 100 }
            : { color: "#3B6D11", bg: "#EAF3DE", bar: "#639922", progress: ((daysLeft ?? 0) / 7) * 100 };

        return (
          <View
            key={sub._id}
            style={[ne.row, index < subscriptions.length - 1 && ne.rowBorder]}
          >
            {/* Avatar */}
            <View style={[ne.avatar, { backgroundColor: urgency.bg }]}>
              <Text style={[ne.avatarText, { color: urgency.color }]}>
                {(sub.memberSnapshot?.name || "?").charAt(0).toUpperCase()}
              </Text>
            </View>

            {/* Middle */}
            <View style={ne.rowMid}>
              <Text style={ne.memberName} numberOfLines={1}>
                {sub.memberSnapshot?.name || "Unknown"}
              </Text>
              <Text style={ne.planName} numberOfLines={1}>
                {sub.plan?.name || "—"}
                {sub.memberSnapshot?.mobile ? `  ·  ${sub.memberSnapshot.mobile}` : ""}
              </Text>
              {/* Progress bar */}
              <View style={[ne.barTrack, { backgroundColor: urgency.bg }]}>
                <View style={[ne.barFill, { backgroundColor: urgency.bar, width: `${urgency.progress}%` as any }]} />
              </View>
            </View>

            {/* Badge */}
            <View style={[ne.badge, { backgroundColor: urgency.bg }]}>
              <Text style={[ne.badgeDays, { color: urgency.color }]}>
                {daysLeft !== null ? (daysLeft <= 0 ? "Today" : `${daysLeft}d`) : "—"}
              </Text>
              <Text style={[ne.badgeLbl, { color: urgency.color }]}>left</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const ne = StyleSheet.create({
  wrapper: {
    marginHorizontal: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: "#FAEEDA",
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  subtitle: { fontSize: 11, color: "#94a3b8", marginTop: 1 },
  viewAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#E6F1FB",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  viewAllText: { fontSize: 11, fontWeight: "600", color: "#0C447C" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    gap: 12,
  },
  rowBorder: { borderBottomWidth: 0.5, borderBottomColor: "#F1F5F9" },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: { fontSize: 15, fontWeight: "600" },
  rowMid: { flex: 1, gap: 2 },
  memberName: { fontSize: 13, fontWeight: "600", color: "#0f172a" },
  planName: { fontSize: 11, color: "#94a3b8" },
  barTrack: { height: 2, borderRadius: 2, marginTop: 5, overflow: "hidden" },
  barFill: { height: 2, borderRadius: 2 },
  badge: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    minWidth: 44,
    flexShrink: 0,
  },
  badgeDays: { fontSize: 15, fontWeight: "600", lineHeight: 18 },
  badgeLbl: { fontSize: 9, fontWeight: "500", letterSpacing: 0.3, marginTop: 1 },
});
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

  // Subscriptions expiring within 7 days
  const nearExpirySubscriptions = useMemo(() => {
    const now = Date.now();
    return (subscriptions as Subscription[])
      .filter((sub) => {
        if (sub.status !== "ACTIVE" || !sub.expiryDate) return false;
        const daysLeft = Math.ceil((new Date(sub.expiryDate).getTime() - now) / 86400000);
        return daysLeft >= 0 && daysLeft <= 7;
      })
      .sort((a, b) =>
        new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime()
      );
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
          
          {/* Overview Card */}
          <OverviewCard
            activePlans={plans.length}
            activeSubscriptions={subscriptionStats.activeCount}
            expiredSubscriptions={subscriptionStats.expiredCount}
            onPlansPress={() => router.push("/plans")}
            onActiveSubsPress={() => router.push("/subscription")}
            onExpiredSubsPress={() => router.push("/subscription")}
          />

          {/* Near Expiry Card */}
          {nearExpirySubscriptions.length > 0 && (
            <View style={styles.sectionContainer}>
              <NearExpiryCard
                subscriptions={nearExpirySubscriptions}
                onPress={() => router.push("/subscription")}
              />
            </View>
          )}
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
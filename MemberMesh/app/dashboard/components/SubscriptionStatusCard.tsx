import React from "react";
import { 
  View, 
  Text, 
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSubscriptions } from "../../../hooks/useSubscription";
import { useRouter } from "expo-router";

interface SubscriptionCardProps {
  status: "ACTIVE" | "EXPIRED";
}

export default function SubscriptionStatusCard({ status }: SubscriptionCardProps) {
  const { data: allSubscriptions, isLoading, error } = useSubscriptions();
  const router = useRouter();

  const filteredSubscriptions = allSubscriptions?.filter(
    (sub: any) => sub.status === status
  ) || [];

  const isActive = status === "ACTIVE";
  const color = isActive ? "#10b981" : "#ef4444";
  const lightColor = isActive ? "#d1fae5" : "#fee2e2";
  const icon = isActive ? "checkmark-circle" : "alert-circle";
  const title = isActive ? "Active Subscriptions" : "Expired Subscriptions";

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: lightColor }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name={icon as any} size={20} color={color} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={color} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: lightColor }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <Ionicons name={icon as any} size={20} color={color} />
            <Text style={styles.title}>{title}</Text>
          </View>
        </View>
        <Text style={styles.errorText}>Error loading subscriptions</Text>
      </View>
    );
  }

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: lightColor }]}
      onPress={() => router.push("/subscription")}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name={icon as any} size={20} color={color} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={color} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.count, { color }]}>
          {filteredSubscriptions.length}
        </Text>
        <Text style={[styles.subtitle, { color }]}>
          {filteredSubscriptions.length === 1 ? "subscription" : "subscriptions"}
        </Text>
      </View>

      {filteredSubscriptions.length > 0 && (
        <View style={styles.previewContainer}>
          {filteredSubscriptions.slice(0, 2).map((sub: any) => (
            <View key={sub._id} style={styles.previewItem}>
              <Ionicons name="person-circle" size={16} color={color} />
              <View style={styles.previewText}>
                <Text style={styles.memberName} numberOfLines={1}>
                  {sub.member?.name || "Member"}
                </Text>
                <Text style={styles.planName} numberOfLines={1}>
                  {sub.plan?.name || "Plan"}
                </Text>
              </View>
            </View>
          ))}
          {filteredSubscriptions.length > 2 && (
            <Text style={[styles.moreText, { color }]}>
              +{filteredSubscriptions.length - 2} more
            </Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontFamily: "Jost-Bold",
    fontSize: 14,
    color: "#1e293b",
  },
  content: {
    marginBottom: 12,
  },
  count: {
    fontFamily: "Poppins-Bold",
    fontSize: 32,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: "Jost-Regular",
    fontSize: 12,
    marginTop: 2,
  },
  previewContainer: {
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    paddingTop: 12,
    gap: 10,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  previewText: {
    flex: 1,
  },
  memberName: {
    fontFamily: "Jost-Regular",
    fontSize: 12,
    color: "#1e293b",
  },
  planName: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: "#64748b",
    marginTop: 2,
  },
  moreText: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
  loadingContainer: {
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontFamily: "Jost-Regular",
    fontSize: 12,
    color: "#ef4444",
  },
});

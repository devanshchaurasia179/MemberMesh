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
import { usePlans } from "../../../hooks/useMembership";
import { useRouter } from "expo-router";

export default function ActivePlansCard() {
  const { data: plans, isLoading, error } = usePlans(true); // Only active plans
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Plans</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#aa3e36" />
        </View>
      </View>
    );
  }

  if (error || !plans || plans.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Active Plans</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="layers-outline" size={40} color="#cbd5e1" />
          <Text style={styles.emptyText}>No active plans yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Plans</Text>
        <TouchableOpacity 
          onPress={() => router.push("/plans")}
          style={styles.seeAll}
        >
          <Text style={styles.seeAllText}>See All</Text>
          <Ionicons name="chevron-forward" size={16} color="#aa3e36" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.plansContainer}
      >
        {plans.slice(0, 5).map((plan: any) => (
          <View key={plan._id} style={styles.planCard}>
            <View style={styles.planHeader}>
              <Ionicons name="layers" size={20} color="#aa3e36" />
              <View style={styles.planInfo}>
                <Text style={styles.planName} numberOfLines={1}>
                  {plan.name}
                </Text>
              </View>
            </View>

            <View style={styles.planPrice}>
              <Text style={styles.priceValue}>₹{plan.price}</Text>
              <Text style={styles.pricePeriod}>/{plan.billingCycle}</Text>
            </View>

            <View style={styles.planDuration}>
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text style={styles.durationText}>
                {plan.duration} {plan.billingCycle}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#1e293b",
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontFamily: "Jost-Regular",
    fontSize: 12,
    color: "#aa3e36",
  },
  plansContainer: {
    gap: 12,
    paddingRight: 20,
  },
  planCard: {
    backgroundColor: "#FDFCF8",
    borderRadius: 12,
    padding: 14,
    minWidth: 160,
    borderLeftWidth: 3,
    borderLeftColor: "#aa3e36",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  planInfo: {
    flex: 1,
  },
  planName: {
    fontFamily: "Jost-Bold",
    fontSize: 13,
    color: "#1e293b",
  },
  planPrice: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 8,
    gap: 2,
  },
  priceValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#aa3e36",
  },
  pricePeriod: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: "#94a3b8",
  },
  planDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  durationText: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: "#64748b",
  },
  loadingContainer: {
    height: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  emptyText: {
    fontFamily: "Jost-Regular",
    fontSize: 13,
    color: "#94a3b8",
  },
});

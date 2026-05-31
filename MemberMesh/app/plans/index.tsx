import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Animated,
  Alert,
} from "react-native";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useTogglePlan,
  useDeletePlan,
} from "../../hooks/useMembership";
import PlanModal from "./components/PlanModal";
import { Feather } from "@expo/vector-icons";

const CYCLE_LABEL: Record<string, string> = {
  DAYS: "day",
  MONTH: "month",
  YEAR: "year",
};

const CYCLE_COLOR: Record<string, { bg: string; text: string }> = {
  DAYS: { bg: "#FFF3E0", text: "#E65100" },
  MONTH: { bg: "#EDE7F6", text: "#5E35B1" },
  YEAR: { bg: "#E8F5E9", text: "#2E7D32" },
};

function PlanCard({
  item,
  onEdit,
  onToggle,
  onDelete,
}: {
  item: any;
  onEdit: () => void;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isActive = item.isActive;
  const cycleColors = CYCLE_COLOR[item.billingCycle] ?? {
    bg: "#F3F4F6",
    text: "#374151",
  };

  const handlePressIn = () =>
    Animated.spring(scaleAnim, {
      toValue: 0.975,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

  const handlePressOut = () =>
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 4,
    }).start();

  const confirmDelete = () => {
    Alert.alert(
      "Delete plan?",
      `"${item.name}" will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <Animated.View
      style={[
        styles.card,
        !isActive && styles.cardInactive,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      {/* Top accent bar */}
      <View
        style={[styles.accentBar, { backgroundColor: isActive ? "#7C6FE0" : "#D1CDE8" }]}
      />

      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text style={styles.planName} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? "#22C55E" : "#D1D5DB" },
              ]}
            />
            <Text
              style={[
                styles.statusLabel,
                { color: isActive ? "#16A34A" : "#9CA3AF" },
              ]}
            >
              {isActive ? "Active" : "Inactive"}
            </Text>
          </View>
        </View>

        {/* Price block */}
        <View style={styles.priceBlock}>
          <Text style={styles.currencySymbol}>₹</Text>
          <Text style={styles.priceAmount}>{item.price.toLocaleString("en-IN")}</Text>
          <Text style={styles.pricePer}>
            / {CYCLE_LABEL[item.billingCycle] ?? item.billingCycle}
          </Text>
        </View>
      </View>

      {/* Meta chips */}
      <View style={styles.chipsRow}>
        <View style={[styles.chip, { backgroundColor: cycleColors.bg }]}>
          <Feather name="refresh-cw" size={10} color={cycleColors.text} />
          <Text style={[styles.chipText, { color: cycleColors.text }]}>
            {CYCLE_LABEL[item.billingCycle] ?? item.billingCycle}ly
          </Text>
        </View>
        <View style={styles.chip}>
          <Feather name="clock" size={10} color="#6B7280" />
          <Text style={styles.chipText}>
            {item.duration}{" "}
            {(CYCLE_LABEL[item.billingCycle] ?? item.billingCycle) + "(s)"}
          </Text>
        </View>
      </View>

      {/* Action row */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={onEdit}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={14} color="#5E35B1" />
          <Text style={styles.actionBtnPrimaryText}>Edit</Text>
        </TouchableOpacity>

        <View style={styles.actionBtnsRight}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              isActive ? styles.iconBtnPause : styles.iconBtnPlay,
            ]}
            onPress={onToggle}
            activeOpacity={0.75}
          >
            <Feather
              name={isActive ? "pause-circle" : "play-circle"}
              size={18}
              color={isActive ? "#92400E" : "#065F46"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconBtn, styles.iconBtnDelete]}
            onPress={confirmDelete}
            activeOpacity={0.75}
          >
            <Feather name="trash-2" size={18} color="#991B1B" />
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Feather name="layers" size={32} color="#A78BFA" />
      </View>
      <Text style={styles.emptyTitle}>No plans yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first membership tier to start accepting subscriptions.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onCreate} activeOpacity={0.85}>
        <Feather name="plus" size={15} color="#fff" />
        <Text style={styles.emptyBtnText}>Create a plan</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PlansScreen() {
  const { data: plans, isLoading } = usePlans();
  const { mutate: createPlan } = useCreatePlan();
  const { mutate: updatePlan } = useUpdatePlan();
  const { mutate: togglePlan } = useTogglePlan();
  const { mutate: deletePlan } = useDeletePlan();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  const handleEdit = (plan: any) => {
    setEditingPlan(plan);
    setModalVisible(true);
  };
  const handleCreateNew = () => {
    setEditingPlan(null);
    setModalVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C6FE0" />
        <Text style={styles.loadingText}>Loading plans…</Text>
      </View>
    );
  }

  const activeCount = (plans ?? []).filter((p: any) => p.isActive).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F2FF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Memberships</Text>
          <Text style={styles.subtitle}>
            {plans?.length
              ? `${activeCount} active · ${plans.length} total`
              : "No plans created yet"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleCreateNew}
          activeOpacity={0.85}
        >
          <Feather name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>New plan</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={plans}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <PlanCard
            item={item}
            onEdit={() => handleEdit(item)}
            onToggle={() => togglePlan(item._id)}
            onDelete={() => deletePlan(item._id)}
          />
        )}
        contentContainerStyle={[
          styles.listContent,
          !plans?.length && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyState onCreate={handleCreateNew} />}
      />

      <PlanModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={(data: any) => {
          if (editingPlan) updatePlan({ id: editingPlan._id, data });
          else createPlan(data);
          setModalVisible(false);
        }}
        initialData={editingPlan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F2FF" },

  /* Loading */
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F4F2FF" },
  loadingText: { marginTop: 12, fontSize: 14, color: "#9CA3AF", fontFamily: "System" },

  /* Header */
  header: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F4F2FF",
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#1C1340",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: "#7C3AED",
    marginTop: 3,
    fontWeight: "500",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#7C6FE0",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 14,
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },

  /* List */
  listContent: { paddingHorizontal: 16, paddingBottom: 40, paddingTop: 4 },
  listContentEmpty: { flex: 1 },

  /* Card */
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 14,
    overflow: "hidden",
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EDE9FE",
  },
  cardInactive: { opacity: 0.6 },
  accentBar: { height: 4, width: "100%" },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  planName: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1C1340",
    letterSpacing: -0.2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusLabel: { fontSize: 12, fontWeight: "600" },

  /* Price */
  priceBlock: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F3FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  currencySymbol: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7C6FE0",
    marginBottom: 2,
  },
  priceAmount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#5B21B6",
    letterSpacing: -0.5,
    marginHorizontal: 1,
  },
  pricePer: { fontSize: 11, color: "#A78BFA", marginBottom: 3, fontWeight: "500" },

  /* Chips */
  chipsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { fontSize: 11, fontWeight: "600", color: "#6B7280" },

  /* Actions */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingBottom: 16,
    paddingTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#F5F3FF",
    marginTop: 2,
  },
  actionBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EDE9FE",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  actionBtnPrimaryText: {
    color: "#5E35B1",
    fontWeight: "600",
    fontSize: 13,
  },
  actionBtnsRight: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  iconBtnPause: { backgroundColor: "#FEF3C7" },
  iconBtnPlay: { backgroundColor: "#D1FAE5" },
  iconBtnDelete: { backgroundColor: "#FEE2E2" },

  /* Empty state */
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1C1340",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#7C6FE0",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
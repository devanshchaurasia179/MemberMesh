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
  LayoutAnimation,
  UIManager,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  usePlans,
  useCreatePlan,
  useUpdatePlan,
  useTogglePlan,
  useDeletePlan,
} from "../../hooks/useMembership";
import PlanModal from "./components/PlanModal";
import { Feather } from "@expo/vector-icons";
import FooterBar from "../components/FooterBar";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Palette (matches SubscriptionCard) ──────────────────────────────────────
const C = {
  bg: "#EFF6FF",
  surface: "#FFFFFF",
  brand: "#1e3a8a",
  brandLight: "#3b82f6",
  brandXLight: "#DBEAFE",
  text: "#0f172a",
  textMid: "#475569",
  textSoft: "#94a3b8",
  border: "#e2e8f0",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  success: "#10b981",
  successLight: "#d1fae5",
  warn: "#f59e0b",
  warnLight: "#fef3c7",
};

const CYCLE_LABEL: Record<string, string> = {
  DAYS: "day",
  MONTH: "month",
  YEAR: "year",
};

const CYCLE_COLOR: Record<string, { bg: string; text: string; border: string }> = {
  DAYS:  { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
  MONTH: { bg: "#EDE9FE", text: "#5B21B6", border: "#DDD6FE" },
  YEAR:  { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
};

// ─── Plan Card ────────────────────────────────────────────────────────────────
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
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const isActive = item.isActive;
  const cc = CYCLE_COLOR[item.billingCycle] ?? { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
  const cl = CYCLE_LABEL[item.billingCycle] ?? item.billingCycle;

  const toggleExpand = () => {
    LayoutAnimation.configureNext({
      duration: 220,
      create: { type: "easeInEaseOut", property: "opacity" },
      update: { type: "spring", springDamping: 0.8 },
    });
    Animated.spring(rotateAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
      tension: 120,
      friction: 8,
    }).start();
    setExpanded((v) => !v);
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

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
    <View style={styles.card}>
      {/* Top accent bar */}
      <View style={[styles.accentBar, { backgroundColor: isActive ? C.brandLight : C.border }]} />

      {/* ── Collapsed row (tappable) ── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleExpand}
        style={styles.mainRow}
      >
        <View style={styles.mainLeft}>
          {/* Name + status dot */}
          <View style={styles.nameRow}>
            <View style={[styles.statusDot, { backgroundColor: isActive ? C.success : C.border }]} />
            <Text style={styles.memberName} numberOfLines={1}>
              {item.name}
            </Text>
          </View>

          {/* Price info line */}
          <View style={styles.infoLine}>
            <Feather name="tag" size={11} color={C.brandLight} />
            <Text style={styles.infoLineLabel}>Price</Text>
            <Text style={[styles.infoLineValue, { color: C.brand }]}>
              ₹{item.price.toLocaleString("en-IN")} / {cl}
            </Text>
          </View>

          {/* Duration info line */}
          <View style={styles.infoLine}>
            <Feather name="clock" size={11} color={C.textSoft} />
            <Text style={styles.infoLineLabel}>Duration</Text>
            <Text style={styles.infoLineValue}>
              {item.duration} {cl}(s)
            </Text>
          </View>
        </View>

        {/* Chevron */}
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Feather name="chevron-down" size={15} color={C.textSoft} />
        </Animated.View>
      </TouchableOpacity>

      {/* ── Quick actions row ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={onEdit}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="edit-2" size={13} color={C.brand} />
          <Text style={[styles.quickBtnLabel, { color: C.brand }]}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.quickBtn,
            { backgroundColor: isActive ? C.warnLight : C.successLight },
          ]}
          onPress={onToggle}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather
            name={isActive ? "pause-circle" : "play-circle"}
            size={13}
            color={isActive ? "#92400E" : C.success}
          />
          <Text style={[styles.quickBtnLabel, { color: isActive ? "#92400E" : C.success }]}>
            {isActive ? "Pause" : "Activate"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickBtn, { backgroundColor: C.dangerLight }]}
          onPress={confirmDelete}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="trash-2" size={13} color={C.danger} />
          <Text style={[styles.quickBtnLabel, { color: C.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* ── Expanded drawer ── */}
      {expanded && (
        <View style={styles.drawer}>
          <View style={styles.drawerDivider} />

          <View style={styles.drawerGrid}>
            <InfoCell label="Status" value={isActive ? "Active" : "Inactive"} valueColor={isActive ? C.success : C.textSoft} />
            <InfoCell label="Billing" value={`${cl.charAt(0).toUpperCase() + cl.slice(1)}ly`} />
            <InfoCell label="Amount" value={`₹${item.price.toLocaleString("en-IN")}`} valueColor={C.brand} />
            <InfoCell label="Duration" value={`${item.duration} ${cl}(s)`} />
          </View>

          {/* Billing cycle badge */}
          <View style={[styles.cycleBadge, { backgroundColor: cc.bg, borderColor: cc.border }]}>
            <Feather name="refresh-cw" size={10} color={cc.text} />
            <Text style={[styles.cycleBadgeText, { color: cc.text }]}>
              {cl.charAt(0).toUpperCase() + cl.slice(1)}ly billing
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Info Cell ────────────────────────────────────────────────────────────────
function InfoCell({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.infoCell}>
      <Text style={styles.cellLabel}>{label}</Text>
      <Text style={[styles.cellValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconWrap}>
        <Feather name="layers" size={28} color={C.brandLight} />
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

// ─── Plans Screen ─────────────────────────────────────────────────────────────
export default function PlansScreen() {
  const router = useRouter();
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
      <SafeAreaView style={styles.loadingContainer} edges={["top", "left", "right"]}>
        <ActivityIndicator size="large" color={C.brandLight} />
        <Text style={styles.loadingText}>Loading plans…</Text>
      </SafeAreaView>
    );
  }

  const activeCount = (plans ?? []).filter((p: any) => p.isActive).length;

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.push("/")} activeOpacity={0.75}>
            <Feather name="arrow-left" size={16} color={C.brand} />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Memberships</Text>
            <Text style={styles.subtitle}>
              {plans?.length
                ? `${activeCount} active · ${plans.length} total`
                : "No plans created yet"}
            </Text>
          </View>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleCreateNew} activeOpacity={0.85}>
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

      <FooterBar />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Loading
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.bg },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textSoft },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.brandXLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: C.brandLight,
    marginTop: 3,
    fontWeight: "500",
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    elevation: 2,
  },
  addBtnText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  // List
  listContent: { paddingHorizontal: 14, paddingBottom: 110, paddingTop: 4, gap: 10 },
  listContentEmpty: { flex: 1 },

  // Card
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "rgba(30, 58, 138, 0.10)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
  },
  accentBar: { height: 3, width: "100%" },

  // Collapsed row
  mainRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 13,
    paddingBottom: 10,
    gap: 10,
  },
  mainLeft: {
    flex: 1,
    gap: 6,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },

  // Info lines
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLineLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSoft,
    width: 44,
  },
  infoLineValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMid,
    flexShrink: 1,
  },

  // Quick actions
  actionsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 11,
  },
  quickBtn: {
    flex: 1,
    paddingHorizontal: 6,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    gap: 3,
    borderWidth: 1,
    borderColor: C.border,
  },
  quickBtnLabel: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // Drawer
  drawer: {
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  drawerDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },
  drawerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 12,
  },
  infoCell: {
    width: "46%",
    gap: 2,
  },
  cellLabel: {
    fontSize: 10,
    color: C.textSoft,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  cellValue: {
    fontSize: 13,
    fontWeight: "600",
    color: C.text,
    letterSpacing: -0.1,
  },
  cycleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 5,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cycleBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 60,
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: C.brandXLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: C.textSoft,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: C.brand,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2,
  },
  emptyBtnText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
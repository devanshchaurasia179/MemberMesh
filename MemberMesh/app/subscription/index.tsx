import React, { useMemo, useState } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  TextInput, RefreshControl, StyleSheet, Platform, StatusBar,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSubscriptions, useRenewSubscription, useCancelSubscription, useCreateSubscription } from "../../hooks/useSubscription";
import { useMembers } from "../../hooks/useMember";
import { usePlans } from "../../hooks/useMembership";
import SubscriptionModal from "./components/Modal";
import SubscriptionCard from "./components/Card";

const C = {
  purple: "#7B6EF6", purpleLight: "#EEEEFE", purpleMid: "#A89AF8",
  white: "#FFFFFF", offWhite: "#F7F7FD", border: "#EDEDFB",
  text: "#1A1A2E", textMid: "#6B6B8A", textLight: "#A8A8C0",
  green: "#10D4A0", greenLight: "#E6FAF6",
  red: "#FF5E7D", redLight: "#FFECF0",
  amber: "#FFB740", amberLight: "#FFF5E0",
};

type FilterType = "ALL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

const FILTERS: { key: FilterType; label: string; icon: string; color: string }[] = [
  { key: "ALL",       label: "All",       icon: "layers-outline",          color: C.purple },
  { key: "ACTIVE",    label: "Active",    icon: "checkmark-circle-outline", color: C.green  },
  { key: "EXPIRED",   label: "Expired",   icon: "time-outline",             color: C.amber  },
  { key: "CANCELLED", label: "Cancelled", icon: "close-circle-outline",     color: C.red    },
];

const safeStr = (v: any): string => (typeof v === "string" ? v : "");
const cleanPhone = (phone: any): string => safeStr(phone).replace(/\D/g, "");

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch, isRefetching } = useSubscriptions();
  const renewMutation  = useRenewSubscription();
  const cancelMutation = useCancelSubscription();
  const createMutation = useCreateSubscription();
  const { data: members } = useMembers();
  const { data: plans }   = usePlans();

  const [search,    setSearch]    = useState("");
  const [filter,    setFilter]    = useState<FilterType>("ALL");
  const [showModal, setShowModal] = useState(false);

  const filteredData = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase().trim();
    return data
      .filter((item: any) => filter === "ALL" || item.status === filter)
      .filter((item: any) => {
        if (!q) return true;
        const name  = safeStr(item.member?.name).toLowerCase();
        const phone = cleanPhone(item.member?.phone);
        const code  = safeStr(item.code).toLowerCase();
        return name.includes(q) || phone.includes(q) || code.includes(q);
      });
  }, [data, search, filter]);

  const stats = useMemo(() => {
    if (!data) return { revenue: 0, active: 0, expired: 0, cancelled: 0 };
    return data.reduce(
      (acc: any, s: any) => {
        if (s.paymentStatus === "PAID") acc.revenue += Number(s.amountPaid) || 0;
        if (s.status === "ACTIVE")    acc.active++;
        if (s.status === "EXPIRED")   acc.expired++;
        if (s.status === "CANCELLED") acc.cancelled++;
        return acc;
      },
      { revenue: 0, active: 0, expired: 0, cancelled: 0 }
    );
  }, [data]);

  const filterCounts = useMemo(() => {
    if (!data) return { ALL: 0, ACTIVE: 0, EXPIRED: 0, CANCELLED: 0 };
    return data.reduce((acc: any, s: any) => {
      acc.ALL++;
      if (s.status === "ACTIVE")    acc.ACTIVE++;
      if (s.status === "EXPIRED")   acc.EXPIRED++;
      if (s.status === "CANCELLED") acc.CANCELLED++;
      return acc;
    }, { ALL: 0, ACTIVE: 0, EXPIRED: 0, CANCELLED: 0 });
  }, [data]);

  const handleCreate = (payload: any) => {
    createMutation.mutate(payload, {
      onSuccess: () => setShowModal(false),
    });
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={C.purple} />
        <Text style={styles.loadingText}>Loading subscriptions…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={C.offWhite} />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.push("/dashboard")} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={C.purple} />
          </TouchableOpacity>
          <View>
            <Text style={styles.screenLabel}>OVERVIEW</Text>
            <Text style={styles.screenTitle}>Subscriptions</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addFab} activeOpacity={0.85}>
          <Ionicons name="add" size={22} color={C.white} />
        </TouchableOpacity>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <StatCard
          icon={<MaterialCommunityIcons name="currency-inr" size={16} color={C.purple} />}
          value={`₹${stats.revenue.toLocaleString("en-IN")}`}
          label="Revenue"
          bg={C.purpleLight}
          valueColor={C.purple}
        />
        <StatCard
          icon={<Ionicons name="people-outline" size={16} color={C.green} />}
          value={String(stats.active)}
          label="Active"
          bg={C.greenLight}
          valueColor={C.green}
        />
        <StatCard
          icon={<Ionicons name="time-outline" size={16} color={C.amber} />}
          value={String(stats.expired)}
          label="Expired"
          bg={C.amberLight}
          valueColor={C.amber}
        />
        <StatCard
          icon={<Ionicons name="close-circle-outline" size={16} color={C.red} />}
          value={String(stats.cancelled)}
          label="Cancelled"
          bg={C.redLight}
          valueColor={C.red}
        />
      </View>

      {/* SEARCH */}
      <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={C.textLight} style={{ marginRight: 8 }} />
        <TextInput
          placeholder="Search name, phone or code…"
          placeholderTextColor={C.textLight}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
          autoCapitalize="none"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={16} color={C.textLight} />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTER TABS */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          const count  = filterCounts[f.key];
          return (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[styles.filterTab, active && { backgroundColor: f.color, borderColor: f.color }]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterText, active && styles.filterTextActive]}>
                {f.label}
              </Text>
              <View style={[styles.filterBadge, active && { backgroundColor: "rgba(255,255,255,0.25)" }]}>
                <Text style={[styles.filterBadgeText, active && { color: C.white }]}>{count}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* LIST */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <SubscriptionCard
            item={item}
            onRenew={(id) => renewMutation.mutate({ id })}
            onCancel={(id) => cancelMutation.mutate(id)}
            isRenewing={renewMutation.isPending}
            isCancelling={cancelMutation.isPending}
          />
        )}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: 4 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={C.purple} />}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="receipt-outline" size={32} color={C.purple} />
            </View>
            <Text style={styles.emptyTitle}>No subscriptions found</Text>
            <Text style={styles.emptySubtitle}>
              {search ? `No results for "${search}"` : "Tap + to create your first subscription"}
            </Text>
            {!search && (
              <TouchableOpacity onPress={() => setShowModal(true)} style={styles.emptyBtn} activeOpacity={0.8}>
                <Ionicons name="add" size={14} color={C.white} />
                <Text style={styles.emptyBtnText}>New Subscription</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      <SubscriptionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        members={members || []}
        plans={plans   || []}
        onSubmit={handleCreate}
        isLoading={createMutation.isPending}
      />
    </View>
  );
}

function StatCard({ icon, value, label, bg, valueColor }: any) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      {icon}
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.offWhite,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 52,
    paddingHorizontal: 18,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: C.offWhite },
  loadingText: { marginTop: 12, fontSize: 14, color: C.textMid },

  header:     { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  backBtn: {
    width: 38, height: 38, borderRadius: 12,
    backgroundColor: C.purpleLight, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: C.border,
  },
  screenLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 2, color: C.purple, marginBottom: 2 },
  screenTitle: { fontSize: 24, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  addFab: {
    width: 46, height: 46, borderRadius: 14, backgroundColor: C.purple,
    alignItems: "center", justifyContent: "center",
    shadowColor: C.purple, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 10, elevation: 8,
  },

  statsRow:   { flexDirection: "row", gap: 8, marginBottom: 16 },
  statCard:   { flex: 1, borderRadius: 12, padding: 10, alignItems: "center", gap: 3 },
  statValue:  { fontSize: 15, fontWeight: "800", letterSpacing: -0.3 },
  statLabel:  { fontSize: 9, color: C.textMid, fontWeight: "600", letterSpacing: 0.3 },

  searchWrap: {
    flexDirection: "row", alignItems: "center", backgroundColor: C.white,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11,
    marginBottom: 12, borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: C.text },

  filterRow:        { flexDirection: "row", gap: 6, marginBottom: 14 },
  filterTab: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 5, paddingVertical: 8, borderRadius: 20,
    backgroundColor: C.white, borderWidth: 1, borderColor: C.border,
  },
  filterText:        { fontSize: 11, color: C.textMid, fontWeight: "700" },
  filterTextActive:  { color: C.white },
  filterBadge:       { backgroundColor: C.purpleLight, borderRadius: 10, paddingHorizontal: 5, paddingVertical: 1 },
  filterBadgeText:   { fontSize: 10, fontWeight: "800", color: C.purple },

  emptyWrap:    { alignItems: "center", paddingTop: 72, gap: 10 },
  emptyIcon:    { width: 72, height: 72, borderRadius: 22, backgroundColor: C.purpleLight, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  emptyTitle:   { fontSize: 17, fontWeight: "700", color: C.text },
  emptySubtitle:{ fontSize: 13, color: C.textMid, textAlign: "center", paddingHorizontal: 32 },
  emptyBtn:     { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: C.purple, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginTop: 8 },
  emptyBtnText: { color: C.white, fontWeight: "700", fontSize: 13 },
});
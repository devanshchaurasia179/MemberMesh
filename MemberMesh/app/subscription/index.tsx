import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
  TextInput,
  Animated,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useRenewSubscription,
  useCancelSubscription,
} from "../../hooks/useSubscription";
import { usePlans } from "../../hooks/useMembership";
import type { Subscription } from "../../constants/subscription.api";
import SubscriptionCard from "./components/SubscriptionCard";
import CreateSubscriptionModal from "./components/CreateSubscriptionModal";
import EditSubscriptionModal from "./components/EditSubscriptionModal";
import RenewSubscriptionModal from "./components/RenewSubscriptionModal";
import CancelConfirmationModal from "./components/CancelConfirmationModal";
import { isThermalPrinterSaved } from "../../utils/printerManager";
import {
  printRenewalReceipt,
  printSubscriptionReceipt,
} from "../../utils/thermalPrinter";
import { useAuth } from "../../providers/AuthProvider";
import FooterBar from "../components/FooterBar";

const { width } = Dimensions.get("window");

// ─── Palette ────────────────────────────────────────────────────────────────
const C = {
  bg: "#EFF6FF",
  surface: "#FFFFFF",
  brand: "#1e3a8a",
  brandLight: "#3b82f6",
  brandXLight: "#DBEAFE",
  brandDark: "#1e40af",
  accent: "#0ea5e9",
  accentLight: "#E0F2FE",
  text: "#0f172a",
  textMid: "#475569",
  textSoft: "#94a3b8",
  border: "#e2e8f0",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  success: "#10b981",
  gold: "#f59e0b",
  shadow: "rgba(30, 58, 138, 0.12)",
};

// ─── AnimatedPressable ───────────────────────────────────────────────────────
function AnimatedPressable({
  children,
  style,
  onPress,
}: {
  children: React.ReactNode;
  style?: any;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () =>
    Animated.sequence([
      Animated.spring(scale, { toValue: 0.94, useNativeDriver: true, speed: 50 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20 }),
    ]).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => {
          press();
          onPress?.();
        }}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────
type FilterStatus = "ALL" | "ACTIVE" | "EXPIRED" | "CANCELLED";

const FILTER_TABS: { key: FilterStatus; label: string; color: string; icon: React.ComponentProps<typeof Feather>["name"] }[] = [
  { key: "ALL",       label: "All",       color: C.brand,   icon: "layers"      },
  { key: "ACTIVE",    label: "Active",    color: C.success, icon: "check-circle"},
  { key: "EXPIRED",   label: "Expired",   color: C.danger,  icon: "clock"       },
  { key: "CANCELLED", label: "Cancelled", color: C.gold,    icon: "slash"       },
];

function FilterTabs({
  active,
  counts,
  onChange,
}: {
  active: FilterStatus;
  counts: Record<FilterStatus, number>;
  onChange: (f: FilterStatus) => void;
}) {
  return (
    <View style={ft.row}>
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onChange(tab.key)}
            activeOpacity={0.75}
            style={[
              ft.tab,
              isActive && { backgroundColor: tab.color + "18", borderColor: tab.color },
            ]}
          >
            {/* Row 1: icon + label */}
            <View style={ft.topRow}>
              <Feather
                name={tab.icon}
                size={13}
                color={isActive ? tab.color : C.textSoft}
              />
              <Text style={[ft.label, isActive && { color: tab.color }]}>
                {tab.label}
              </Text>
            </View>
            {/* Row 2: count */}
            <Text style={[ft.count, { color: isActive ? tab.color : C.textSoft }]}>
              {counts[tab.key]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const ft = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.surface,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: C.textSoft,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  count: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
});



// ─── Empty State ─────────────────────────────────────────────────────────────
function EmptyState({
  isSearch,
  activeFilter,
  onAdd,
}: {
  isSearch: boolean;
  activeFilter: FilterStatus;
  onAdd: () => void;
}) {
  const bounce = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -6, duration: 900, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  // Filter-specific empty states
  const getFilterEmptyState = () => {
    switch (activeFilter) {
      case "ACTIVE":
        return {
          icon: "check-circle" as const,
          color: C.success,
          title: "No active subscriptions",
          subtitle: "All subscriptions have either expired or been cancelled",
        };
      case "EXPIRED":
        return {
          icon: "clock" as const,
          color: C.danger,
          title: "No expired subscriptions",
          subtitle: "Great! All your subscriptions are either active or cancelled",
        };
      case "CANCELLED":
        return {
          icon: "slash" as const,
          color: C.gold,
          title: "No cancelled subscriptions",
          subtitle: "No subscriptions have been cancelled yet",
        };
      default:
        return {
          icon: "inbox" as const,
          color: C.brandLight,
          title: "No subscriptions yet",
          subtitle: "Create your first subscription to get started",
        };
    }
  };

  const filterState = getFilterEmptyState();
  const isFilterActive = activeFilter !== "ALL";

  return (
    <View style={empty.wrap}>
      <Animated.View 
        style={[
          empty.iconWrap, 
          { 
            transform: [{ translateY: bounce }],
            backgroundColor: isSearch ? C.brandXLight : (filterState.color + "18")
          }
        ]}
      >
        <Feather 
          name={isSearch ? "search" : filterState.icon} 
          size={26} 
          color={isSearch ? C.brandLight : filterState.color} 
        />
      </Animated.View>
      <Text style={empty.title}>
        {isSearch ? "No results found" : filterState.title}
      </Text>
      <Text style={empty.sub}>
        {isSearch
          ? "Try a different name, code or mobile number"
          : filterState.subtitle}
      </Text>
      {!isSearch && !isFilterActive && (
        <AnimatedPressable onPress={onAdd}>
          <View style={empty.btn}>
            <Feather name="plus" size={13} color="#fff" />
            <Text style={empty.btnText}>New Subscription</Text>
          </View>
        </AnimatedPressable>
      )}
    </View>
  );
}

const empty = StyleSheet.create({
  wrap: { marginTop: 48, alignItems: "center", paddingHorizontal: 40 },
  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: C.brandXLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: { fontSize: 16, fontWeight: "700", color: C.text, marginBottom: 5 },
  sub: {
    fontSize: 13,
    color: C.textSoft,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: C.brand,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: plans } = usePlans();
  const { mutate: createSubscription } = useCreateSubscription();
  const { mutate: updateSubscription } = useUpdateSubscription();
  const { mutate: renewSubscription } = useRenewSubscription();
  const { mutate: cancelSubscription, isPending: isCancelling } =
    useCancelSubscription();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] =
    useState<Subscription | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>("ALL");

  const searchAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkPrinterStatus();
  }, []);

  useEffect(() => {
    Animated.spring(searchAnim, {
      toValue: searchVisible ? 1 : 0,
      useNativeDriver: true,
      tension: 80,
      friction: 10,
    }).start();
  }, [searchVisible]);

  const filteredSubscriptions = useMemo(() => {
    const list = (subscriptions as Subscription[]) ?? [];
    const byStatus = activeFilter === "ALL" ? list : list.filter((s) => s.status === activeFilter);
    if (!searchQuery.trim()) return byStatus;
    const q = searchQuery.trim().toLowerCase();
    return byStatus.filter((sub) => {
      const name = sub.memberSnapshot?.name?.toLowerCase() ?? "";
      const mobile = sub.memberSnapshot?.mobile?.toLowerCase() ?? "";
      const code = sub.code?.toLowerCase() ?? "";
      return name.includes(q) || mobile.includes(q) || code.includes(q);
    });
  }, [subscriptions, searchQuery, activeFilter]);

  const filterCounts = useMemo(() => {
    const list = (subscriptions as Subscription[]) ?? [];
    return {
      ALL:       list.length,
      ACTIVE:    list.filter((s) => s.status === "ACTIVE").length,
      EXPIRED:   list.filter((s) => s.status === "EXPIRED").length,
      CANCELLED: list.filter((s) => s.status === "CANCELLED").length,
    } as Record<FilterStatus, number>;
  }, [subscriptions]);

  const checkPrinterStatus = async () => {
    try {
      const hasSaved = await isThermalPrinterSaved();
      setIsPrinterConnected(hasSaved);
    } catch {
      setIsPrinterConnected(false);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setEditModalVisible(true);
  };

  const handleRenew = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setRenewModalVisible(true);
  };

  const businessInfo = {
    businessName: user?.businessName || "",
    ownerName: user?.ownerName || "",
    mobileNumber: user?.mobileNumber || "",
  };

  const handlePrintRenewal = async (subscription: Subscription) => {
    if (!isPrinterConnected) {
      Alert.alert("Printer Not Connected", "Would you like to set up a printer?", [
        { text: "Cancel", style: "cancel" },
        { text: "Setup Printer", onPress: () => router.push("/printer") },
      ]);
      return;
    }
    try {
      await printRenewalReceipt(subscription, businessInfo);
    } catch (error: any) {
      Alert.alert("Print Failed", error?.message || "Could not print receipt");
    }
  };

  const handlePrintSubscription = async (subscription: Subscription) => {
    if (!isPrinterConnected) {
      Alert.alert("Printer Not Connected", "Would you like to set up a printer?", [
        { text: "Cancel", style: "cancel" },
        { text: "Setup Printer", onPress: () => router.push("/printer") },
      ]);
      return;
    }
    try {
      await printSubscriptionReceipt(subscription, businessInfo);
    } catch (error: any) {
      Alert.alert("Print Failed", error?.message || "Could not print receipt");
    }
  };

  const handleCancel = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    if (!selectedSubscription) return;
    cancelSubscription(selectedSubscription._id, {
      onSuccess: () => {
        setCancelModalVisible(false);
        setSelectedSubscription(null);
        Alert.alert("Success", "Subscription cancelled successfully");
      },
      onError: (error: any) => {
        setCancelModalVisible(false);
        Alert.alert(
          "Error",
          error?.response?.data?.message ||
            "Failed to cancel subscription. Please try again."
        );
      },
    });
  };

  const renderItem = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      item={item}
      onEdit={handleEdit}
      onRenew={handleRenew}
      onCancel={handleCancel}
      isCancelling={isCancelling}
    />
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={s.loadingWrap}>
        <View style={s.loadingCard}>
          <ActivityIndicator size="large" color="#1e3a8a" />
          <Text style={s.loadingText}>Loading subscriptions…</Text>
        </View>
      </View>
    );
  }

  const allSubs = (subscriptions as Subscription[]) ?? [];

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── Header ── */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <AnimatedPressable onPress={() => router.push("/")}>
            <View style={s.backBtn}>
              <Feather name="arrow-left" size={16} color={C.brand} />
            </View>
          </AnimatedPressable>
          <View>
            <Text style={s.title}>Subscriptions</Text>
            <Text style={s.subtitle}>
              {allSubs.length} Subscription{allSubs.length !== 1 ? "s" : ""}
            </Text>
          </View>
        </View>

        <View style={s.headerActions}>
          <AnimatedPressable
            onPress={() => {
              setSearchVisible((v) => !v);
              if (searchVisible) setSearchQuery("");
            }}
          >
            <View style={[s.iconBtn, searchVisible && s.iconBtnActive]}>
              <Feather
                name={searchVisible ? "x" : "search"}
                size={15}
                color={searchVisible ? C.brand : C.textMid}
              />
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={() => router.push("/printer")}>
            <View style={s.iconBtn}>
              <Feather name="printer" size={15} color={C.textMid} />
              {isPrinterConnected && <View style={s.printerDot} />}
            </View>
          </AnimatedPressable>

          <AnimatedPressable onPress={() => setCreateModalVisible(true)}>
            <View style={s.addBtn}>
              <Feather name="plus" size={15} color="#fff" />
              <Text style={s.addBtnText}>New</Text>
            </View>
          </AnimatedPressable>
        </View>
      </View>

      {/* ── Search bar ── */}
      {searchVisible && (
        <Animated.View
          style={[
            s.searchWrap,
            {
              opacity: searchAnim,
              transform: [
                {
                  translateY: searchAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-6, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={s.searchInner}>
            <Feather name="search" size={14} color={C.textSoft} />
            <TextInput
              style={s.searchInput}
              placeholder="Search by name, code or mobile…"
              placeholderTextColor={C.textSoft}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <View style={s.clearBtn}>
                  <Feather name="x" size={10} color={C.textSoft} />
                </View>
              </TouchableOpacity>
            )}
          </View>
          {searchQuery.length > 0 && (
            <Text style={s.searchCount}>
              {filteredSubscriptions.length} result
              {filteredSubscriptions.length !== 1 ? "s" : ""}
            </Text>
          )}
        </Animated.View>
      )}

      {/* ── Filter Tabs ── */}
      {allSubs.length > 0 && (
        <FilterTabs
          active={activeFilter}
          counts={filterCounts}
          onChange={(f) => setActiveFilter(f)}
        />
      )}

      {/* ── List ── */}
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={[
          s.listContent,
          filteredSubscriptions.length === 0 && s.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            isSearch={!!searchQuery}
            activeFilter={activeFilter}
            onAdd={() => setCreateModalVisible(true)}
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* ── Modals ── */}
      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={(data) => {
          createSubscription(data, {
            onSuccess: (newSubscription) => {
              setCreateModalVisible(false);
              Alert.alert("Subscription Created 🎉", "Member has been subscribed.", [
                { text: "Done" },
                {
                  text: "Print Receipt",
                  onPress: () => {
                    // Enrich with plan name since create response may not populate plan
                    const selectedPlan = (plans || []).find(
                      (p: any) => p._id === (newSubscription as any)?.plan ||
                                  p._id === (newSubscription as any)?.plan?._id
                    );
                    const enriched = {
                      ...(newSubscription as any),
                      planName: selectedPlan?.name || (newSubscription as any)?.plan?.name,
                    };
                    handlePrintSubscription(enriched as Subscription);
                  },
                },
              ]);
            },
            onError: (error: any) => {
              Alert.alert(
                "Couldn't Create",
                error?.response?.data?.message || "Failed to create subscription"
              );
            },
          });
        }}
        plans={plans || []}
      />

      <EditSubscriptionModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSubscription(null);
        }}
        onSubmit={(data) => {
          if (selectedSubscription) {
            updateSubscription(
              { id: selectedSubscription._id, payload: data },
              {
                onSuccess: () => {
                  setEditModalVisible(false);
                  setSelectedSubscription(null);
                  Alert.alert("Updated!", "Subscription details saved.");
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Update Failed",
                    error?.response?.data?.message ||
                      "Failed to update subscription"
                  );
                },
              }
            );
          }
        }}
        subscription={selectedSubscription}
      />

      <RenewSubscriptionModal
        visible={renewModalVisible}
        onClose={() => {
          setRenewModalVisible(false);
          setSelectedSubscription(null);
        }}
        onSubmit={(data) => {
          if (selectedSubscription) {
            renewSubscription(
              { id: selectedSubscription._id, payload: data },
              {
                onSuccess: (renewedSubscription) => {
                  setRenewModalVisible(false);
                  const subToUse = renewedSubscription || selectedSubscription;
                  setSelectedSubscription(null);
                  Alert.alert("Renewed! ✨", "Subscription has been extended.", [
                    { text: "Done" },
                    {
                      text: "Print Receipt",
                      onPress: () =>
                        handlePrintRenewal(subToUse as Subscription),
                    },
                  ]);
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Renewal Failed",
                    error?.response?.data?.message ||
                      "Failed to renew subscription"
                  );
                },
              }
            );
          }
        }}
        subscription={selectedSubscription}
      />

      <CancelConfirmationModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setSelectedSubscription(null);
        }}
        onConfirm={confirmCancel}
        subscription={selectedSubscription}
        isLoading={isCancelling}
      />

      <FooterBar />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  // ── Loading ──────────────────────────────────────────────────────────────
  loadingWrap: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingCard: {
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 36,
    alignItems: "center",
    gap: 12,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  loadingText: {
    fontSize: 13,
    color: C.textSoft,
    fontWeight: "500",
  },

  // ── Header ───────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
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
    fontSize: 19,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    color: C.textSoft,
    marginTop: 1,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBtnActive: {
    backgroundColor: C.brandXLight,
    borderColor: C.brandLight,
  },
  printerDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.success,
    borderWidth: 1.5,
    borderColor: C.surface,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.brand,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 11,
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  addBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    letterSpacing: 0.1,
  },

  // ── Search ────────────────────────────────────────────────────────────────
  searchWrap: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  searchInner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: C.brandLight,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: C.text,
    paddingVertical: 0,
    fontWeight: "500",
  },
  clearBtn: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  searchCount: {
    fontSize: 11,
    color: C.textSoft,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: "500",
  },

  // ── List ──────────────────────────────────────────────────────────────────
  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 110,
    paddingTop: 2,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
});
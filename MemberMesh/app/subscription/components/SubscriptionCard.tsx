import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform,
  Animated,
  LayoutAnimation,
  UIManager,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Subscription } from "../../../constants/subscription.api";
import { useSubscriptionHistory } from "../../../hooks/useSubscription";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Palette ─────────────────────────────────────────────────────────────────
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
  warning: "#f59e0b",
  warningLight: "#fef3c7",
  shadow: "rgba(30, 58, 138, 0.10)",
  ribbon: "#1e3a8a",
  ribbonText: "#ffffff",
  historyLine: "#e2e8f0",
};

type DrawerTab = "details" | "history";

interface SubscriptionCardProps {
  item: Subscription;
  onEdit: (sub: Subscription) => void;
  onRenew: (sub: Subscription) => void;
  onCancel: (sub: Subscription) => void;
  isCancelling: boolean;
}

export default function SubscriptionCard({
  item,
  onEdit,
  onRenew,
  onCancel,
  isCancelling,
}: SubscriptionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<DrawerTab>("details");
  const rotateAnim = useRef(new Animated.Value(0)).current;

  // Only fetch when the drawer is open and history tab is active
  const historyEnabled = expanded && activeTab === "history";
  const { data: history, isLoading: historyLoading } = useSubscriptionHistory(
    historyEnabled ? item._id : ""
  );

  if (!item || !item.memberSnapshot || !item.plan) return null;

  const isActive = item.status === "ACTIVE";
  const statusColors = getStatusColor(item.status);
  const mobile = item.memberSnapshot.mobile;

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
    // Reset to details tab when collapsing
    if (expanded) setActiveTab("details");
  };

  const chevronRotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const handleCall = () => {
    if (!mobile) return Alert.alert("Error", "No mobile number available");
    const phoneUrl = `tel:${mobile}`;
    Linking.canOpenURL(phoneUrl)
      .then((ok) => (ok ? Linking.openURL(phoneUrl) : Alert.alert("Error", "Phone call not supported")))
      .catch(() => Alert.alert("Error", "Failed to initiate call"));
  };

  const handleWhatsApp = () => {
    if (!mobile) return Alert.alert("Error", "No mobile number available");
    let clean = mobile.replace(/\D/g, "");
    if (!clean.startsWith("91") && clean.length === 10) clean = "91" + clean;
    const msg = `Hi ${item.memberSnapshot.name}, this is regarding your ${item.plan.name} subscription.`;
    const url = `whatsapp://send?phone=${clean}&text=${encodeURIComponent(msg)}`;
    Linking.canOpenURL(url)
      .then((ok) => (ok ? Linking.openURL(url) : Alert.alert("Error", "WhatsApp is not installed")))
      .catch(() => Alert.alert("Error", "Failed to open WhatsApp"));
  };

  const daysLeft = item.expiryDate
    ? Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
    : null;

  const isExpiryWarn = daysLeft !== null && daysLeft <= 7 && isActive;

  return (
    <View style={styles.card}>
      {/* ── Half-ribbon code badge (right side) ── */}
      {item.code ? (
        <View style={styles.ribbon}>
          <View style={styles.ribbonNotch} />
          <Text style={styles.ribbonText}>{item.code}</Text>
        </View>
      ) : null}

      {/* ── Collapsed row ── */}
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={toggleExpand}
        style={styles.mainRow}
      >
        {/* Left: stacked info lines */}
        <View style={styles.mainLeft}>
          {/* Line 1: Member name + status dot */}
          <View style={styles.nameRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColors.dot }]} />
            <Text style={styles.memberName} numberOfLines={1}>
              {item.memberSnapshot.name || "Unknown Member"}
            </Text>
          </View>

          {/* Line 2: Plan */}
          <View style={styles.infoLine}>
            <Feather name="tag" size={11} color={C.brandLight} />
            <Text style={styles.infoLineLabel}>Plan</Text>
            <Text style={styles.infoLineValue}>{item.plan.name}</Text>
          </View>

          {/* Line 3: Expiry */}
          <View style={styles.infoLine}>
            <Feather
              name="calendar"
              size={11}
              color={isExpiryWarn ? C.danger : C.textSoft}
            />
            <Text style={styles.infoLineLabel}>Expiry</Text>
            <Text
              style={[
                styles.infoLineValue,
                isExpiryWarn ? { color: C.danger, fontWeight: "700" } : {},
              ]}
            >
              {item.expiryDate ? formatDate(item.expiryDate) : "Lifetime"}
              {isExpiryWarn && daysLeft !== null
                ? `  (${daysLeft}d left)`
                : ""}
            </Text>
          </View>
        </View>

        {/* Right: chevron */}
        <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
          <Feather name="chevron-down" size={15} color={C.textSoft} />
        </Animated.View>
      </TouchableOpacity>

      {/* ── Quick actions row ── */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.quickBtn}
          onPress={() => onRenew(item)}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="refresh-cw" size={13} color="#f59e0b" />
          <Text style={[styles.quickBtnLabel, { color: "#f59e0b" }]}>Renew</Text>
        </TouchableOpacity>
        {mobile ? (
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={handleCall}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="phone" size={13} color={C.brand} />
            <Text style={[styles.quickBtnLabel, { color: C.brand }]}>Call</Text>
          </TouchableOpacity>
        ) : null}
        {mobile ? (
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={handleWhatsApp}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Feather name="message-circle" size={13} color="#25D366" />
            <Text style={[styles.quickBtnLabel, { color: "#25D366" }]}>WhatsApp</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* ── Expanded drawer ── */}
      {expanded && (
        <View style={styles.drawer}>
          <View style={styles.drawerDivider} />

          {/* ── Tab switcher ── */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "details" && styles.tabActive]}
              onPress={() => setActiveTab("details")}
            >
              <Feather
                name="info"
                size={12}
                color={activeTab === "details" ? C.brand : C.textSoft}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "details" ? styles.tabLabelActive : {},
                ]}
              >
                Details
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === "history" && styles.tabActive]}
              onPress={() => setActiveTab("history")}
            >
              <Feather
                name="clock"
                size={12}
                color={activeTab === "history" ? C.brand : C.textSoft}
              />
              <Text
                style={[
                  styles.tabLabel,
                  activeTab === "history" ? styles.tabLabelActive : {},
                ]}
              >
                History
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Details tab ── */}
          {activeTab === "details" && (
            <>
              <View style={styles.drawerGrid}>
                <InfoCell label="Status" value={item.status} valueColor={statusColors.text} />
                <InfoCell label="Amount Paid" value={`₹${item.amountPaid || 0}`} />
                <InfoCell label="Start Date" value={formatDate(item.startDate)} />
                <InfoCell label="Expiry Date" value={formatDate(item.expiryDate)} />
                {mobile && <InfoCell label="Mobile" value={mobile} />}
                {daysLeft !== null && isActive && (
                  <InfoCell
                    label="Days Left"
                    value={daysLeft > 0 ? `${daysLeft}d` : "Expired"}
                    valueColor={daysLeft <= 7 ? C.danger : C.success}
                  />
                )}
              </View>

              <View style={styles.drawerDivider} />

              {/* Drawer actions */}
              <View style={styles.drawerActions}>
                <TouchableOpacity
                  style={[styles.drawerBtn, styles.editBtnStyle]}
                  onPress={() => onEdit(item)}
                  disabled={isCancelling}
                >
                  <Feather name="edit-2" size={12} color={C.brand} />
                  <Text style={[styles.drawerBtnText, { color: C.brand }]}>Edit</Text>
                </TouchableOpacity>

                {isActive && (
                  <TouchableOpacity
                    style={[
                      styles.drawerBtn,
                      styles.cancelBtnStyle,
                      isCancelling && { opacity: 0.5 },
                    ]}
                    onPress={() => onCancel(item)}
                    disabled={isCancelling}
                  >
                    <Feather name="x-circle" size={12} color={C.danger} />
                    <Text style={[styles.drawerBtnText, { color: C.danger }]}>
                      {isCancelling ? "Cancelling…" : "Cancel"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}

          {/* ── History tab ── */}
          {activeTab === "history" && (
            <HistoryPanel loading={historyLoading} history={history ?? []} />
          )}
        </View>
      )}
    </View>
  );
}

// ─── History Panel ───────────────────────────────────────────────────────────
import type { SubscriptionHistoryEntry } from "../../../constants/subscription.api";

function HistoryPanel({
  loading,
  history,
}: {
  loading: boolean;
  history: SubscriptionHistoryEntry[];
}) {
  if (loading) {
    return (
      <View style={styles.historyLoading}>
        <ActivityIndicator size="small" color={C.brand} />
        <Text style={styles.historyLoadingText}>Loading history…</Text>
      </View>
    );
  }

  if (history.length === 0) {
    return (
      <View style={styles.historyEmpty}>
        <Feather name="clock" size={20} color={C.textSoft} />
        <Text style={styles.historyEmptyText}>No history yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.timeline}>
      {history.map((entry, index) => {
        const eventMeta = getEventMeta(entry.event);
        const isLast = index === history.length - 1;

        return (
          <View key={entry._id} style={styles.timelineRow}>
            {/* ── Connector line + dot ── */}
            <View style={styles.timelineLeft}>
              <View
                style={[styles.timelineDot, { backgroundColor: eventMeta.dotColor }]}
              />
              {!isLast && <View style={styles.timelineConnector} />}
            </View>

            {/* ── Event card ── */}
            <View
              style={[
                styles.timelineCard,
                { borderLeftColor: eventMeta.dotColor },
                isLast && { marginBottom: 4 },
              ]}
            >
              {/* Header row */}
              <View style={styles.timelineCardHeader}>
                <View
                  style={[
                    styles.eventBadge,
                    { backgroundColor: eventMeta.badgeBg },
                  ]}
                >
                  <Feather name={eventMeta.icon as any} size={10} color={eventMeta.dotColor} />
                  <Text style={[styles.eventBadgeText, { color: eventMeta.dotColor }]}>
                    {entry.event}
                  </Text>
                </View>
                <Text style={styles.timelineDate}>
                  {formatDateTime(entry.createdAt)}
                </Text>
              </View>

              {/* Details grid */}
              <View style={styles.timelineDetails}>
                {entry.amountPaid > 0 && (
                  <TimelineDetail
                    icon="dollar-sign"
                    label="Amount"
                    value={`₹${entry.amountPaid}`}
                  />
                )}
                {entry.startDate && (
                  <TimelineDetail
                    icon="play"
                    label="Start"
                    value={formatDate(entry.startDate)}
                  />
                )}
                {entry.expiryDate ? (
                  <TimelineDetail
                    icon="calendar"
                    label="Expiry"
                    value={formatDate(entry.expiryDate)}
                  />
                ) : entry.event === "CANCEL" ? (
                  <TimelineDetail
                    icon="x"
                    label="Expiry"
                    value="Cancelled"
                    valueColor={C.danger}
                  />
                ) : null}
                {entry.durationUsed && entry.billingCycleUsed ? (
                  <TimelineDetail
                    icon="clock"
                    label="Duration"
                    value={`${entry.durationUsed} ${entry.billingCycleUsed}`}
                  />
                ) : null}
              </View>

              {/* Optional note */}
              {entry.note ? (
                <Text style={styles.timelineNote}>{entry.note}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ─── Timeline detail row ─────────────────────────────────────────────────────
function TimelineDetail({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.timelineDetailRow}>
      <Feather name={icon as any} size={9} color={C.textSoft} />
      <Text style={styles.timelineDetailLabel}>{label}</Text>
      <Text style={[styles.timelineDetailValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

// ─── Info Cell ───────────────────────────────────────────────────────────────
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE":    return { dot: C.success, text: C.success,  bg: C.successLight };
    case "EXPIRED":   return { dot: C.danger,  text: C.danger,   bg: C.dangerLight  };
    case "CANCELLED": return { dot: C.textSoft,text: C.textSoft, bg: "#F3F4F6"      };
    default:          return { dot: C.textSoft,text: C.textSoft, bg: "#F3F4F6"      };
  }
}

function getEventMeta(event: string) {
  switch (event) {
    case "CREATE":
      return {
        icon: "plus-circle",
        dotColor: C.success,
        badgeBg: C.successLight,
      };
    case "RENEW":
      return {
        icon: "refresh-cw",
        dotColor: C.warning,
        badgeBg: C.warningLight,
      };
    case "CANCEL":
      return {
        icon: "x-circle",
        dotColor: C.danger,
        badgeBg: C.dangerLight,
      };
    case "EXPIRE":
      return {
        icon: "clock",
        dotColor: C.textSoft,
        badgeBg: "#F3F4F6",
      };
    default:
      return {
        icon: "activity",
        dotColor: C.textSoft,
        badgeBg: "#F3F4F6",
      };
  }
}

function formatDate(date: string | null | undefined) {
  if (!date) return "Lifetime";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

function formatDateTime(date: string) {
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },

  // ── Half-ribbon ────────────────────────────────────────────────────────────
  ribbon: {
    position: "absolute",
    top: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10,
  },
  ribbonNotch: {
    width: 0,
    height: 0,
    borderTopWidth: 22,
    borderTopColor: C.ribbon,
    borderLeftWidth: 10,
    borderLeftColor: "transparent",
  },
  ribbonText: {
    backgroundColor: C.ribbon,
    color: C.ribbonText,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    lineHeight: 14,
  },

  // ── Collapsed row ─────────────────────────────────────────────────────────
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
    paddingRight: 56,
  },
  memberName: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
    flexShrink: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },

  // ── Info lines ────────────────────────────────────────────────────────────
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  infoLineLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSoft,
    width: 38,
  },
  infoLineValue: {
    fontSize: 12,
    fontWeight: "600",
    color: C.textMid,
    flexShrink: 1,
  },

  // ── Quick actions ─────────────────────────────────────────────────────────
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

  // ── Drawer ────────────────────────────────────────────────────────────────
  drawer: {
    paddingHorizontal: 14,
    paddingBottom: 12,
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
  drawerActions: {
    flexDirection: "row",
    gap: 8,
  },
  drawerBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 8,
    borderRadius: 9,
  },
  editBtnStyle: {
    backgroundColor: C.brandXLight,
  },
  cancelBtnStyle: {
    backgroundColor: C.dangerLight,
  },
  drawerBtnText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.1,
  },

  // ── Tab row ───────────────────────────────────────────────────────────────
  tabRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },
  tabActive: {
    backgroundColor: C.brandXLight,
    borderColor: C.brandLight,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textSoft,
  },
  tabLabelActive: {
    color: C.brand,
  },

  // ── History / Timeline ────────────────────────────────────────────────────
  historyLoading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
  },
  historyLoadingText: {
    fontSize: 12,
    color: C.textSoft,
  },
  historyEmpty: {
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 20,
  },
  historyEmptyText: {
    fontSize: 12,
    color: C.textSoft,
    fontWeight: "500",
  },
  timeline: {
    paddingBottom: 4,
  },
  timelineRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: "center",
    width: 12,
    paddingTop: 3,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: C.historyLine,
    marginTop: 3,
    marginBottom: 0,
    minHeight: 16,
  },
  timelineCard: {
    flex: 1,
    backgroundColor: "#FAFBFC",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border,
    borderLeftWidth: 3,
    padding: 10,
    marginBottom: 10,
    gap: 6,
  },
  timelineCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  eventBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  eventBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
  timelineDate: {
    fontSize: 10,
    color: C.textSoft,
    fontWeight: "500",
  },
  timelineDetails: {
    gap: 3,
  },
  timelineDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  timelineDetailLabel: {
    fontSize: 10,
    color: C.textSoft,
    fontWeight: "600",
    width: 44,
  },
  timelineDetailValue: {
    fontSize: 11,
    fontWeight: "600",
    color: C.textMid,
    flexShrink: 1,
  },
  timelineNote: {
    fontSize: 10,
    color: C.textSoft,
    fontStyle: "italic",
    marginTop: 2,
  },
});

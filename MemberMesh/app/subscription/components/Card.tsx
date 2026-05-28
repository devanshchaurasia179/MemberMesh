import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, Linking, Alert, StyleSheet, Animated,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

const C = {
  purple: "#7B6EF6", purpleLight: "#EEEEFE", purpleMid: "#A89AF8",
  white: "#FFFFFF", offWhite: "#F7F7FD", border: "#EDEDFB",
  text: "#1A1A2E", textMid: "#6B6B8A", textLight: "#A8A8C0",
  green: "#10D4A0", greenLight: "#E6FAF6",
  red: "#FF5E7D", redLight: "#FFECF0",
  amber: "#FFB740", amberLight: "#FFF5E0",
  waGreen: "#25D366", waLight: "#E8FAF0",
  callBlue: "#3B82F6", callLight: "#EFF6FF",
};

const safeStr    = (v: any): string => (typeof v === "string" ? v : "");
const cleanPhone = (p: any): string => safeStr(p).replace(/\D/g, "");
const isValidPhone = (p: any): boolean => cleanPhone(p).length === 10;

const STATUS_CONFIG: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  ACTIVE:    { bg: C.greenLight, text: C.green, icon: "checkmark-circle", label: "Active"    },
  EXPIRED:   { bg: C.amberLight, text: C.amber, icon: "time",             label: "Expired"   },
  CANCELLED: { bg: C.redLight,   text: C.red,   icon: "close-circle",     label: "Cancelled" },
};

const daysUntilExpiry = (expiryDate: string | null): number | null => {
  if (!expiryDate) return null;
  const diff = new Date(expiryDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

interface Props {
  item: any;
  onRenew:      (id: string) => void;
  onCancel:     (id: string) => void;
  isRenewing?:  boolean;
  isCancelling?: boolean;
}

export default function SubscriptionCard({ item, onRenew, onCancel, isRenewing, isCancelling }: Props) {
  const sc         = STATUS_CONFIG[item.status] ?? STATUS_CONFIG.CANCELLED;
  const memberName = safeStr(item.member?.name) || "Unknown Member";
  const phone      = item.member?.phone;
  const planName   = safeStr(item.plan?.name) || "Unknown Plan";
  const hasPhone   = isValidPhone(phone);
  const days       = daysUntilExpiry(item.expiryDate);
  const isExpiringSoon = days !== null && days >= 0 && days <= 7 && item.status === "ACTIVE";

  const initials = memberName
    .split(" ").map((w: string) => w[0] ?? "").join("")
    .toUpperCase().slice(0, 2) || "?";

  const expiryLabel = item.expiryDate
    ? new Date(item.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })
    : "Lifetime";

  const buildWAMessage = () => {
    const expiry = item.expiryDate
      ? new Date(item.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })
      : "Lifetime";
    return encodeURIComponent(
      `Hi ${memberName}! 👋\n\nYour *${planName}* subscription is active until *${expiry}*.\n\nFor any queries, feel free to reach out. Thank you! 🙏`
    );
  };

  const confirmRenew = () => Alert.alert(
    "Renew subscription",
    `Extend ${memberName}'s ${planName} from the current expiry date?`,
    [{ text: "Cancel", style: "cancel" }, { text: "Renew", onPress: () => onRenew(item._id) }]
  );

  const confirmCancel = () => Alert.alert(
    "Cancel subscription",
    `Cancel ${memberName}'s ${planName}? This cannot be undone.`,
    [{ text: "Go back", style: "cancel" }, { text: "Cancel it", style: "destructive", onPress: () => onCancel(item._id) }]
  );

  const handleCall = () => {
    const url = `tel:+91${cleanPhone(phone)}`;
    Linking.canOpenURL(url).then((ok) => ok ? Linking.openURL(url) : Alert.alert("Error", "Cannot open dialer"));
  };

  const handleWhatsApp = () => {
    const url = `https://wa.me/91${cleanPhone(phone)}?text=${buildWAMessage()}`;
    Linking.canOpenURL(url).then((ok) => ok ? Linking.openURL(url) : Alert.alert("WhatsApp not found", "Please install WhatsApp."));
  };

  return (
    <View style={[styles.card, isExpiringSoon && styles.cardExpiringSoon]}>

      {/* Expiry warning banner */}
      {isExpiringSoon && (
        <View style={styles.expiryBanner}>
          <Ionicons name="warning-outline" size={12} color={C.amber} />
          <Text style={styles.expiryBannerText}>
            Expires in {days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"}`}
          </Text>
        </View>
      )}

      {/* Top row */}
      <View style={styles.topRow}>
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.memberName} numberOfLines={1}>{memberName}</Text>
          <View style={styles.planRow}>
            <Ionicons name="star" size={11} color={C.amber} />
            <Text style={styles.planName} numberOfLines={1}>{planName}</Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end", gap: 5 }}>
          <View style={[styles.statusPill, { backgroundColor: sc.bg }]}>
            <Ionicons name={sc.icon} size={11} color={sc.text} />
            <Text style={[styles.statusText, { color: sc.text }]}>{sc.label}</Text>
          </View>
          {item.code ? (
            <View style={styles.codeBadge}>
              <Text style={styles.codeText}>{item.code}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Meta row */}
      <View style={styles.metaRow}>
        <MetaItem icon="cash-outline"    label="Paid"    value={`₹${(item.amountPaid || 0).toLocaleString("en-IN")}`} />
        <View style={styles.metaSep} />
        <MetaItem
          icon="calendar-outline"
          label="Expires"
          value={expiryLabel}
          valueColor={item.status === "EXPIRED" ? C.red : isExpiringSoon ? C.amber : undefined}
          iconColor={item.status === "EXPIRED" ? C.red : isExpiringSoon ? C.amber : undefined}
        />
        <View style={styles.metaSep} />
        <MetaItem
          icon={item.paymentStatus === "PAID" ? "checkmark-circle-outline" : "time-outline"}
          label="Payment"
          value={item.paymentStatus ?? "—"}
          valueColor={item.paymentStatus === "PAID" ? C.green : C.amber}
          iconColor={item.paymentStatus === "PAID" ? C.green : C.amber}
        />
      </View>

      {/* Communication */}
      {hasPhone && (
        <View style={styles.commRow}>
          <TouchableOpacity onPress={handleCall} style={styles.callBtn} activeOpacity={0.8}>
            <Ionicons name="call-outline" size={13} color={C.callBlue} />
            <Text style={styles.callBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWhatsApp} style={styles.waBtn} activeOpacity={0.8}>
            <Ionicons name="logo-whatsapp" size={13} color={C.waGreen} />
            <Text style={styles.waBtnText}>WhatsApp</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Actions */}
      {item.status !== "CANCELLED" && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            onPress={confirmRenew}
            style={[styles.renewBtn, isRenewing && styles.btnDisabled]}
            activeOpacity={0.8}
            disabled={isRenewing}
          >
            <Feather name="refresh-cw" size={13} color={C.white} />
            <Text style={styles.renewBtnText}>Renew</Text>
          </TouchableOpacity>

          {item.status === "ACTIVE" && (
            <TouchableOpacity
              onPress={confirmCancel}
              style={[styles.cancelSubBtn, isCancelling && styles.btnDisabled]}
              activeOpacity={0.8}
              disabled={isCancelling}
            >
              <Feather name="x" size={13} color={C.red} />
              <Text style={styles.cancelSubBtnText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

function MetaItem({ icon, label, value, valueColor, iconColor }: {
  icon: any; label: string; value: string; valueColor?: string; iconColor?: string;
}) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={iconColor ?? C.purple} />
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={[styles.metaValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.white, borderRadius: 18, padding: 16, marginBottom: 10,
    borderWidth: 1, borderColor: C.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  cardExpiringSoon: { borderColor: C.amber, borderWidth: 1.5 },

  expiryBanner: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: C.amberLight, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5,
    marginBottom: 10,
  },
  expiryBannerText: { fontSize: 11, color: C.amber, fontWeight: "700" },

  topRow:    { flexDirection: "row", alignItems: "center" },
  avatarWrap:{ width: 44, height: 44, borderRadius: 13, backgroundColor: C.purpleLight, alignItems: "center", justifyContent: "center" },
  avatarText:{ fontSize: 15, fontWeight: "800", color: C.purple, letterSpacing: -0.5 },
  memberName:{ fontSize: 15, fontWeight: "700", color: C.text, letterSpacing: -0.3 },
  planRow:   { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  planName:  { fontSize: 12, color: C.textMid, fontWeight: "500" },

  statusPill:{ flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  statusText:{ fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  codeBadge: { backgroundColor: C.purpleLight, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: C.border },
  codeText:  { fontSize: 9, fontWeight: "800", color: C.purple, letterSpacing: 0.5 },

  divider:  { height: 1, backgroundColor: C.border, marginVertical: 12 },
  metaRow:  { flexDirection: "row", alignItems: "center" },
  metaItem: { flex: 1, alignItems: "center", gap: 2 },
  metaLabel:{ fontSize: 9, color: C.textLight, fontWeight: "600", letterSpacing: 0.5 },
  metaValue:{ fontSize: 12, color: C.text, fontWeight: "700" },
  metaSep:  { width: 1, height: 28, backgroundColor: C.border },

  commRow:{ flexDirection: "row", gap: 8, marginTop: 12 },
  callBtn:{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: C.callLight, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#BFDBFE" },
  callBtnText:{ color: C.callBlue, fontWeight: "700", fontSize: 12 },
  waBtn:{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, backgroundColor: C.waLight, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "#BBF7D0" },
  waBtnText:{ color: C.waGreen, fontWeight: "700", fontSize: 12 },

  actionRow: { flexDirection: "row", gap: 8, marginTop: 10 },
  renewBtn:  { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.purple, paddingVertical: 10, borderRadius: 12 },
  renewBtnText: { color: C.white, fontWeight: "700", fontSize: 13 },
  cancelSubBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.redLight, paddingVertical: 10, borderRadius: 12 },
  cancelSubBtnText: { color: C.red, fontWeight: "700", fontSize: 13 },
  btnDisabled: { opacity: 0.5 },
});
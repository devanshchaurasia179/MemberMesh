import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OverviewCardProps {
  activePlans: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  onPlansPress?: () => void;
  onActiveSubsPress?: () => void;
  onExpiredSubsPress?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function OverviewCard({
  activePlans,
  activeSubscriptions,
  expiredSubscriptions,
  onPlansPress,
  onActiveSubsPress,
  onExpiredSubsPress,
}: OverviewCardProps) {
  return (
    <View style={styles.wrapper}>
      {/* ── Active Plans Row ── */}
      <TouchableOpacity
        style={styles.plansRow}
        onPress={onPlansPress}
        activeOpacity={0.8}
      >
        {/* Icon */}
        <View style={styles.plansIconWrap}>
          <MaterialCommunityIcons name="layers-outline" size={22} color="#fff" />
        </View>

        {/* Label + count */}
        <View style={styles.plansTextWrap}>
          <Text style={styles.plansLabel}>Active Plans</Text>
          <Text style={styles.plansCount}>{activePlans}</Text>
        </View>

        {/* Right: Available + arrow */}
        <View style={styles.plansRight}>
          <Text style={styles.plansAvailable}>Available</Text>
          <View style={styles.arrowBtn}>
            <Ionicons name="arrow-forward" size={16} color="#1e3a8a" />
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Bottom Grid ── */}
      <View style={styles.grid}>
        {/* Active Subscriptions */}
        <TouchableOpacity
          style={[styles.subCard, styles.subCardGreen]}
          onPress={onActiveSubsPress}
          activeOpacity={0.8}
        >
          <View style={[styles.subIconWrap, styles.subIconGreen]}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
          </View>
          <Text style={[styles.subTitle, styles.subTitleGreen]}>Active Subs.</Text>
          <Text style={[styles.subCount, styles.subCountGreen]}>{activeSubscriptions}</Text>
          <View style={styles.subFooter}>
            <View style={[styles.dot, { backgroundColor: "#16a34a" }]} />
            <Text style={[styles.subFooterText, { color: "#16a34a" }]}>Live now</Text>
          </View>
        </TouchableOpacity>

        {/* Expired Subscriptions */}
        <TouchableOpacity
          style={[styles.subCard, styles.subCardRed]}
          onPress={onExpiredSubsPress}
          activeOpacity={0.8}
        >
          <View style={[styles.subIconWrap, styles.subIconRed]}>
            <Ionicons name="alert-circle-outline" size={20} color="#dc2626" />
          </View>
          <Text style={[styles.subTitle, styles.subTitleRed]}>Expired Subs.</Text>
          <Text style={[styles.subCount, styles.subCountRed]}>{expiredSubscriptions}</Text>
          <View style={styles.subFooter}>
            <View style={[styles.dot, { backgroundColor: "#dc2626" }]} />
            <Text style={[styles.subFooterText, { color: "#dc2626" }]}>Need renewal</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    gap: 8,
  },

  // ── Plans row ──
  plansRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  plansIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  plansTextWrap: {
    flex: 1,
  },
  plansLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e3a8a",
    fontFamily: "Jost-Regular",
  },
  plansCount: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1e3a8a",
    fontFamily: "Poppins-Bold",
    lineHeight: 26,
  },
  plansRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  plansAvailable: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
    fontFamily: "Jost-Regular",
  },
  arrowBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Bottom grid ──
  grid: {
    flexDirection: "row",
    gap: 8,
  },
  subCard: {
    flex: 1,
    borderRadius: 14,
    padding: 10,
    gap: 3,
  },
  subCardGreen: { backgroundColor: "#DCFCE7" },
  subCardRed: { backgroundColor: "#FEE2E2" },
  subIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  subIconGreen: { backgroundColor: "#BBF7D0" },
  subIconRed: { backgroundColor: "#FECACA" },
  subTitle: {
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "Jost-Regular",
  },
  subTitleGreen: { color: "#15803d" },
  subTitleRed: { color: "#b91c1c" },
  subCount: {
    fontSize: 26,
    fontWeight: "800",
    fontFamily: "Poppins-Bold",
    lineHeight: 30,
  },
  subCountGreen: { color: "#15803d" },
  subCountRed: { color: "#b91c1c" },
  subFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  subFooterText: {
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "Jost-Regular",
  },
});
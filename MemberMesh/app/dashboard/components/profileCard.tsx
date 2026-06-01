import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  isThermalPrinterSaved,
  reconnectSavedPrinter,
  getConnectedThermalPrinter,
} from "../../../utils/printerManager";

// ─── Brand palette ────────────────────────────────────────────────────────────
const BRAND       = "#1e3a8a";   // primary navy
const BRAND_MID   = "#2d4fa3";   // slightly lighter navy for gradient feel
const BRAND_LIGHT = "#3b63c4";   // accent tint
const WHITE       = "#FFFFFF";
const WHITE_70    = "rgba(255,255,255,0.70)";
const WHITE_30    = "rgba(255,255,255,0.30)";
const WHITE_15    = "rgba(255,255,255,0.15)";
const WHITE_08    = "rgba(255,255,255,0.08)";
const GOLD        = "#FBBF24";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ProfileCardProps {
  business?: {
    ownerName?: string;
    businessName?: string;
    profileCompletion?: number;
  } | null;
}

type PrinterState = "unknown" | "none" | "connecting" | "connected" | "offline";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function showToast(msg: string) {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  }
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProfileCard({ business }: ProfileCardProps) {
  const router    = useRouter();
  const ownerName     = business?.ownerName?.trim()    || "Partner";
  const businessName  = business?.businessName?.trim() || "My Business";
  const completion    = business?.profileCompletion ?? 100;
  const isComplete    = completion >= 100;
  const initials      = getInitials(ownerName);

  const [printerState, setPrinterState] = useState<PrinterState>("unknown");
  const printerStateRef = useRef<PrinterState>("unknown");

  const updatePrinterState = (s: PrinterState) => {
    printerStateRef.current = s;
    setPrinterState(s);
  };

  // ── On mount: check saved printer ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const saved = await isThermalPrinterSaved();
      updatePrinterState(saved ? "offline" : "none");
      if (saved) silentReconnect();
    })();
  }, []);

  // ── Silent reconnect ──────────────────────────────────────────────────────
  const silentReconnect = useCallback(async () => {
    updatePrinterState("connecting");
    try {
      const success = await reconnectSavedPrinter();
      updatePrinterState(success ? "connected" : "offline");
    } catch {
      updatePrinterState("offline");
    }
  }, []);

  // ── Printer button press ──────────────────────────────────────────────────
  const handlePrinterPress = useCallback(async () => {
    switch (printerState) {
      case "none":
        router.push("/printer");
        break;
      case "connected": {
        const printer = await getConnectedThermalPrinter();
        showToast(`Connected: ${printer?.name || printer?.address || "Thermal Printer"}`);
        break;
      }
      case "offline":
        await silentReconnect();
        if (printerStateRef.current === "connected") showToast("Printer reconnected");
        break;
      default:
        break;
    }
  }, [printerState, router, silentReconnect]);

  // ── Printer chip ──────────────────────────────────────────────────────────
  const printerChip = () => {
    if (printerState === "connecting") {
      return (
        <View style={[styles.printerChip, styles.printerChipNeutral]}>
          <ActivityIndicator size="small" color={WHITE} style={{ marginRight: 5 }} />
          <Text style={styles.printerChipText}>Connecting…</Text>
        </View>
      );
    }
    if (printerState === "connected") {
      return (
        <View style={[styles.printerChip, styles.printerChipGreen]}>
          <View style={styles.chipDot} />
          <Feather name="printer" size={12} color={WHITE} />
          <Text style={styles.printerChipText}>Printer On</Text>
        </View>
      );
    }
    if (printerState === "offline") {
      return (
        <TouchableOpacity
          style={[styles.printerChip, styles.printerChipAmber]}
          onPress={handlePrinterPress}
          activeOpacity={0.8}
        >
          <Feather name="printer" size={12} color={WHITE} />
          <Text style={styles.printerChipText}>Tap to reconnect</Text>
        </TouchableOpacity>
      );
    }
    // "none" or "unknown"
    return (
      <TouchableOpacity
        style={[styles.printerChip, styles.printerChipSetup]}
        onPress={() => router.push("/printer")}
        activeOpacity={0.8}
        disabled={printerState === "unknown"}
      >
        <Feather name="printer" size={12} color={WHITE_70} />
        <Text style={[styles.printerChipText, { color: WHITE_70 }]}>Setup Printer</Text>
        <Ionicons name="arrow-forward" size={11} color={WHITE_70} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.card}>
      {/* ── Decorative circles ── */}
      <View style={styles.decorCircleLarge} />
      <View style={styles.decorCircleSmall} />

      {/* ── Top row: avatar + greeting ── */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatarRing}>
          <View style={styles.avatarInner}>
            <Text style={styles.avatarInitials}>{initials}</Text>
          </View>
          {isComplete && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-bold" size={9} color={BRAND} />
            </View>
          )}
        </View>

        {/* Name block */}
        <View style={styles.nameBlock}>
          <Text style={styles.greeting}>Namaste</Text>
          <Text style={styles.ownerName} numberOfLines={1}>{ownerName},Ji</Text>
          <View style={styles.bizRow}>
            <Feather name="briefcase" size={10} color={WHITE_70} />
            <Text style={styles.bizName} numberOfLines={1}>{businessName}</Text>
          </View>
        </View>

        {/* Settings shortcut */}
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push("/profile")}
          activeOpacity={0.75}
        >
          <Feather name="settings" size={16} color={WHITE_70} />
        </TouchableOpacity>
      </View>

      {/* ── Divider ── */}
      <View style={styles.divider} />

      {/* ── Bottom row: status + printer chip ── */}
      <View style={styles.bottomRow}>
        {/* Left: verified badge OR progress bar */}
        {isComplete ? (
          <View style={styles.verifiedPill}>
            <MaterialCommunityIcons name="shield-check" size={13} color={GOLD} />
            <Text style={styles.verifiedText}>VERIFIED PARTNER</Text>
          </View>
        ) : (
          <View style={styles.progressWrap}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>Profile Strength</Text>
              <Text style={styles.progressValue}>{completion}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${completion}%` as any }]} />
            </View>
          </View>
        )}

        {/* Right: printer chip */}
        {printerChip()}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 48,
    backgroundColor: BRAND,
    borderRadius: 24,
    padding: 30,
    overflow: "hidden",
    // shadow
    shadowColor: BRAND,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 10,
  },

  // ── Decorative circles ──
  decorCircleLarge: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: WHITE_08,
    top: -60,
    right: -50,
  },
  decorCircleSmall: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: WHITE_08,
    bottom: -30,
    left: -20,
  },

  // ── Top row ──
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  avatarRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: WHITE_30,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    flexShrink: 0,
  },
  avatarInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: BRAND_LIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitials: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: WHITE,
    letterSpacing: 1,
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: GOLD,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: BRAND,
  },
  nameBlock: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: WHITE_70,
    letterSpacing: 0.3,
  },
  ownerName: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: WHITE,
    lineHeight: 26,
    letterSpacing: -0.3,
  },
  bizRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 1,
  },
  bizName: {
    fontFamily: "Jost-Medium",
    fontSize: 11,
    color: WHITE_70,
  },
  settingsBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: WHITE_15,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },

  // ── Divider ──
  divider: {
    height: 1,
    backgroundColor: WHITE_15,
    marginVertical: 16,
  },

  // ── Bottom row ──
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: WHITE_08,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: WHITE_15,
  },
  verifiedText: {
    fontFamily: "Jost-Bold",
    fontSize: 10,
    color: GOLD,
    letterSpacing: 0.8,
  },
  progressWrap: {
    flex: 1,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: WHITE_70,
  },
  progressValue: {
    fontFamily: "Jost-Bold",
    fontSize: 11,
    color: GOLD,
  },
  track: {
    height: 4,
    backgroundColor: WHITE_15,
    borderRadius: 2,
  },
  fill: {
    height: "100%",
    backgroundColor: GOLD,
    borderRadius: 2,
  },

  // ── Printer chip ──
  printerChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexShrink: 0,
  },
  printerChipText: {
    fontFamily: "Jost-Bold",
    fontSize: 10,
    color: WHITE,
    letterSpacing: 0.2,
  },
  printerChipNeutral: {
    backgroundColor: WHITE_15,
  },
  printerChipGreen: {
    backgroundColor: "rgba(22,163,74,0.85)",
  },
  printerChipAmber: {
    backgroundColor: "rgba(217,119,6,0.85)",
  },
  printerChipSetup: {
    backgroundColor: WHITE_15,
    borderWidth: 1,
    borderColor: WHITE_30,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#86efac",
  },
});

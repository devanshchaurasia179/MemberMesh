import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Linking, Alert, Platform } from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Subscription } from "../../../constants/subscription.api";

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
  // Add null checks for nested properties
  if (!item || !item.memberSnapshot || !item.plan) {
    return null;
  }

  const isActive = item.status === "ACTIVE";
  const isCancelled = item.status === "CANCELLED";
  const isExpired = item.status === "EXPIRED";
  const statusColors = getStatusColor(item.status);
  const mobile = item.memberSnapshot.mobile;

  const handleCall = () => {
    if (!mobile) {
      Alert.alert("Error", "No mobile number available");
      return;
    }
    const phoneUrl = `tel:${mobile}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(phoneUrl);
        } else {
          Alert.alert("Error", "Phone call not supported on this device");
        }
      })
      .catch(() => Alert.alert("Error", "Failed to initiate call"));
  };

  const handleWhatsApp = () => {
    if (!mobile) {
      Alert.alert("Error", "No mobile number available");
      return;
    }
    
    // Remove any non-digit characters and ensure it starts with country code
    let cleanNumber = mobile.replace(/\D/g, "");
    
    // If number doesn't start with country code, assume India (+91)
    if (!cleanNumber.startsWith("91") && cleanNumber.length === 10) {
      cleanNumber = "91" + cleanNumber;
    }
    
    const message = `Hi ${item.memberSnapshot.name}, this is regarding your ${item.plan.name} subscription.`;
    const whatsappUrl = Platform.select({
      ios: `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?phone=${cleanNumber}&text=${encodeURIComponent(message)}`,
      default: `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`,
    });

    Linking.canOpenURL(whatsappUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(whatsappUrl);
        } else {
          Alert.alert("Error", "WhatsApp is not installed on this device");
        }
      })
      .catch(() => Alert.alert("Error", "Failed to open WhatsApp"));
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.memberName}>{item.memberSnapshot.name || "Unknown Member"}</Text>
          {item.code && <Text style={styles.code}>#{item.code}</Text>}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Plan</Text>
          <Text style={styles.value}>{item.plan.name || "N/A"}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Amount Paid</Text>
          <Text style={styles.value}>₹{item.amountPaid || 0}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Start Date</Text>
          <Text style={styles.value}>{formatDate(item.startDate)}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Expiry Date</Text>
          <Text style={styles.value}>{formatDate(item.expiryDate)}</Text>
        </View>
        {mobile && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Mobile</Text>
            <Text style={styles.value}>{mobile}</Text>
          </View>
        )}
      </View>

      <View style={styles.divider} />

      {/* Communication Actions */}
      {mobile && (
        <>
          <View style={styles.communicationActions}>
            <TouchableOpacity
              style={[styles.commBtn, styles.callBtn]}
              onPress={handleCall}
              disabled={isCancelling}
            >
              <Feather name="phone" size={14} color="#0F6E56" />
              <Text style={styles.callBtnText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.commBtn, styles.whatsappBtn]}
              onPress={handleWhatsApp}
              disabled={isCancelling}
            >
              <Feather name="message-circle" size={14} color="#25D366" />
              <Text style={styles.whatsappBtnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.divider} />
        </>
      )}

      {/* Subscription Actions */}
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => onEdit(item)}
          disabled={isCancelling}
        >
          <Feather name="edit-2" size={14} color="#534AB7" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        
        {/* Show Renew button for ACTIVE, EXPIRED, and CANCELLED subscriptions */}
        {(isActive || isExpired || isCancelled) && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.renewBtn]}
            onPress={() => onRenew(item)}
            disabled={isCancelling}
          >
            <Feather name="refresh-cw" size={14} color="#0F6E56" />
            <Text style={styles.renewBtnText}>Renew</Text>
          </TouchableOpacity>
        )}
        
        {/* Show Cancel button only for ACTIVE subscriptions */}
        {isActive && (
          <TouchableOpacity
            style={[styles.actionBtn, styles.cancelBtn, isCancelling && styles.disabledBtn]}
            onPress={() => onCancel(item)}
            disabled={isCancelling}
          >
            <Feather name="x-circle" size={14} color={isCancelling ? "#9CA3AF" : "#A32D2D"} />
            <Text style={[styles.cancelBtnText, isCancelling && styles.disabledText]}>
              {isCancelling ? "Cancelling..." : "Cancel"}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "ACTIVE": return { bg: "#E1F5EE", text: "#0F6E56" };
    case "EXPIRED": return { bg: "#FEE2E2", text: "#991B1B" };
    case "CANCELLED": return { bg: "#F3F4F6", text: "#6B7280" };
    default: return { bg: "#F3F4F6", text: "#6B7280" };
  }
}

function formatDate(date: string | null) {
  if (!date) return "Lifetime";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: "#E0DAF8",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  memberName: { fontSize: 16, fontWeight: "600", color: "#1E1B4B" },
  code: { fontSize: 12, color: "#7F77DD", marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  divider: { height: 0.5, backgroundColor: "#EDE9FE", marginVertical: 12 },
  cardBody: { gap: 8 },
  infoRow: { flexDirection: "row", justifyContent: "space-between" },
  label: { fontSize: 13, color: "#6B7280" },
  value: { fontSize: 13, fontWeight: "500", color: "#1E1B4B" },
  
  // Communication Actions
  communicationActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  commBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  callBtn: { backgroundColor: "#E1F5EE", borderWidth: 1, borderColor: "#0F6E56" },
  callBtnText: { fontSize: 13, fontWeight: "600", color: "#0F6E56" },
  whatsappBtn: { backgroundColor: "#E8F8F0", borderWidth: 1, borderColor: "#25D366" },
  whatsappBtnText: { fontSize: 13, fontWeight: "600", color: "#25D366" },
  
  // Subscription Actions
  cardActions: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  editBtn: { backgroundColor: "#EEEDFE" },
  editBtnText: { fontSize: 13, fontWeight: "600", color: "#534AB7" },
  renewBtn: { backgroundColor: "#E1F5EE" },
  renewBtnText: { fontSize: 13, fontWeight: "600", color: "#0F6E56" },
  cancelBtn: { backgroundColor: "#FCEBEB" },
  cancelBtnText: { fontSize: 13, fontWeight: "600", color: "#A32D2D" },
  disabledBtn: { opacity: 0.5 },
  disabledText: { color: "#9CA3AF" },
});

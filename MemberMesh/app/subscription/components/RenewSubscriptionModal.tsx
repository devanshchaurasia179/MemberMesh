import React, { useState, useEffect } from "react";
import {
  View, Text, Modal, ScrollView, TouchableOpacity,
  TextInput, StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Subscription } from "../../../constants/subscription.api";

interface RenewSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  subscription: Subscription | null;
}

export default function RenewSubscriptionModal({
  visible,
  onClose,
  onSubmit,
  subscription,
}: RenewSubscriptionModalProps) {
  const [duration, setDuration] = useState("");
  const [billingCycle, setBillingCycle] = useState<"DAYS" | "MONTH" | "YEAR">("MONTH");

  useEffect(() => {
    if (subscription) {
      setBillingCycle(
        (subscription.billingCycleUsed as "DAYS" | "MONTH" | "YEAR") || "MONTH"
      );
    }
  }, [subscription]);

  const handleSubmit = () => {
    const payload: any = {};

    if (duration) {
      payload.duration = parseInt(duration);
      payload.billingCycle = billingCycle;
    }

    onSubmit(payload);
    setDuration("");
  };

  const isCancelled = subscription?.status === "CANCELLED";
  const isExpired = subscription?.status === "EXPIRED";

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Renew Subscription</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {subscription && (
              <View style={styles.renewInfo}>
                <Text style={styles.renewInfoText}>
                  Renewing for: {subscription.memberSnapshot?.name || "Unknown Member"}
                </Text>
                <Text style={styles.renewInfoText}>
                  Plan: {subscription.plan?.name || "N/A"}
                </Text>
                {(isCancelled || isExpired) && (
                  <View style={styles.renewWarning}>
                    <Feather name="info" size={14} color="#0F6E56" />
                    <Text style={styles.renewWarningText}>
                      {isCancelled 
                        ? "This subscription was cancelled. Renewal will start from today."
                        : "This subscription has expired. Renewal will start from today."}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Text style={styles.inputLabel}>Duration (Optional)</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="Leave empty for default plan duration"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Billing Cycle</Text>
            <View style={styles.cycleSelector}>
              {(["DAYS", "MONTH", "YEAR"] as const).map((cycle) => (
                <TouchableOpacity
                  key={cycle}
                  style={[
                    styles.cycleOption,
                    billingCycle === cycle && styles.cycleOptionSelected,
                  ]}
                  onPress={() => setBillingCycle(cycle)}
                >
                  <Text
                    style={[
                      styles.cycleOptionText,
                      billingCycle === cycle && styles.cycleOptionTextSelected,
                    ]}
                  >
                    {cycle}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Renew</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#1E1B4B" },
  modalBody: { padding: 20, maxHeight: 500 },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#1F2937",
    backgroundColor: "#F9FAFB",
  },
  cycleSelector: { flexDirection: "row", gap: 8 },
  cycleOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  cycleOptionSelected: {
    borderColor: "#7F77DD",
    backgroundColor: "#F5F3FF",
  },
  cycleOptionText: { fontSize: 13, fontWeight: "500", color: "#6B7280" },
  cycleOptionTextSelected: { color: "#534AB7" },
  cancelModalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelModalBtnText: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#7F77DD",
  },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  renewInfo: {
    backgroundColor: "#F5F3FF",
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  renewInfoText: { fontSize: 13, color: "#534AB7", marginBottom: 4 },
  renewWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#E1F5EE",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#0F6E56",
  },
  renewWarningText: {
    flex: 1,
    fontSize: 12,
    color: "#0F6E56",
    lineHeight: 16,
  },
});

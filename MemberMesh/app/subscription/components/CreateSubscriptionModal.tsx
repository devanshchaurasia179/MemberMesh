import React, { useState } from "react";
import {
  View, Text, Modal, ScrollView, TouchableOpacity,
  TextInput, Alert, StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface CreateSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  plans: any[];
}

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onSubmit,
  plans,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [duration, setDuration] = useState("");
  const [billingCycle, setBillingCycle] = useState<"DAYS" | "MONTH" | "YEAR">("MONTH");

  const activePlans = plans.filter((p) => p.isActive);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Member name is required");
      return;
    }
    if (!selectedPlanId) {
      Alert.alert("Error", "Please select a plan");
      return;
    }

    const payload: any = {
      name: name.trim(),
      mobile: mobile.trim() || undefined,
      address: address.trim() || undefined,
      code: code.trim() || undefined,
      planId: selectedPlanId,
    };

    if (duration) {
      payload.duration = parseInt(duration);
      payload.billingCycle = billingCycle;
    }

    onSubmit(payload);
    // Reset form
    setName("");
    setMobile("");
    setAddress("");
    setCode("");
    setSelectedPlanId("");
    setDuration("");
    setBillingCycle("MONTH");
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>New Subscription</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Member Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter member name"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={styles.inputLabel}>Subscription Code (optional)</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="Auto-generated if left blank"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="characters"
            />

            <Text style={styles.inputLabel}>Mobile</Text>
            <TextInput
              style={styles.input}
              value={mobile}
              onChangeText={setMobile}
              placeholder="Enter mobile number"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Select Plan *</Text>
            <View style={styles.planSelector}>
              {activePlans.map((plan) => (
                <TouchableOpacity
                  key={plan._id}
                  style={[
                    styles.planOption,
                    selectedPlanId === plan._id && styles.planOptionSelected,
                  ]}
                  onPress={() => setSelectedPlanId(plan._id)}
                >
                  <Text
                    style={[
                      styles.planOptionText,
                      selectedPlanId === plan._id && styles.planOptionTextSelected,
                    ]}
                  >
                    {plan.name}
                  </Text>
                  <Text
                    style={[
                      styles.planOptionPrice,
                      selectedPlanId === plan._id && styles.planOptionPriceSelected,
                    ]}
                  >
                    ₹{plan.price}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Custom Duration (Optional)</Text>

            <Text style={styles.inputLabel}>Duration</Text>
            <TextInput
              style={styles.input}
              value={duration}
              onChangeText={setDuration}
              placeholder="e.g., 3"
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
              <Text style={styles.submitBtnText}>Create</Text>
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
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a" },
  modalBody: { padding: 20, maxHeight: 500 },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
  },
  textArea: { height: 80, textAlignVertical: "top" },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
    marginTop: 20,
    marginBottom: 8,
  },
  planSelector: { gap: 8 },
  planOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  planOptionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#DBEAFE",
  },
  planOptionText: { fontSize: 14, fontWeight: "500", color: "#64748b" },
  planOptionTextSelected: { color: "#1e3a8a" },
  planOptionPrice: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  planOptionPriceSelected: { color: "#1e3a8a" },
  cycleSelector: { flexDirection: "row", gap: 8 },
  cycleOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1.5,
    borderColor: "#e2e8f0",
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  cycleOptionSelected: {
    borderColor: "#3b82f6",
    backgroundColor: "#DBEAFE",
  },
  cycleOptionText: { fontSize: 13, fontWeight: "500", color: "#64748b" },
  cycleOptionTextSelected: { color: "#1e3a8a" },
  cancelModalBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  cancelModalBtnText: { fontSize: 14, fontWeight: "600", color: "#64748b" },
  submitBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#1e3a8a",
  },
  submitBtnText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});

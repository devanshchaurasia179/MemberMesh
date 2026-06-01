import React, { useState, useEffect } from "react";
import {
  View, Text, Modal, ScrollView, TouchableOpacity,
  TextInput, Alert, StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Subscription } from "../../../constants/subscription.api";

interface EditSubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  subscription: Subscription | null;
}

export default function EditSubscriptionModal({
  visible,
  onClose,
  onSubmit,
  subscription,
}: EditSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    if (subscription) {
      setName(subscription.memberSnapshot?.name || "");
      setMobile(subscription.memberSnapshot?.mobile || "");
      setAddress(subscription.memberSnapshot?.address || "");
      setCode(subscription.code || "");
    }
  }, [subscription]);

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert("Error", "Member name is required");
      return;
    }
    if (!code.trim()) {
      Alert.alert("Error", "Subscription code cannot be empty");
      return;
    }

    onSubmit({
      name: name.trim(),
      mobile: mobile.trim() || undefined,
      address: address.trim() || undefined,
      code: code.trim(),
    });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Member Details</Text>
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

            <Text style={styles.inputLabel}>Subscription Code *</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={(t) => setCode(t.toUpperCase())}
              placeholder="e.g. GOLD01"
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
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelModalBtn} onPress={onClose}>
              <Text style={styles.cancelModalBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>Update</Text>
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

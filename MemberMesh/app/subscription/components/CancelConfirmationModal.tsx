import React from "react";
import {
  View, Text, Modal, TouchableOpacity,
  ActivityIndicator, StyleSheet,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import type { Subscription } from "../../../constants/subscription.api";

interface CancelConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  subscription: Subscription | null;
  isLoading: boolean;
}

export default function CancelConfirmationModal({
  visible,
  onClose,
  onConfirm,
  subscription,
  isLoading,
}: CancelConfirmationModalProps) {
  const memberName = subscription?.memberSnapshot?.name || "this member";

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, styles.confirmModalContent]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Cancel Subscription</Text>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <Feather name="x" size={24} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.confirmModalBody}>
            <View style={styles.warningIconContainer}>
              <Feather name="alert-circle" size={48} color="#DC2626" />
            </View>
            <Text style={styles.confirmText}>
              Are you sure you want to cancel {memberName}'s subscription?
            </Text>
            <Text style={styles.confirmSubtext}>
              This action will mark the subscription as cancelled and remove the expiry date.
            </Text>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelModalBtn} 
              onPress={onClose}
              disabled={isLoading}
            >
              <Text style={styles.cancelModalBtnText}>No, Keep It</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.submitBtn, styles.dangerBtn]} 
              onPress={onConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Yes, Cancel</Text>
              )}
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
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
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
  confirmModalContent: { maxHeight: "auto", borderRadius: 20 },
  confirmModalBody: { padding: 24, alignItems: "center" },
  warningIconContainer: { marginBottom: 16 },
  confirmText: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#0f172a", 
    textAlign: "center",
    marginBottom: 8,
  },
  confirmSubtext: { 
    fontSize: 13, 
    color: "#64748b", 
    textAlign: "center",
    lineHeight: 18,
  },
  dangerBtn: { backgroundColor: "#ef4444" },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from "react-native";

interface PlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const PlanModal = ({ visible, onClose, onSubmit, initialData }: PlanModalProps) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    billingCycle: "MONTH",
  });

  // Sync form with initialData when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name,
        price: String(initialData.price),
        duration: String(initialData.duration),
        billingCycle: initialData.billingCycle,
      });
    } else {
      setForm({ name: "", price: "", duration: "", billingCycle: "MONTH" });
    }
  }, [initialData, visible]);

  const handleHandleSubmit = () => {
    const payload = {
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
    };
    onSubmit(payload);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          {/* Backdrop closer */}
          <TouchableOpacity style={styles.backdrop} onPress={onClose} />
          
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.sheet}
          >
            <View style={styles.content}>
              <View style={styles.handle} />
              
              <Text style={styles.title}>
                {initialData ? "Edit Membership" : "New Membership"}
              </Text>
              <Text style={styles.subtitle}>Fill in the details for your plan</Text>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Plan Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Gold Monthly"
                    placeholderTextColor="#94A3B8"
                    value={form.name}
                    onChangeText={(t) => setForm({ ...form, name: t })}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>Price (₹)</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="999"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      value={form.price}
                      onChangeText={(t) => setForm({ ...form, price: t })}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Duration</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="1"
                      keyboardType="numeric"
                      placeholderTextColor="#94A3B8"
                      value={form.duration}
                      onChangeText={(t) => setForm({ ...form, duration: t })}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Billing Cycle</Text>
                  <View style={styles.cycleContainer}>
                    {["DAYS", "MONTH", "YEAR"].map((cycle) => (
                      <TouchableOpacity
                        key={cycle}
                        onPress={() => setForm({ ...form, billingCycle: cycle })}
                        style={[
                          styles.cycleBtn,
                          form.billingCycle === cycle && styles.cycleBtnActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.cycleBtnText,
                            form.billingCycle === cycle && styles.cycleBtnTextActive,
                          ]}
                        >
                          {cycle}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={handleHandleSubmit}>
                  <Text style={styles.submitBtnText}>
                    {initialData ? "Save Changes" : "Create Plan"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 24,
    maxHeight: "85%",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 20,
  },
  content: {
    paddingTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#1E293B",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1E293B",
  },
  row: {
    flexDirection: "row",
  },
  cycleContainer: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    padding: 4,
  },
  cycleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  cycleBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cycleBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },
  cycleBtnTextActive: {
    color: "#6366F1",
  },
  submitBtn: {
    backgroundColor: "#6366F1",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default PlanModal;
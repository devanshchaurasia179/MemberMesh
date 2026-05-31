import React, { useEffect, useState, useRef } from "react";
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
  Animated,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface PlanModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  initialData?: any;
}

const CYCLES: { key: string; label: string; icon: "calendar" | "refresh-cw" | "star" }[] = [
  { key: "DAYS", label: "Daily", icon: "calendar" },
  { key: "MONTH", label: "Monthly", icon: "refresh-cw" },
  { key: "YEAR", label: "Yearly", icon: "star" },
];

interface FieldProps {
  label: string;
  icon: React.ComponentProps<typeof Feather>["name"];
  children: React.ReactNode;
  error?: string;
}

function Field({ label, icon, children, error }: FieldProps) {
  return (
    <View style={fieldStyles.wrap}>
      <View style={fieldStyles.labelRow}>
        <Feather name={icon} size={12} color="#7C6FE0" />
        <Text style={fieldStyles.label}>{label}</Text>
      </View>
      {children}
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

const fieldStyles = StyleSheet.create({
  wrap: { marginBottom: 20 },
  labelRow: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 8 },
  label: { fontSize: 11, fontWeight: "700", color: "#6D28D9", textTransform: "uppercase", letterSpacing: 0.8 },
  error: { fontSize: 11, color: "#DC2626", marginTop: 5, fontWeight: "500" },
});

const PlanModal = ({ visible, onClose, onSubmit, initialData }: PlanModalProps) => {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const [form, setForm] = useState({
    name: "",
    price: "",
    duration: "",
    billingCycle: "MONTH",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);

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
    setErrors({});
  }, [initialData, visible]);

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 3,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Plan name is required";
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) <= 0)
      newErrors.price = "Enter a valid price";
    if (!form.duration || isNaN(Number(form.duration)) || Number(form.duration) <= 0)
      newErrors.duration = "Enter a valid duration";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      ...form,
      price: Number(form.price),
      duration: Number(form.duration),
    });
  };

  const inputStyle = (field: string) => [
    styles.input,
    focusedField === field && styles.inputFocused,
    errors[field] && styles.inputError,
  ];

  const isEditing = !!initialData;

  return (
    <Modal visible={visible} animationType="none" transparent onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableOpacity
            style={styles.backdrop}
            onPress={onClose}
            activeOpacity={1}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kvWrapper}
          >
            <Animated.View
              style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
            >
              {/* Handle */}
              <View style={styles.handleWrap}>
                <View style={styles.handle} />
              </View>

              {/* Title row */}
              <View style={styles.titleRow}>
                <View style={styles.titleIconWrap}>
                  <Feather
                    name={isEditing ? "edit-3" : "plus-circle"}
                    size={18}
                    color="#7C6FE0"
                  />
                </View>
                <View>
                  <Text style={styles.title}>
                    {isEditing ? "Edit plan" : "New membership"}
                  </Text>
                  <Text style={styles.subtitle}>
                    {isEditing
                      ? "Update details below"
                      : "Set up a new subscription tier"}
                  </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Feather name="x" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                style={styles.scrollArea}
              >
                {/* Plan name */}
                <Field label="Plan name" icon="tag" error={errors.name}>
                  <TextInput
                    style={inputStyle("name")}
                    placeholder="e.g. Gold Monthly"
                    placeholderTextColor="#C4B5FD"
                    value={form.name}
                    onChangeText={(t) => {
                      setForm({ ...form, name: t });
                      if (errors.name) setErrors({ ...errors, name: "" });
                    }}
                    onFocus={() => setFocusedField("name")}
                    onBlur={() => setFocusedField(null)}
                    returnKeyType="next"
                  />
                </Field>

                {/* Price + Duration row */}
                <View style={styles.row}>
                  <View style={{ flex: 1 }}>
                    <Field label="Price (₹)" icon="dollar-sign" error={errors.price}>
                      <View style={styles.prefixInputWrap}>
                        <Text style={styles.prefixSymbol}>₹</Text>
                        <TextInput
                          style={[inputStyle("price"), styles.prefixInput]}
                          placeholder="999"
                          keyboardType="numeric"
                          placeholderTextColor="#C4B5FD"
                          value={form.price}
                          onChangeText={(t) => {
                            setForm({ ...form, price: t.replace(/[^0-9]/g, "") });
                            if (errors.price) setErrors({ ...errors, price: "" });
                          }}
                          onFocus={() => setFocusedField("price")}
                          onBlur={() => setFocusedField(null)}
                        />
                      </View>
                    </Field>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Field label="Duration" icon="clock" error={errors.duration}>
                      <TextInput
                        style={inputStyle("duration")}
                        placeholder="1"
                        keyboardType="numeric"
                        placeholderTextColor="#C4B5FD"
                        value={form.duration}
                        onChangeText={(t) => {
                          setForm({ ...form, duration: t.replace(/[^0-9]/g, "") });
                          if (errors.duration) setErrors({ ...errors, duration: "" });
                        }}
                        onFocus={() => setFocusedField("duration")}
                        onBlur={() => setFocusedField(null)}
                      />
                    </Field>
                  </View>
                </View>

                {/* Billing cycle */}
                <Field label="Billing cycle" icon="refresh-cw">
                  <View style={styles.cycleRow}>
                    {CYCLES.map((c) => {
                      const isActive = form.billingCycle === c.key;
                      return (
                        <TouchableOpacity
                          key={c.key}
                          style={[styles.cycleBtn, isActive && styles.cycleBtnActive]}
                          onPress={() => setForm({ ...form, billingCycle: c.key })}
                          activeOpacity={0.8}
                        >
                          <Feather
                            name={c.icon}
                            size={13}
                            color={isActive ? "#5B21B6" : "#A78BFA"}
                          />
                          <Text
                            style={[
                              styles.cycleBtnText,
                              isActive && styles.cycleBtnTextActive,
                            ]}
                          >
                            {c.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </Field>

                {/* Summary preview */}
                {form.name || form.price ? (
                  <View style={styles.preview}>
                    <Feather name="eye" size={12} color="#7C6FE0" />
                    <Text style={styles.previewText}>
                      {form.name || "Your plan"} ·{" "}
                      {form.price ? `₹${Number(form.price).toLocaleString("en-IN")}` : "–"}{" "}
                      /{" "}
                      {CYCLES.find((c) => c.key === form.billingCycle)?.label.toLowerCase()}
                    </Text>
                  </View>
                ) : null}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitBtn}
                  onPress={handleSubmit}
                  activeOpacity={0.88}
                >
                  <Feather
                    name={isEditing ? "check" : "plus"}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.submitBtnText}>
                    {isEditing ? "Save changes" : "Create plan"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={onClose}
                  activeOpacity={0.7}
                >
                  <Text style={styles.cancelBtnText}>Discard</Text>
                </TouchableOpacity>
              </ScrollView>
            </Animated.View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(28,19,64,0.45)",
  },
  kvWrapper: { justifyContent: "flex-end" },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 44 : 28,
    maxHeight: "90%",
    shadowColor: "#1C1340",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 16,
  },
  handleWrap: { alignItems: "center", paddingTop: 12, paddingBottom: 4 },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F3FF",
    marginBottom: 6,
  },
  titleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#EDE9FE",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1C1340",
    letterSpacing: -0.3,
    flex: 1,
  },
  subtitle: { fontSize: 12, color: "#9CA3AF", fontWeight: "500" },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollArea: { marginTop: 16 },

  input: {
    backgroundColor: "#FAFAFF",
    borderWidth: 1.5,
    borderColor: "#EDE9FE",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: "#1C1340",
    fontWeight: "500",
  },
  inputFocused: {
    borderColor: "#7C6FE0",
    backgroundColor: "#fff",
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 2,
  },
  inputError: { borderColor: "#EF4444", backgroundColor: "#FFF5F5" },

  prefixInputWrap: { position: "relative" },
  prefixSymbol: {
    position: "absolute",
    left: 14,
    top: 13,
    fontSize: 15,
    color: "#7C6FE0",
    fontWeight: "600",
    zIndex: 1,
  },
  prefixInput: { paddingLeft: 26 },

  row: { flexDirection: "row", gap: 12 },

  cycleRow: {
    flexDirection: "row",
    backgroundColor: "#F5F3FF",
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  cycleBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 11,
    borderRadius: 10,
  },
  cycleBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  cycleBtnText: { fontSize: 12, fontWeight: "600", color: "#A78BFA" },
  cycleBtnTextActive: { color: "#5B21B6" },

  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#F5F3FF",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 20,
  },
  previewText: { fontSize: 13, color: "#5B21B6", fontWeight: "600", flex: 1 },

  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#7C6FE0",
    borderRadius: 16,
    paddingVertical: 16,
    shadowColor: "#7C6FE0",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  submitBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtn: { paddingVertical: 14, alignItems: "center" },
  cancelBtnText: { color: "#9CA3AF", fontSize: 14, fontWeight: "600" },
});

export default PlanModal;
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  StyleSheet,
} from "react-native";
import { Member } from "../../../types/member";
import { C } from "./theme";

export interface MemberFormValues {
  name: string;
  phone: string;
  email: string;
  address: string;
}

interface Props {
  visible: boolean;
  editingMember: Member | null;
  form: MemberFormValues;
  onChangeForm: (form: MemberFormValues) => void;
  onSave: () => void;
  onClose: () => void;
}

const FIELDS = [
  { key: "name",    label: "Full Name", placeholder: "Jane Doe",           keyboard: "default"       },
  { key: "phone",   label: "Phone",     placeholder: "+91 98765 43210",     keyboard: "phone-pad"     },
  { key: "email",   label: "Email",     placeholder: "jane@example.com",    keyboard: "email-address" },
  { key: "address", label: "Address",   placeholder: "123 Main St, City",   keyboard: "default"       },
] as const;

export const MemberFormModal: React.FC<Props> = ({
  visible, editingMember, form, onChangeForm, onSave, onClose,
}) => {
  const [focusedField, setFocusedField] = useState<string | null>(null);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>{editingMember ? "Edit Member" : "New Member"}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {FIELDS.map(({ key, label, placeholder, keyboard }) => (
            <View key={key} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>{label}</Text>
              <TextInput
                style={[styles.fieldInput, focusedField === key && styles.fieldInputFocused]}
                placeholder={placeholder}
                placeholderTextColor={C.inkLight}
                value={form[key]}
                onChangeText={(t) => onChangeForm({ ...form, [key]: t })}
                keyboardType={keyboard as any}
                onFocus={() => setFocusedField(key)}
                onBlur={() => setFocusedField(null)}
                autoCapitalize={key === "name" ? "words" : "none"}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.saveButton} onPress={onSave} activeOpacity={0.85}>
            <Text style={styles.saveButtonText}>
              {editingMember ? "Save Changes" : "Add Member"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onClose} style={styles.cancelButton} activeOpacity={0.7}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(26,18,16,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: C.warmWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: Platform.OS === "ios" ? 40 : 28,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: "center", marginBottom: 20,
  },
  header: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "space-between", marginBottom: 16,
  },
  title: {
    fontSize: 22, fontWeight: "800", color: C.ink,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.primaryFaint, alignItems: "center",
    justifyContent: "center", borderWidth: 1, borderColor: C.border,
  },
  closeText: { fontSize: 13, color: C.primary, fontWeight: "700" },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 20 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.2,
    color: C.inkMid, marginBottom: 6, textTransform: "uppercase",
  },
  fieldInput: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12,
    padding: 13, fontSize: 15, color: C.ink, backgroundColor: C.cream,
  },
  fieldInputFocused: { borderColor: C.primary, backgroundColor: C.primaryFaint },
  saveButton: {
    backgroundColor: C.primary, borderRadius: 14, paddingVertical: 16,
    alignItems: "center", marginTop: 8,
    shadowColor: C.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35, shadowRadius: 14, elevation: 8,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: 0.3 },
  cancelButton: { paddingVertical: 14, alignItems: "center" },
  cancelButtonText: { fontSize: 15, color: C.inkLight, fontWeight: "600" },
});
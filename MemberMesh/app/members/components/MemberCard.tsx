import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { Member } from "../../../types/member";
import { C } from "./theme";

const AVATAR_PALETTES = [
  { bg: "#aa3e36", fg: "#fff" },
  { bg: "#c4524a", fg: "#fff" },
  { bg: "#8b2f28", fg: "#fff" },
  { bg: "#d4756e", fg: "#fff" },
  { bg: "#5c2220", fg: "#fff" },
];

const getInitials = (name: string) =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

const avatarColor = (name: string) =>
  AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];

interface Props {
  item: Member;
  index: number;
  onEdit: (member: Member) => void;
  onDelete: (id: string) => void;
}

export const MemberCard: React.FC<Props> = ({ item, index, onEdit, onDelete }) => {
  const av = avatarColor(item.name);
  return (
    <View style={[styles.card, index !== 0 && { marginTop: 12 }]}>
      <View style={[styles.avatar, { backgroundColor: av.bg }]}>
        <Text style={[styles.avatarText, { color: av.fg }]}>{getInitials(item.name)}</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.phone}>{item.phone}</Text>
        {item.email ? <Text style={styles.email}>{item.email}</Text> : null}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(item)} activeOpacity={0.75}>
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => onDelete(item._id)} activeOpacity={0.75}>
          <Text style={styles.deleteBtnText}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: C.warmWhite,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    shadowColor: C.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "800",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 16, fontWeight: "700", color: C.ink, letterSpacing: -0.2 },
  phone: { fontSize: 13, color: C.inkMid, fontWeight: "500" },
  email: { fontSize: 12, color: C.inkLight, marginTop: 1 },
  actions: { gap: 8, alignItems: "center" },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: C.primaryFaint,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  editBtnText: { fontSize: 12, fontWeight: "700", color: C.primary, letterSpacing: 0.3 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#fff5f5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ffd5d3",
  },
  deleteBtnText: { fontSize: 12, color: C.primary, fontWeight: "700" },
});
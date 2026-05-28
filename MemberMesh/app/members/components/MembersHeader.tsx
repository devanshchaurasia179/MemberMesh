import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { C } from "./theme";

interface Props {
  onAdd: () => void;
}

export const MembersHeader: React.FC<Props> = ({ onAdd }) => (
  <View style={styles.headerBlock}>
    <View>
      <Text style={styles.eyebrow}>DIRECTORY</Text>
      <Text style={styles.title}>Members</Text>
    </View>
    <TouchableOpacity style={styles.addButton} onPress={onAdd} activeOpacity={0.85}>
      <Text style={styles.addIcon}>+</Text>
      <Text style={styles.addLabel}>Add</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  headerBlock: {
    backgroundColor: C.primaryDark,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "android" ? 16 : 8,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 3,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 9,
    gap: 4,
  },
  addIcon: { color: "#fff", fontSize: 18, fontWeight: "300", lineHeight: 20 },
  addLabel: { color: "#fff", fontSize: 14, fontWeight: "600", letterSpacing: 0.3 },
});
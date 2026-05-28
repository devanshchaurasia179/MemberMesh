import React from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { C } from "./theme";

export const EmptyState: React.FC = () => (
  <View style={styles.container}>
    <View style={styles.iconWrap}>
      <Text style={styles.icon}>👥</Text>
    </View>
    <Text style={styles.title}>No members yet</Text>
    <Text style={styles.subtitle}>Tap the Add button to get started.</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", paddingBottom: 60 },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: C.primaryFaint,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  icon: { fontSize: 30 },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: C.ink,
    marginBottom: 6,
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
  },
  subtitle: { fontSize: 14, color: C.inkLight, textAlign: "center" },
});
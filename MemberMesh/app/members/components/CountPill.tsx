import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { C } from "./theme";

interface Props {
  count: number;
}

export const CountPill: React.FC<Props> = ({ count }) => (
  <View style={styles.row}>
    <View style={styles.pill}>
      <Text style={styles.text}>
        {count} {count === 1 ? "member" : "members"}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    backgroundColor: C.cream,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: C.primaryFaint,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: C.border,
  },
  text: { fontSize: 12, color: C.primary, fontWeight: "600", letterSpacing: 0.3 },
});
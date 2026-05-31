import React from "react";
import { 
  View, 
  Text, 
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface StatCardProps {
  title: string;
  count: number | string;
  icon: string;
  color: string;
  onPress?: () => void;
  subtitle?: string;
}

export default function StatCard({ 
  title, 
  count, 
  icon, 
  color,
  onPress,
  subtitle 
}: StatCardProps) {
  return (
    <TouchableOpacity 
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.leftSection}>
          <Text style={styles.title}>{title}</Text>
          <Text style={[styles.count, { color }]}>{count}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
        <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FDFCF8",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftSection: {
    flex: 1,
  },
  title: {
    fontFamily: "Jost-Regular",
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },
  count: {
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: "Jost-Regular",
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
});

import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
export default function ProfileCard({ business }) {
  const ownerName = business?.ownerName?.trim() || "Partner";
  const businessName = business?.businessName?.trim() || "My Business";
  const completion = business?.profileCompletion ?? 100; 
  const isComplete = completion >= 100;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.contentRow}>
        <View style={styles.mainInfo}>
          <Text style={styles.greetingText}>Namaste,</Text>
          <Text style={styles.ownerName}>{ownerName}</Text>
          
          <View style={styles.businessBadge}>
            <Feather name="map-pin" size={10} color="rgba(253, 252, 248, 0.6)" />
            <Text style={styles.businessName}>{businessName}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.avatarWrapper} activeOpacity={0.8}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={20} color="#5b643e" />
          </View>
          {isComplete && (
             <View style={styles.verifiedBadge}>
                <MaterialCommunityIcons name="check-bold" size={10} color="#FDFCF8" />
             </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View style={styles.footerRow}>
        {!isComplete ? (
          <View style={styles.progressContainer}>
            <View style={styles.progressTextRow}>
              <Text style={styles.progressLabel}>Profile Strength</Text>
              <Text style={styles.progressValue}>{completion}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${completion}%` }]} />
            </View>
          </View>
        ) : (
          <View style={styles.verifiedStatus}>
            <MaterialCommunityIcons name="shield-check" size={14} color="#EAB308" />
            <Text style={styles.verifiedText}>VERIFIED PARTNER</Text>
          </View>
        )}

        <TouchableOpacity style={styles.iconButton}>
          <Feather name="printer" size={16} color="#5b643e" />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 16,
    marginTop: 45,
    backgroundColor: "#aa3e36",
    padding: 18, // Reduced padding
    borderRadius: 20, // Slightly tighter corners
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  contentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mainInfo: {
    flex: 1,
  },
  greetingText: {
    fontFamily: "Poppins", // Use Poppins-Light if preferred
    color: "rgba(253, 252, 248, 0.7)",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  ownerName: {
    fontFamily: "Poppins-Bold", 
    color: "#FDFCF8",
    fontSize: 22, // Reduced from 30
    marginTop: -2,
  },
  businessBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  businessName: {
    fontFamily: "Jost-Medium",
    color: "rgba(253, 252, 248, 0.6)",
    fontSize: 12,
    marginLeft: 4,
  },
  avatarCircle: {
    width: 44, // Smaller avatar
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FDFCF8",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#EAB308",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#5b643e",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginVertical: 16,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  progressContainer: {
    flex: 1,
  },
  progressTextRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  progressLabel: {
    fontFamily: "Jost-Regular",
    color: "#FDFCF8",
    fontSize: 11,
  },
  progressValue: {
    fontFamily: "Jost-Bold",
    color: "#EAB308",
    fontSize: 11,
  },
  track: {
    height: 4,
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 2,
  },
  fill: {
    height: "100%",
    backgroundColor: "#EAB308",
    borderRadius: 2,
  },
  iconButton: {
    backgroundColor: "#FDFCF8",
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  verifiedText: {
    fontFamily: "Jost-Bold",
    color: "#EAB308",
    fontSize: 11,
    letterSpacing: 0.5,
  },
});
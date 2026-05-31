import React from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Platform 
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router"; // Import hooks

const NAV_ITEMS = [
  { id: "Home", icon: "home", route: "/" },
  { id: "Plans", icon: "layers", route: "/plans" }, // Matches plans/index.tsx
  { id: "Profile", icon: "profile", route: "/profile" },
  { id: "Subscriptions", icon: "credit-card", route: "/subscription" },
];

export default function FooterBar() {
  const router = useRouter();
  const pathname = usePathname(); // Detects current location for active styling

  return (
    <View style={styles.container}>
      <View style={styles.navBar}>
        {NAV_ITEMS.map((item) => {
          // Check if current path matches the item route
          const isActive = pathname === item.route;

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.navItem}
              onPress={() => router.push(item.route)} // Pushes to the route
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrapper, isActive && styles.activeIconWrapper]}>
                <Feather 
                  name={item.icon} 
                  size={16} 
                  color={isActive ? "#EAB308" : "rgba(253, 252, 248, 0.5)"} 
                />
              </View>
              
              <Text style={[styles.navText, isActive && styles.activeNavText]}>
                {item.id}
              </Text>

              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// ... styles remain the same
const styles = StyleSheet.create({
  container: {
    marginLeft:"auto",
    marginRight:"auto",
    width:"94%",
    marginBottom:28,
    backgroundColor: "#aa3e36", // Matches your Profile Card
    paddingBottom: Platform.OS === "ios" ? 25 : 12, 
    paddingTop: 6,
    borderRadius: 24, // Matches the Card's rounded feel
    // Shadow for elevation from bottom
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 20,
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  iconWrapper: {
    padding: 8,
    borderRadius: 16,
    marginBottom: 2,
  },
  activeIconWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.1)", // Subtle highlight
  },
  navText: {
    fontFamily: "Jost-Medium",
    fontSize: 10,
    color: "rgba(253, 252, 248, 0.5)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  activeNavText: {
    color: "#FDFCF8", // Pure Cream
    fontFamily: "Jost-Bold",
  },
  activeIndicator: {
    width: 12,
    height: 2,
    backgroundColor: "#EAB308", // Gold highlight
    borderRadius: 2,
    marginTop: 4,
  }
});
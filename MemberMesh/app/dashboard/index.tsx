import React from "react";
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Text,
  SafeAreaView 
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { logoutApi } from "../../constants/auth.api";
import FooterBar from "../components/FooterBar";
// Import your newly designed ProfileCard
import ProfileCard from "./components/profileCard";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logoutApi();
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.error("Logout failed", error);
      // Fallback to clear local state if API fails
      setUser(null);
      router.replace("/login");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card Section */}
        <ProfileCard business={user} />

        {/* Dashboard Content Area */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          {/* Example Action Grid */}
          <View style={styles.grid}>
             {/* Add your other dashboard tiles here */}
          </View>

          {/* Logout Button at bottom */}
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={20} color="#64748b" />
            <Text style={styles.logoutText}>Logout from Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <FooterBar/>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FBFAFC", // Matches the Verify OTP background
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 15,
    marginTop: 10,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 15,
    gap: 8,
    backgroundColor: "#fff"
  },
  logoutText: {
    color: "#64748b",
    fontWeight: "700",
    fontSize: 14,
  },
});
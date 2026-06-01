import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator,
  TextInput,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { logoutApi, updateProfileApi } from "../../constants/auth.api";
import FooterBar from "../components/FooterBar";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#EFF6FF",
  surface: "#FFFFFF",
  brand: "#1e3a8a",
  brandLight: "#3b82f6",
  brandXLight: "#DBEAFE",
  text: "#0f172a",
  textMid: "#475569",
  textSoft: "#94a3b8",
  border: "#e2e8f0",
  danger: "#ef4444",
  dangerLight: "#fee2e2",
  success: "#10b981",
  successLight: "#d1fae5",
};

export default function Profile() {
  const { user, setUser, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    ownerName: "",
    businessName: "",
    gstNumber: "",
    upiId: "",
    location: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        ownerName: user?.ownerName || "",
        businessName: user?.businessName || "",
        gstNumber: user?.gstNumber || "",
        upiId: user?.upiId || "",
        location: user?.location || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.ownerName.trim() || !formData.businessName.trim()) {
      Alert.alert("Error", "Owner Name and Business Name are required");
      return;
    }
    setIsSaving(true);
    try {
      const response = await updateProfileApi(formData);
      setUser(response.data.shop);
      setIsEditMode(false);
      Alert.alert("Success", "Profile updated successfully");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        ownerName: user?.ownerName || "",
        businessName: user?.businessName || "",
        gstNumber: user?.gstNumber || "",
        upiId: user?.upiId || "",
        location: user?.location || "",
      });
    }
    setIsEditMode(false);
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          setIsLoggingOut(true);
          try {
            await logoutApi();
            setUser(null);
            router.replace("/login");
          } catch {
            setUser(null);
            router.replace("/login");
          } finally {
            setIsLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={["top", "left", "right"]}>
        <ActivityIndicator size="large" color={C.brand} />
      </SafeAreaView>
    );
  }

  const profileData = [
    {
      id: 1,
      label: "Owner Name",
      key: "ownerName",
      value: user?.ownerName || "N/A",
      icon: "user",
      color: C.brand,
    },
    {
      id: 2,
      label: "Business Name",
      key: "businessName",
      value: user?.businessName || "N/A",
      icon: "briefcase",
      color: "#8b5cf6",
    },
    {
      id: 3,
      label: "Mobile Number",
      key: "mobileNumber",
      value: user?.mobileNumber || "N/A",
      icon: "phone",
      color: "#ec4899",
      disabled: true,
    },
    {
      id: 4,
      label: "GST Number",
      key: "gstNumber",
      value: user?.gstNumber || "N/A",
      icon: "file-text",
      color: "#f59e0b",
    },
    {
      id: 5,
      label: "UPI ID",
      key: "upiId",
      value: user?.upiId || "N/A",
      icon: "credit-card",
      color: C.success,
    },
    {
      id: 6,
      label: "Location",
      key: "location",
      value: user?.location || "N/A",
      icon: "map-pin",
      color: C.danger,
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.75}>
            <Feather name="arrow-left" size={16} color={C.brand} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ── Avatar Section ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={36} color={C.brand} />
          </View>
          <Text style={styles.userName}>
            {user?.ownerName?.trim() || "User"}
          </Text>
          <Text style={styles.businessNameSubtitle}>
            {user?.businessName?.trim() || "My Business"}
          </Text>
        </View>

        {/* ── Profile Details ── */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            {!isEditMode && (
              <TouchableOpacity onPress={() => setIsEditMode(true)} style={styles.editButton}>
                <Feather name="edit-2" size={15} color={C.brand} />
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            <>
              {profileData.map((item) => (
                <View key={item.id} style={styles.editCard}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + "18" }]}>
                    <Feather name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={styles.editFieldContainer}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <TextInput
                      style={[styles.textInput, item.disabled && styles.disabledInput]}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      value={
                        item.key === "mobileNumber"
                          ? user?.mobileNumber || ""
                          : formData[item.key as keyof typeof formData]
                      }
                      onChangeText={(text) => {
                        if (item.key !== "mobileNumber") {
                          setFormData((prev) => ({ ...prev, [item.key]: text }));
                        }
                      }}
                      editable={!item.disabled}
                      placeholderTextColor={C.textSoft}
                    />
                  </View>
                </View>
              ))}

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.cancelBtn]}
                  onPress={handleCancel}
                  disabled={isSaving}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.saveBtn]}
                  onPress={handleSave}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.saveBtnText}>Save Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {profileData.map((item) => (
                <View key={item.id} style={styles.detailCard}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + "18" }]}>
                    <Feather name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{item.value}</Text>
                  </View>
                  <Feather name="chevron-right" size={18} color={C.border} />
                </View>
              ))}
            </>
          )}
        </View>

        {/* ── Account Actions ── */}
        {!isEditMode && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Account</Text>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={isLoggingOut}
              activeOpacity={0.75}
            >
              <View style={[styles.iconContainer, { backgroundColor: C.dangerLight }]}>
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color={C.danger} />
                ) : (
                  <MaterialCommunityIcons name="logout" size={18} color={C.danger} />
                )}
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailValue, { color: C.danger }]}>
                  {isLoggingOut ? "Logging out…" : "Logout"}
                </Text>
                <Text style={styles.detailLabel}>Sign out from your account</Text>
              </View>
              <Feather name="chevron-right" size={18} color={isLoggingOut ? C.border : C.danger} />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <FooterBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    backgroundColor: C.bg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: C.brandXLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.3,
  },

  // ── Avatar ────────────────────────────────────────────────────────────────
  avatarSection: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: C.brandXLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
    borderWidth: 2,
    borderColor: C.brandLight + "40",
  },
  userName: {
    fontSize: 20,
    fontWeight: "800",
    color: C.text,
    marginBottom: 4,
    letterSpacing: -0.4,
  },
  businessNameSubtitle: {
    fontSize: 13,
    color: C.textSoft,
    fontWeight: "500",
  },

  // ── Details ───────────────────────────────────────────────────────────────
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: C.brandXLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.border,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.2,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "rgba(30, 58, 138, 0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  editCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 13,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
    shadowColor: "rgba(30, 58, 138, 0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    flexShrink: 0,
  },
  detailContent: {
    flex: 1,
  },
  editFieldContainer: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 11,
    color: C.textSoft,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 3,
  },
  detailValue: {
    fontSize: 14,
    color: C.text,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: C.border,
    borderRadius: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    fontSize: 14,
    color: C.text,
    fontWeight: "500",
    marginTop: 4,
    backgroundColor: C.bg,
  },
  disabledInput: {
    backgroundColor: "#f1f5f9",
    color: C.textSoft,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  buttonContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
    marginBottom: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  saveBtn: {
    backgroundColor: C.brand,
    shadowColor: C.brand,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: C.surface,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  cancelBtnText: {
    color: C.textMid,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── Account ───────────────────────────────────────────────────────────────
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: C.surface,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: C.dangerLight,
    shadowColor: "rgba(239, 68, 68, 0.08)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 2,
  },
});

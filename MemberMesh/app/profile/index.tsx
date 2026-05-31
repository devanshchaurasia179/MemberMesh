import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useAuth } from "../../providers/AuthProvider";
import { logoutApi, updateProfileApi } from "../../constants/auth.api";
import FooterBar from "../components/FooterBar";

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

  // Initialize form data when user data loads
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
    // Reset form data to original user data
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
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", onPress: () => {}, style: "cancel" },
        {
          text: "Logout",
          onPress: async () => {
            setIsLoggingOut(true);
            try {
              await logoutApi();
              setUser(null);
              router.replace("/login");
            } catch (error) {
              console.error("Logout failed", error);
              // Fallback to clear local state if API fails
              setUser(null);
              router.replace("/login");
            } finally {
              setIsLoggingOut(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#aa3e36" />
      </View>
    );
  }

  const profileData = [
    {
      id: 1,
      label: "Owner Name",
      key: "ownerName",
      value: user?.ownerName || "N/A",
      icon: "user",
      color: "#3b82f6",
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
      color: "#10b981",
    },
    {
      id: 6,
      label: "Location",
      key: "location",
      value: user?.location || "N/A",
      icon: "map-pin",
      color: "#ef4444",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={{ width: 24 }} />
          </View>
        </View>

        {/* Profile Avatar Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Feather name="user" size={40} color="#5b643e" />
          </View>
          <Text style={styles.userName}>
            {user?.ownerName?.trim() || "User"}
          </Text>
          <Text style={styles.businessNameSubtitle}>
            {user?.businessName?.trim() || "My Business"}
          </Text>
        </View>

        {/* Profile Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailsHeader}>
            <Text style={styles.sectionTitle}>Business Information</Text>
            {!isEditMode && (
              <TouchableOpacity
                onPress={() => setIsEditMode(true)}
                style={styles.editButton}
              >
                <MaterialCommunityIcons name="pencil" size={18} color="#3b82f6" />
              </TouchableOpacity>
            )}
          </View>

          {isEditMode ? (
            // Edit Mode - Show Input Fields
            <>
              {profileData.map((item) => (
                <View key={item.id} style={styles.editCard}>
                  <View style={[styles.iconContainer, { backgroundColor: item.color + "20" }]}>
                    <Feather name={item.icon as any} size={20} color={item.color} />
                  </View>

                  <View style={styles.editFieldContainer}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <TextInput
                      style={[
                        styles.textInput,
                        item.disabled && styles.disabledInput,
                      ]}
                      placeholder={`Enter ${item.label.toLowerCase()}`}
                      value={
                        item.key === "mobileNumber"
                          ? user?.mobileNumber || ""
                          : formData[item.key as keyof typeof formData]
                      }
                      onChangeText={(text) => {
                        if (item.key !== "mobileNumber") {
                          setFormData((prev) => ({
                            ...prev,
                            [item.key]: text,
                          }));
                        }
                      }}
                      editable={!item.disabled}
                      placeholderTextColor="#d1d5db"
                    />
                  </View>
                </View>
              ))}

              {/* Save and Cancel Buttons */}
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
            // View Mode - Show Cards
            <>
              {profileData.map((item) => (
                <View key={item.id} style={styles.detailCard}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: item.color + "20" },
                    ]}
                  >
                    <Feather
                      name={item.icon as any}
                      size={20}
                      color={item.color}
                    />
                  </View>

                  <View style={styles.detailContent}>
                    <Text style={styles.detailLabel}>{item.label}</Text>
                    <Text style={styles.detailValue}>{item.value}</Text>
                  </View>

                  <Feather name="chevron-right" size={20} color="#d1d5db" />
                </View>
              ))}
            </>
          )}
        </View>

        {/* Account Actions */}
        {!isEditMode && (
          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Account</Text>

            {/* Logout Button */}
            <TouchableOpacity
              style={[styles.actionButton, styles.logoutButton]}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: "#fee2e2" },
                ]}
              >
                {isLoggingOut ? (
                  <ActivityIndicator size="small" color="#ef4444" />
                ) : (
                  <MaterialCommunityIcons
                    name="logout"
                    size={18}
                    color="#ef4444"
                  />
                )}
              </View>
              <View style={styles.actionContent}>
                <Text style={[styles.actionLabel, { color: "#ef4444" }]}>
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </Text>
                <Text style={styles.actionSubtitle}>
                  Sign out from your account
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={isLoggingOut ? "#d1d5db" : "#ef4444"}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Footer Spacing */}
        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Footer Bar */}
      <FooterBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  avatarSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 16,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#fef3c7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 4,
  },
  businessNameSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  detailsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  editButton: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
    marginBottom: 12,
    marginLeft: 4,
  },
  detailCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  editCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 4,
  },
  detailContent: {
    flex: 1,
  },
  editFieldContainer: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
    marginTop: 6,
  },
  disabledInput: {
    backgroundColor: "#f3f4f6",
    color: "#9ca3af",
  },
  detailLabel: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  saveBtn: {
    backgroundColor: "#10b981",
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  cancelBtn: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelBtnText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
  },
  actionsSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 6,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#eff6ff",
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 15,
    color: "#1f2937",
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "500",
  },
  footerSpacing: {
    height: 20,
  },
});

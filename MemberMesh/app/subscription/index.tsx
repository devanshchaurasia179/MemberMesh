import React, { useState, useEffect } from "react";
import {
  View, Text, FlatList, TouchableOpacity,
  ActivityIndicator, StyleSheet, StatusBar, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  useSubscriptions,
  useCreateSubscription,
  useUpdateSubscription,
  useRenewSubscription,
  useCancelSubscription,
} from "../../hooks/useSubscription";
import { usePlans } from "../../hooks/useMembership";
import type { Subscription } from "../../constants/subscription.api";
import SubscriptionCard from "./components/SubscriptionCard";
import CreateSubscriptionModal from "./components/CreateSubscriptionModal";
import EditSubscriptionModal from "./components/EditSubscriptionModal";
import RenewSubscriptionModal from "./components/RenewSubscriptionModal";
import CancelConfirmationModal from "./components/CancelConfirmationModal";
import { isThermalPrinterSaved } from "../../utils/printerManager";
import { printRenewalReceipt, printSubscriptionReceipt } from "../../utils/thermalPrinter";

export default function SubscriptionScreen() {
  const router = useRouter();
  const { data: subscriptions, isLoading } = useSubscriptions();
  const { data: plans } = usePlans();
  const { mutate: createSubscription } = useCreateSubscription();
  const { mutate: updateSubscription } = useUpdateSubscription();
  const { mutate: renewSubscription } = useRenewSubscription();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();

  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [renewModalVisible, setRenewModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [isPrinterConnected, setIsPrinterConnected] = useState(false);

  useEffect(() => {
    checkPrinterStatus();
  }, []);

  const checkPrinterStatus = async () => {
    try {
      const hasSaved = await isThermalPrinterSaved();
      setIsPrinterConnected(hasSaved);
    } catch {
      setIsPrinterConnected(false);
    }
  };

  const handleEdit = (sub: Subscription) => {
    setSelectedSubscription(sub);
    setEditModalVisible(true);
  };

  const handleRenew = (sub: Subscription) => {
    console.log("Opening renew modal for subscription:", sub._id, "Status:", sub.status);
    setSelectedSubscription(sub);
    setRenewModalVisible(true);
  };

  const handlePrintRenewal = async (subscription: Subscription) => {
    if (!isPrinterConnected) {
      Alert.alert(
        "Printer Not Connected",
        "Would you like to set up a printer?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Setup Printer", onPress: () => router.push("/printer") },
        ]
      );
      return;
    }

    try {
      await printRenewalReceipt(subscription);
    } catch (error: any) {
      Alert.alert("Print Failed", error?.message || "Could not print receipt");
    }
  };

  const handlePrintSubscription = async (subscription: Subscription) => {
    if (!isPrinterConnected) {
      Alert.alert(
        "Printer Not Connected",
        "Would you like to set up a printer?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Setup Printer", onPress: () => router.push("/printer") },
        ]
      );
      return;
    }

    try {
      await printSubscriptionReceipt(subscription);
    } catch (error: any) {
      Alert.alert("Print Failed", error?.message || "Could not print receipt");
    }
  };

  const handleCancel = (sub: Subscription) => {
    console.log("handleCancel called for subscription:", sub._id);
    setSelectedSubscription(sub);
    setCancelModalVisible(true);
  };

  const confirmCancel = () => {
    if (!selectedSubscription) return;
    
    console.log("User confirmed cancel, calling mutation...");
    cancelSubscription(selectedSubscription._id, {
      onSuccess: () => {
        console.log("Cancel successful!");
        setCancelModalVisible(false);
        setSelectedSubscription(null);
        Alert.alert("Success", "Subscription cancelled successfully");
      },
      onError: (error: any) => {
        console.error("Cancel error:", error);
        setCancelModalVisible(false);
        Alert.alert(
          "Error",
          error?.response?.data?.message || "Failed to cancel subscription. Please try again."
        );
      },
    });
  };



  const renderItem = ({ item }: { item: Subscription }) => (
    <SubscriptionCard
      item={item}
      onEdit={handleEdit}
      onRenew={handleRenew}
      onCancel={handleCancel}
      isCancelling={isCancelling}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7F77DD" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Subscriptions</Text>
          <Text style={styles.subtitle}>Manage member subscriptions</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.printerBtn}
            onPress={() => router.push("/printer")}
          >
            <Feather name="printer" size={15} color="#3C3489" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setCreateModalVisible(true)}
          >
            <Feather name="plus" size={15} color="#3C3489" />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={subscriptions}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No subscriptions yet</Text>
          </View>
        }
      />

      <CreateSubscriptionModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onSubmit={(data) => {
          createSubscription(data, {
            onSuccess: (newSubscription) => {
              setCreateModalVisible(false);
              Alert.alert(
                "Success",
                "Subscription created successfully",
                [
                  { text: "OK" },
                  {
                    text: "Print Receipt",
                    onPress: () => handlePrintSubscription(newSubscription as Subscription),
                  },
                ]
              );
            },
            onError: (error: any) => {
              Alert.alert(
                "Error",
                error?.response?.data?.message || "Failed to create subscription"
              );
            },
          });
        }}
        plans={plans || []}
      />

      <EditSubscriptionModal
        visible={editModalVisible}
        onClose={() => {
          setEditModalVisible(false);
          setSelectedSubscription(null);
        }}
        onSubmit={(data) => {
          if (selectedSubscription) {
            updateSubscription(
              { id: selectedSubscription._id, payload: data },
              {
                onSuccess: () => {
                  setEditModalVisible(false);
                  setSelectedSubscription(null);
                  Alert.alert("Success", "Subscription updated successfully");
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Error",
                    error?.response?.data?.message || "Failed to update subscription"
                  );
                },
              }
            );
          }
        }}
        subscription={selectedSubscription}
      />

      <RenewSubscriptionModal
        visible={renewModalVisible}
        onClose={() => {
          setRenewModalVisible(false);
          setSelectedSubscription(null);
        }}
        onSubmit={(data) => {
          if (selectedSubscription) {
            renewSubscription(
              { id: selectedSubscription._id, payload: data },
              {
                onSuccess: (renewedSubscription) => {
                  setRenewModalVisible(false);
                  const subToUse = renewedSubscription || selectedSubscription;
                  setSelectedSubscription(null);
                  Alert.alert(
                    "Success",
                    "Subscription renewed successfully",
                    [
                      { text: "OK" },
                      {
                        text: "Print Receipt",
                        onPress: () => handlePrintRenewal(subToUse as Subscription),
                      },
                    ]
                  );
                },
                onError: (error: any) => {
                  Alert.alert(
                    "Error",
                    error?.response?.data?.message || "Failed to renew subscription"
                  );
                },
              }
            );
          }
        }}
        subscription={selectedSubscription}
      />

      <CancelConfirmationModal
        visible={cancelModalVisible}
        onClose={() => {
          setCancelModalVisible(false);
          setSelectedSubscription(null);
        }}
        onConfirm={confirmCancel}
        subscription={selectedSubscription}
        isLoading={isCancelling}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F7FF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: { fontSize: 24, fontWeight: "600", color: "#1E1B4B", letterSpacing: -0.3 },
  subtitle: { fontSize: 13, color: "#6B6B8A", marginTop: 3 },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  printerBtn: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#C4BAF7",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#C4BAF7",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addBtnText: { color: "#3C3489", fontWeight: "600", fontSize: 14 },
  listContent: { paddingHorizontal: 16, paddingBottom: 40 },
  emptyContainer: { marginTop: 100, alignItems: "center" },
  emptyText: { color: "#9B99B0", fontSize: 15 },
});

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  StatusBar,
  Platform,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Safely import Bluetooth printer - will be null in Expo Go
let BluetoothEscposPrinter: any = null;
try {
  BluetoothEscposPrinter = require("@vardrz/react-native-bluetooth-escpos-printer").BluetoothEscposPrinter;
} catch (error) {
  console.log("Bluetooth printer not available in Expo Go");
}

import { requestBluetoothPermission } from "../../utils/bluetoothPermission";
import {
  scanThermalPrinters,
  isThermalPrinterSaved,
  getConnectedThermalPrinter,
  reconnectSavedPrinter,
  clearSavedPrinter,
} from "../../utils/printerManager";
import { connectPrinter, printTestReceipt } from "../../utils/thermalPrinter";

type DeviceType = {
  address: string;
  name?: string;
  type: "Paired" | "Nearby";
};

type PrinterStatus = "none" | "connected" | "offline";

export default function PrinterSetupScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<PrinterStatus>("none");
  const [devices, setDevices] = useState<DeviceType[]>([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [localConnectedPrinter, setLocalConnectedPrinter] = useState<{
    address: string;
    name?: string;
  } | null>(null);

  useEffect(() => {
    if (!BluetoothEscposPrinter) {
      Alert.alert(
        "Not Available in Expo Go",
        "Bluetooth printer functionality requires a development build. Please build the app with EAS or use 'npx expo run:android'.",
        [{ text: "OK", onPress: () => router.back() }]
      );
      return;
    }
    checkPrinterStatus();
  }, []);

  const checkPrinterStatus = async () => {
    const hasSaved = await isThermalPrinterSaved();
    if (!hasSaved) {
      setStatus("none");
      setLocalConnectedPrinter(null);
      return;
    }

    const printer = await getConnectedThermalPrinter();
    setLocalConnectedPrinter(printer);

    // Test if printer is actually reachable
    const isReachable = await testRealConnection();
    setStatus(isReachable ? "connected" : "offline");
  };

  const testRealConnection = async (): Promise<boolean> => {
    if (!BluetoothEscposPrinter) return false;
    try {
      await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleScan = async () => {
    if (!BluetoothEscposPrinter) {
      Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
      return;
    }
    
    const hasPermission = await requestBluetoothPermission();
    if (!hasPermission) return;

    setScanning(true);
    const foundDevices = await scanThermalPrinters();
    setDevices(foundDevices);
    setScanning(false);
  };

  const handleConnect = async (device: DeviceType) => {
    setConnecting(device.address);
    try {
      await connectPrinter(device.address, device.name);
      Alert.alert("Success", `Connected to ${device.name || device.address}`);
      
      // Update status
      const isReachable = await testRealConnection();
      setStatus(isReachable ? "connected" : "offline");
      setLocalConnectedPrinter({ address: device.address, name: device.name });
      setDevices([]);
    } catch (error: any) {
      Alert.alert("Connection Failed", error?.message || "Could not connect to printer");
    } finally {
      setConnecting(null);
    }
  };

  const handleReconnect = async () => {
    setConnecting("reconnect");
    try {
      const success = await reconnectSavedPrinter();
      if (success) {
        const isReachable = await testRealConnection();
        setStatus(isReachable ? "connected" : "offline");
        Alert.alert("Success", "Reconnected to printer");
      } else {
        setStatus("offline");
        Alert.alert("Failed", "Could not reconnect. Try scanning again.");
      }
    } catch (error: any) {
      setStatus("offline");
      Alert.alert("Error", error?.message || "Reconnection failed");
    } finally {
      setConnecting(null);
    }
  };

  const handleForgetPrinter = () => {
    Alert.alert(
      "Forget Printer",
      "Are you sure you want to remove this printer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Forget",
          style: "destructive",
          onPress: async () => {
            await clearSavedPrinter();
            setStatus("none");
            setLocalConnectedPrinter(null);
          },
        },
      ]
    );
  };

  const handleTestPrint = async () => {
    if (status !== "connected") {
      Alert.alert("Not Connected", "Please connect to a printer first");
      return;
    }

    try {
      await printTestReceipt();
    } catch (error: any) {
      Alert.alert("Print Failed", error?.message || "Could not print test receipt");
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case "connected":
        return "#10b981";
      case "offline":
        return "#f59e0b";
      default:
        return "#94a3b8";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case "connected":
        return "Connected";
      case "offline":
        return "Offline";
      default:
        return "No Printer";
    }
  };

  const renderDevice = ({ item }: { item: DeviceType }) => (
    <TouchableOpacity
      style={styles.deviceCard}
      onPress={() => handleConnect(item)}
      disabled={connecting !== null}
    >
      <View style={styles.deviceInfo}>
        <Ionicons name="print-outline" size={24} color="#7F77DD" />
        <View style={styles.deviceText}>
          <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
          <Text style={styles.deviceAddress}>{item.address}</Text>
        </View>
        <View
          style={[
            styles.deviceTypeBadge,
            { backgroundColor: item.type === "Paired" ? "#dbeafe" : "#fef3c7" },
          ]}
        >
          <Text
            style={[
              styles.deviceTypeText,
              { color: item.type === "Paired" ? "#1e40af" : "#92400e" },
            ]}
          >
            {item.type}
          </Text>
        </View>
      </View>
      {connecting === item.address && (
        <ActivityIndicator size="small" color="#7F77DD" style={styles.deviceLoader} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E1B4B" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.title}>Printer Setup</Text>
          <Text style={styles.subtitle}>Configure thermal printer</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <View style={styles.statusLeft}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={styles.statusText}>{getStatusText()}</Text>
          </View>
          {localConnectedPrinter && (
            <TouchableOpacity onPress={handleForgetPrinter} style={styles.forgetButton}>
              <Feather name="trash-2" size={16} color="#ef4444" />
            </TouchableOpacity>
          )}
        </View>

        {localConnectedPrinter && (
          <View style={styles.printerInfo}>
            <Text style={styles.printerName}>
              {localConnectedPrinter.name || "Thermal Printer"}
            </Text>
            <Text style={styles.printerAddress}>{localConnectedPrinter.address}</Text>
          </View>
        )}

        {status === "offline" && localConnectedPrinter && (
          <TouchableOpacity
            style={styles.reconnectButton}
            onPress={handleReconnect}
            disabled={connecting === "reconnect"}
          >
            {connecting === "reconnect" ? (
              <ActivityIndicator size="small" color="#7F77DD" />
            ) : (
              <>
                <Feather name="refresh-cw" size={16} color="#7F77DD" />
                <Text style={styles.reconnectText}>Reconnect</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {status === "connected" && (
          <TouchableOpacity style={styles.testButton} onPress={handleTestPrint}>
            <Feather name="printer" size={16} color="#fff" />
            <Text style={styles.testButtonText}>Test Print</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Scan Button */}
      <TouchableOpacity
        style={styles.scanButton}
        onPress={handleScan}
        disabled={scanning}
      >
        {scanning ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Feather name="search" size={18} color="#fff" />
            <Text style={styles.scanButtonText}>Scan for Printers</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Device List */}
      {devices.length > 0 && (
        <View style={styles.deviceListContainer}>
          <Text style={styles.deviceListTitle}>Available Devices</Text>
          <FlatList
            data={devices}
            keyExtractor={(item) => item.address}
            renderItem={renderDevice}
            contentContainerStyle={styles.deviceList}
          />
        </View>
      )}

      {/* Instructions */}
      {devices.length === 0 && !scanning && (
        <View style={styles.instructions}>
          <Ionicons name="information-circle-outline" size={48} color="#cbd5e1" />
          <Text style={styles.instructionsTitle}>How to Connect</Text>
          <Text style={styles.instructionsText}>
            1. Turn on your thermal printer{"\n"}
            2. Make sure Bluetooth is enabled{"\n"}
            3. Tap "Scan for Printers"{"\n"}
            4. Select your printer from the list
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7FF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerSpacer: {
    width: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1E1B4B",
  },
  subtitle: {
    fontSize: 12,
    color: "#6B6B8A",
    marginTop: 2,
  },
  statusCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E1B4B",
  },
  forgetButton: {
    padding: 8,
  },
  printerInfo: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  printerName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#334155",
  },
  printerAddress: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },
  reconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#F3F1FF",
    borderRadius: 12,
  },
  reconnectText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#7F77DD",
  },
  testButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: "#7F77DD",
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  scanButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: "#7F77DD",
    borderRadius: 16,
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  deviceListContainer: {
    flex: 1,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  deviceListTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E1B4B",
    marginBottom: 12,
  },
  deviceList: {
    gap: 10,
  },
  deviceCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deviceText: {
    flex: 1,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1E1B4B",
  },
  deviceAddress: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 2,
  },
  deviceTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  deviceTypeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  deviceLoader: {
    marginTop: 12,
  },
  instructions: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    marginTop: 40,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#334155",
    marginTop: 16,
    marginBottom: 12,
  },
  instructionsText: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
  },
});

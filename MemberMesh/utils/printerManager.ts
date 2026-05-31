import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Safely import Bluetooth printer - will be null in Expo Go
let BluetoothManager: any = null;
try {
  BluetoothManager = require("@vardrz/react-native-bluetooth-escpos-printer").BluetoothManager;
} catch (error) {
  console.log("Bluetooth printer not available in Expo Go");
}

const STORAGE_KEY = "@selected_thermal_printer";

type PrinterInfo = {
  address: string;
  name?: string;
};

let cachedPrinter: PrinterInfo | null = null;

/**
 * Load saved printer from storage (lazy)
 */
const loadSavedPrinter = async (): Promise<void> => {
  if (cachedPrinter !== null) return;

  try {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (saved) {
      cachedPrinter = JSON.parse(saved);
      console.log("Loaded saved printer:", cachedPrinter.name || cachedPrinter.address);
    }
  } catch (error) {
    console.warn("Failed to load saved printer:", error);
  }
};

/**
 * Safely disconnect ONLY if we have a saved printer address
 */
export const safeDisconnectPrinter = async (): Promise<void> => {
  if (!BluetoothManager) {
    console.log("BluetoothManager not available");
    return;
  }
  
  if (!cachedPrinter?.address) {
    console.log("No printer saved → skipping disconnect");
    return;
  }

  try {
    await BluetoothManager.disconnect(cachedPrinter.address);
    console.log("Successfully disconnected from:", cachedPrinter.address);
  } catch (error: any) {
    console.warn("Disconnect failed (ignored):", error.message || error);
  }
};

/**
 * Scan for paired and nearby thermal printers
 */
export const scanThermalPrinters = async (): Promise<
  Array<{ address: string; name?: string; type: "Paired" | "Nearby" }>
> => {
  if (!BluetoothManager) {
    Alert.alert(
      "Not Available",
      "Bluetooth printer functionality requires a development build."
    );
    return [];
  }
  
  try {
    const isEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isEnabled) {
      Alert.alert(
        "Bluetooth Disabled",
        "Please turn on Bluetooth to scan for printers."
      );
      return [];
    }

    const result = await BluetoothManager.scanDevices();
    const parsed = JSON.parse(result);

    const devices = [
      ...(parsed.paired || []).map((d: any) => ({ ...d, type: "Paired" as const })),
      ...(parsed.found || []).map((d: any) => ({ ...d, type: "Nearby" as const })),
    ];

    if (devices.length === 0) {
      Alert.alert(
        "No Printers Found",
        "Tips:\n• Power on your thermal printer\n• Hold the FEED button while turning on until it beeps/flashes\n• Make sure Location permission is granted"
      );
    }

    return devices;
  } catch (error: any) {
    console.error("Scan failed:", error);
    Alert.alert("Scan Error", error?.message || "Unable to scan for printers. Try again.");
    return [];
  }
};

/**
 * Save printer after successful connection
 */
export const setConnectedPrinter = async (
  address: string,
  name?: string
): Promise<void> => {
  cachedPrinter = { address, name: name || "Thermal Printer" };
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cachedPrinter));
    console.log("Printer saved:", cachedPrinter.name || address);
  } catch (error) {
    console.warn("Failed to save printer:", error);
  }
};

/**
 * Get current saved printer
 */
export const getConnectedThermalPrinter = async (): Promise<PrinterInfo | null> => {
  await loadSavedPrinter();
  return cachedPrinter;
};

/**
 * Check if a printer is saved
 */
export const isThermalPrinterSaved = async (): Promise<boolean> => {
  await loadSavedPrinter();
  return cachedPrinter !== null;
};

/**
 * Clear saved printer
 */
export const clearSavedPrinter = async (): Promise<void> => {
  cachedPrinter = null;
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
    Alert.alert("Printer Reset", "Saved printer cleared. You can scan and connect a new one.");
  } catch (error) {
    console.warn("Failed to clear printer:", error);
  }
};

/**
 * Reconnect saved printer WITHOUT scanning
 */
export const reconnectSavedPrinter = async (): Promise<boolean> => {
  if (!BluetoothManager) {
    console.log("BluetoothManager not available");
    return false;
  }
  
  await loadSavedPrinter();

  if (!cachedPrinter?.address) {
    console.log("No saved printer to reconnect");
    return false;
  }

  try {
    const isEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isEnabled) {
      Alert.alert("Bluetooth Disabled", "Please turn on Bluetooth to connect printer.");
      return false;
    }

    await BluetoothManager.connect(cachedPrinter.address);
    console.log("Reconnected to printer:", cachedPrinter.address);
    return true;
  } catch (error: any) {
    console.warn("Reconnect failed:", error.message || error);
    return false;
  }
};

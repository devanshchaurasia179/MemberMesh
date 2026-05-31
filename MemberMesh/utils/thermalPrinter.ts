import { Alert } from "react-native";
import { setConnectedPrinter } from "./printerManager";

// Safely import Bluetooth printer - will be null in Expo Go
let BluetoothEscposPrinter: any = null;
let BluetoothManager: any = null;
try {
  const module = require("@vardrz/react-native-bluetooth-escpos-printer");
  BluetoothEscposPrinter = module.BluetoothEscposPrinter;
  BluetoothManager = module.BluetoothManager;
} catch (error) {
  console.log("Bluetooth printer not available in Expo Go");
}

/**
 * Helper to convert long unit names to shorthand
 */
const getUnitShorthand = (unit: string): string => {
  const lowerUnit = (unit || "").toLowerCase().trim();
  switch (lowerUnit) {
    case "liter":
    case "liters":
    case "litre":
    case "litres":
      return "ltr";
    case "dozen":
    case "dozens":
      return "dzn";
    case "kilogram":
    case "kilograms":
    case "kg":
      return "kg";
    case "piece":
    case "pieces":
      return "pcs";
    case "month":
    case "months":
      return "mo";
    case "year":
    case "years":
      return "yr";
    default:
      return lowerUnit || "unit";
  }
};

/**
 * Connect to a Bluetooth thermal printer
 */
export const connectPrinter = async (
  address: string,
  name?: string
): Promise<void> => {
  if (!BluetoothManager) {
    Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
    throw new Error("Bluetooth printer not available");
  }
  
  try {
    const isEnabled = await BluetoothManager.isBluetoothEnabled();
    if (!isEnabled) {
      Alert.alert("Bluetooth Off", "Please turn on Bluetooth and try again.");
      return;
    }

    let connected = false;

    // Try normal connection
    try {
      await BluetoothManager.connect(address);
      connected = true;
    } catch (err: any) {
      console.log("Normal connection failed:", err.message);
    }

    // Try with channel 1 hack (some printers need this)
    if (!connected) {
      try {
        await BluetoothManager.connect(address + ",1");
        connected = true;
      } catch (err: any) {
        console.log("Channel 1 hack failed:", err.message);
      }
    }

    if (connected) {
      await setConnectedPrinter(address, name);
      return;
    }

    Alert.alert("Connection Failed", "Please ensure printer is on and paired.");
    throw new Error("Failed to connect");
  } catch (error: any) {
    throw error;
  }
};

/**
 * Print subscription renewal receipt
 */
export const printRenewalReceipt = async (subscription: any): Promise<void> => {
  if (!BluetoothEscposPrinter) {
    Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
    throw new Error("Bluetooth printer not available");
  }
  
  try {
    // Extract subscription data
    const memberName = subscription.memberId?.name || "Member";
    const planName = subscription.planId?.name || "Plan";
    const duration = subscription.planId?.duration || 1;
    const durationType = subscription.planId?.durationType || "month";
    const amount = subscription.amount || 0;
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const renewedAt = new Date(subscription.updatedAt || Date.now());

    // Initialize printer
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.setBlob(0);

    // Header
    await BluetoothEscposPrinter.printText("MEMBERSHIP RENEWAL\n\r", { bold: true });
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Member Info
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Member: ${memberName}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Plan: ${planName}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Duration: ${duration} ${getUnitShorthand(durationType)}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Dates
    const startDateStr = startDate.toLocaleDateString();
    const endDateStr = endDate.toLocaleDateString();
    const renewedAtStr = renewedAt.toLocaleDateString();
    const renewedTimeStr = renewedAt
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\u202f/g, " ");

    await BluetoothEscposPrinter.printText(`Start Date: ${startDateStr}\n\r`, {});
    await BluetoothEscposPrinter.printText(`End Date: ${endDateStr}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Renewed: ${renewedAtStr} ${renewedTimeStr}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Amount
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printText(`Amount Paid: Rs.${amount}\n\r`, {
      bold: true,
    });

    // Footer
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText(
      "\n\r\n\rThank you for renewing!\n\r\n\r\n\r\n\r",
      {}
    );
    await BluetoothEscposPrinter.cutOnePoint();

    Alert.alert("Success", "Renewal receipt printed!");
  } catch (error: any) {
    Alert.alert("Print Failed", error?.message || "Check connection.");
    throw error;
  }
};

/**
 * Print new subscription receipt
 */
export const printSubscriptionReceipt = async (subscription: any): Promise<void> => {
  if (!BluetoothEscposPrinter) {
    Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
    throw new Error("Bluetooth printer not available");
  }
  
  try {
    // Extract subscription data
    const memberName = subscription.memberId?.name || "Member";
    const planName = subscription.planId?.name || "Plan";
    const duration = subscription.planId?.duration || 1;
    const durationType = subscription.planId?.durationType || "month";
    const amount = subscription.amount || 0;
    const startDate = new Date(subscription.startDate);
    const endDate = new Date(subscription.endDate);
    const createdAt = new Date(subscription.createdAt || Date.now());

    // Initialize printer
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.setBlob(0);

    // Header
    await BluetoothEscposPrinter.printText("NEW MEMBERSHIP\n\r", { bold: true });
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Member Info
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Member: ${memberName}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Plan: ${planName}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Duration: ${duration} ${getUnitShorthand(durationType)}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Dates
    const startDateStr = startDate.toLocaleDateString();
    const endDateStr = endDate.toLocaleDateString();
    const createdAtStr = createdAt.toLocaleDateString();
    const createdTimeStr = createdAt
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\u202f/g, " ");

    await BluetoothEscposPrinter.printText(`Start Date: ${startDateStr}\n\r`, {});
    await BluetoothEscposPrinter.printText(`End Date: ${endDateStr}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Created: ${createdAtStr} ${createdTimeStr}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Amount
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printText(`Amount Paid: Rs.${amount}\n\r`, {
      bold: true,
    });

    // Footer
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText(
      "\n\r\n\rWelcome to our membership!\n\r\n\r\n\r\n\r",
      {}
    );
    await BluetoothEscposPrinter.cutOnePoint();

    Alert.alert("Success", "Subscription receipt printed!");
  } catch (error: any) {
    Alert.alert("Print Failed", error?.message || "Check connection.");
    throw error;
  }
};

/**
 * Test print with dummy data
 */
export const printTestReceipt = async (): Promise<void> => {
  const dummySubscription = {
    memberId: { name: "John Doe" },
    planId: { name: "Gold Plan", duration: 1, durationType: "month" },
    amount: 500,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  await printSubscriptionReceipt(dummySubscription);
};

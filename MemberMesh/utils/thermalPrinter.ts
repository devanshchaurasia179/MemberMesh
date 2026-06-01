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
 * Helper to convert billing cycle values to readable full words
 */
const getUnitLabel = (unit: string): string => {
  const lowerUnit = (unit || "").toLowerCase().trim();
  switch (lowerUnit) {
    case "month":
    case "months":
      return "Month(s)";
    case "year":
    case "years":
      return "Year(s)";
    case "days":
    case "day":
      return "Day(s)";
    case "lifetime":
      return "Lifetime";
    // legacy / other values
    case "liter":
    case "liters":
    case "litre":
    case "litres":
      return "Litre(s)";
    case "dozen":
    case "dozens":
      return "Dozen(s)";
    case "kilogram":
    case "kilograms":
    case "kg":
      return "Kg";
    case "piece":
    case "pieces":
      return "Piece(s)";
    default:
      return lowerUnit || "Unit";
  }
};

/**
 * Format a date string safely
 */
const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN");
  } catch {
    return "N/A";
  }
};

/**
 * Format a time string safely
 */
const formatTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr)
      .toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\u202f/g, " ");
  } catch {
    return "";
  }
};

/**
 * Business info to print at the top of every receipt
 */
export interface BusinessInfo {
  businessName?: string;
  ownerName?: string;
  mobileNumber?: string;
}

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
 * Print the business header block (shared by all receipts)
 */
const printBusinessHeader = async (business: BusinessInfo): Promise<void> => {
  const businessName = business.businessName?.trim() || "My Business";
  const ownerName = business.ownerName?.trim() || "";
  const mobile = business.mobileNumber?.trim() || "";

  await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
  await BluetoothEscposPrinter.printText(`${businessName}\n\r`, { bold: true, fontSize: 1 });
  if (ownerName) {
    await BluetoothEscposPrinter.printText(`${ownerName}\n\r`, {});
  }
  if (mobile) {
    await BluetoothEscposPrinter.printText(`Ph: ${mobile}\n\r`, {});
  }
  await BluetoothEscposPrinter.printText("================================\n\r", {});
};

/**
 * Print subscription renewal receipt
 */
export const printRenewalReceipt = async (
  subscription: any,
  business: BusinessInfo = {}
): Promise<void> => {
  if (!BluetoothEscposPrinter) {
    Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
    throw new Error("Bluetooth printer not available");
  }

  try {
    // Extract subscription data using correct field names
    const memberName =
      subscription.memberSnapshot?.name ||
      subscription.memberId?.name ||
      "Unknown Member";

    // subscription.plan may be a populated object or a plain ID string
    const planName =
      (typeof subscription.plan === "object" && subscription.plan?.name)
        ? subscription.plan.name
        : subscription.planName ||           // explicit override from caller
          subscription.planId?.name ||
          "Unknown Plan";

    const duration =
      subscription.durationUsed ||
      (typeof subscription.plan === "object" && subscription.plan?.duration) ||
      subscription.planId?.duration ||
      1;

    const durationType =
      subscription.billingCycleUsed ||
      (typeof subscription.plan === "object" && subscription.plan?.billingCycle) ||
      subscription.planId?.billingCycle ||
      "MONTH";

    const amount =
      subscription.amountPaid ??
      subscription.amount ??
      0;

    const startDate = subscription.startDate;
    const endDate = subscription.expiryDate || subscription.endDate;
    const renewedAt = subscription.updatedAt || new Date().toISOString();
    const receiptCode = subscription.code || "";

    // Initialize printer
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.setBlob(0);

    // ── Business Header ──────────────────────────────────────────────────
    await printBusinessHeader(business);

    // ── Receipt Title ────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("RENEWAL RECEIPT\n\r", { bold: true });
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // ── Member & Plan Info ───────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Member : ${memberName}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Plan   : ${planName}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Duration: ${duration} ${getUnitLabel(durationType)}\n\r`,
      {}
    );
    if (receiptCode) {
      await BluetoothEscposPrinter.printText(`Code   : ${receiptCode}\n\r`, {});
    }
    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // ── Dates ────────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printText(`Start  : ${formatDate(startDate)}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Expiry : ${formatDate(endDate)}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Renewed: ${formatDate(renewedAt)} ${formatTime(renewedAt)}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // ── Amount ───────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printText(`Amount Paid: Rs.${amount}\n\r`, {
      bold: true,
    });

    // ── Footer ───────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("================================\n\r", {});
    await BluetoothEscposPrinter.printText("** RENEWAL RECEIPT **\n\r", {});
    await BluetoothEscposPrinter.printText("Thank you for renewing!\n\r", {});
    await BluetoothEscposPrinter.printText("\n\r\n\r\n\r\n\r", {});
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
export const printSubscriptionReceipt = async (
  subscription: any,
  business: BusinessInfo = {}
): Promise<void> => {
  if (!BluetoothEscposPrinter) {
    Alert.alert("Not Available", "Bluetooth printer not available in Expo Go");
    throw new Error("Bluetooth printer not available");
  }

  try {
    // Extract subscription data using correct field names
    const memberName =
      subscription.memberSnapshot?.name ||
      subscription.memberId?.name ||
      "Unknown Member";

    // subscription.plan may be a populated object or a plain ID string
    const planName =
      (typeof subscription.plan === "object" && subscription.plan?.name)
        ? subscription.plan.name
        : subscription.planName ||           // explicit override from caller
          subscription.planId?.name ||
          "Unknown Plan";

    const duration =
      subscription.durationUsed ||
      (typeof subscription.plan === "object" && subscription.plan?.duration) ||
      subscription.planId?.duration ||
      1;

    const durationType =
      subscription.billingCycleUsed ||
      (typeof subscription.plan === "object" && subscription.plan?.billingCycle) ||
      subscription.planId?.billingCycle ||
      "MONTH";

    const amount =
      subscription.amountPaid ??
      subscription.amount ??
      0;

    const startDate = subscription.startDate;
    const endDate = subscription.expiryDate || subscription.endDate;
    const createdAt = subscription.createdAt || new Date().toISOString();
    const receiptCode = subscription.code || "";

    // Initialize printer
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.setBlob(0);

    // ── Business Header ──────────────────────────────────────────────────
    await printBusinessHeader(business);

    // ── Receipt Title ────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("MEMBERSHIP RECEIPT\n\r", { bold: true });
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // ── Member & Plan Info ───────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(`Member : ${memberName}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Plan   : ${planName}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Duration: ${duration} ${getUnitLabel(durationType)}\n\r`,
      {}
    );
    if (receiptCode) {
      await BluetoothEscposPrinter.printText(`Code   : ${receiptCode}\n\r`, {});
    }
    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // ── Dates ────────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printText(`Start  : ${formatDate(startDate)}\n\r`, {});
    await BluetoothEscposPrinter.printText(`Expiry : ${formatDate(endDate)}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Issued : ${formatDate(createdAt)} ${formatTime(createdAt)}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // ── Amount ───────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printText(`Amount Paid: Rs.${amount}\n\r`, {
      bold: true,
    });

    // ── Footer ───────────────────────────────────────────────────────────
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("================================\n\r", {});
    await BluetoothEscposPrinter.printText("** MEMBERSHIP RECEIPT **\n\r", {});
    await BluetoothEscposPrinter.printText("Welcome to our membership!\n\r", {});
    await BluetoothEscposPrinter.printText("\n\r\n\r\n\r\n\r", {});
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
    memberSnapshot: { name: "John Doe", mobile: "9876543210" },
    plan: { name: "Gold Plan", duration: 1, billingCycle: "month" },
    durationUsed: 1,
    billingCycleUsed: "MONTH",
    amountPaid: 500,
    code: "MEM-001",
    startDate: new Date().toISOString(),
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
  };
  const dummyBusiness: BusinessInfo = {
    businessName: "My Gym",
    ownerName: "Owner Name",
    mobileNumber: "9876543210",
  };
  await printSubscriptionReceipt(dummySubscription, dummyBusiness);
};

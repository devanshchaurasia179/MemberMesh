# Bluetooth ESC/POS Thermal Printer Implementation Guide

## 📦 Library Used
**[@vardrz/react-native-bluetooth-escpos-printer](https://www.npmjs.com/package/@vardrz/react-native-bluetooth-escpos-printer)** v0.1.1

A React Native library for connecting to and printing on Bluetooth ESC/POS thermal printers (58mm/80mm).

---

## 🚀 Installation

### 1. Install the Package
```bash
npm install @vardrz/react-native-bluetooth-escpos-printer
# or
yarn add @vardrz/react-native-bluetooth-escpos-printer
```

### 2. Install Required Dependencies
```bash
npm install @react-native-async-storage/async-storage
# or
yarn add @react-native-async-storage/async-storage
```

### 3. Configure for Expo (if using Expo)
Add to your `app.json` or `app.config.js`:
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "minSdkVersion": 21
          }
        }
      ]
    ]
  }
}
```

### 4. Android Permissions
Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  <!-- Bluetooth Permissions (Android 12+) -->
  <uses-permission android:name="android.permission.BLUETOOTH_SCAN" 
                   android:usesPermissionFlags="neverForLocation" />
  <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
  <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
  
  <!-- Legacy Bluetooth (Android 11 and below) -->
  <uses-permission android:name="android.permission.BLUETOOTH" />
  <uses-permission android:name="android.permission.BLUETOOTH_ADMIN" />
  
  <!-- Location (Required for scanning on Android 11 and below) -->
  <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
  <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
  
  <application>
    <!-- Your app config -->
  </application>
</manifest>
```

### 5. Rebuild Native Code
```bash
# For Expo
npx expo prebuild --clean
npx expo run:android

# For bare React Native
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

---

## 📁 Project Structure

```
utils/
├── bluetoothPermission.ts    # Permission handling
├── printerManager.ts          # Connection & device management
└── thermalPrinter.ts          # Print formatting & execution

app/
├── PrintTest.tsx              # Printer setup UI
└── billing/
    └── index.tsx              # Billing page with print integration
```

---

## 🔧 Implementation Files

### 1. **bluetoothPermission.ts** - Permission Handler

```typescript
import { PermissionsAndroid, Platform, Alert } from "react-native";

export const requestBluetoothPermission = async (): Promise<boolean> => {
  if (Platform.OS !== "android") {
    return true; // iOS not supported by this package yet
  }

  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    ]);

    const allGranted =
      granted["android.permission.BLUETOOTH_SCAN"] === "granted" &&
      granted["android.permission.BLUETOOTH_CONNECT"] === "granted" &&
      granted["android.permission.ACCESS_FINE_LOCATION"] === "granted";

    if (allGranted) {
      console.log("Bluetooth permissions granted");
      return true;
    } else {
      Alert.alert(
        "Permissions Required",
        "Bluetooth and Location permissions are needed to scan and connect to thermal printers."
      );
      return false;
    }
  } catch (err: any) {
    console.warn("Permission error:", err);
    Alert.alert("Error", "Failed to request Bluetooth permissions");
    return false;
  }
};
```

**Key Points:**
- Requests all necessary Bluetooth and Location permissions
- Android 12+ requires `BLUETOOTH_SCAN` and `BLUETOOTH_CONNECT`
- Android 11 and below requires `ACCESS_FINE_LOCATION` for scanning
- iOS is not yet supported by this library

---

### 2. **printerManager.ts** - Device Management

```typescript
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BluetoothManager } from "@vardrz/react-native-bluetooth-escpos-printer";

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
```

**Key Features:**
- Persistent printer storage using AsyncStorage
- Scan for both paired and nearby devices
- Safe disconnect (prevents TurboModule crashes)
- Reconnect to saved printer without rescanning
- In-memory caching for performance

---

### 3. **thermalPrinter.ts** - Print Formatting & Execution

```typescript
import { Alert } from "react-native";
import {
  BluetoothEscposPrinter,
  BluetoothManager,
} from "@vardrz/react-native-bluetooth-escpos-printer";
import { setConnectedPrinter } from "./printerManager";

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
 * Print full bill with shop details, items, and QR code
 */
export const printBill = async (bill: any): Promise<void> => {
  try {
    // Extract shop and bill data
    const shop = bill.shop || { shopName: "Our Shop" };
    const shopName = shop.shopName || "Our Shop";
    const upiId = shop.upiId || "";
    const gstNumber = shop.gstNumber || "";
    const address = shop.address || "";
    const mobileNumber = shop.mobileNumber || "";

    const subTotal = bill.subTotal || bill.totalAmount || 0;
    const discount = bill.discount || 0;
    const totalAmount = bill.totalAmount || 0;
    const paidAmount = bill.paidAmount || 0;
    const remaining = totalAmount - paidAmount;

    // GST Calculation
    const taxPercentage = bill.taxPercentage || 0;
    const taxAmount = (subTotal * taxPercentage) / 100;
    const cgst = taxAmount / 2;
    const sgst = taxAmount / 2;

    // Initialize printer
    await BluetoothEscposPrinter.printerInit();
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.setBlob(0);

    // Header
    await BluetoothEscposPrinter.printText(`${shopName.toUpperCase()}\n\r`, { bold: true });

    if (address) {
      await BluetoothEscposPrinter.printText(`${address}\n\r`, {});
    }

    if (mobileNumber) {
      await BluetoothEscposPrinter.printText(`Phone: +91 ${mobileNumber}\n\r`, {});
    }

    if (gstNumber) {
      await BluetoothEscposPrinter.printText(`GSTIN: ${gstNumber}\n\r`, {});
    }

    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Bill Info
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    await BluetoothEscposPrinter.printText(
      `Bill No: #${bill.dailyBillNumber || "N/A"}\n\r`,
      {}
    );

    // Date & Time (12-hour format with AM/PM)
    const dateObj = new Date(bill.createdAt);
    const datePart = dateObj.toLocaleDateString();
    const timePart = dateObj
      .toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replace(/\u202f/g, " ");

    await BluetoothEscposPrinter.printText(`Date: ${datePart} ${timePart}\n\r`, {});
    await BluetoothEscposPrinter.printText(
      `Customer: ${bill.customerId?.name || "Walk-in"}\n\r`,
      {}
    );
    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Table Header
    await BluetoothEscposPrinter.printColumn(
      [14, 8, 10],
      [
        BluetoothEscposPrinter.ALIGN.LEFT,
        BluetoothEscposPrinter.ALIGN.CENTER,
        BluetoothEscposPrinter.ALIGN.RIGHT,
      ],
      ["Item", "Qty", "Amount"],
      { bold: true }
    );
    await BluetoothEscposPrinter.printText("--------------------------------\n\r", {});

    // Item Loop
    for (const item of bill.items || []) {
      let name = item.name || "Item";
      if (name.length > 13) name = name.substring(0, 12) + ".";

      const shorthand = getUnitShorthand(item.unit);
      const qtyAndUnit = `${item.quantity || 1} ${shorthand}`;
      const amount = `Rs.${item.total || 0}`;

      await BluetoothEscposPrinter.printColumn(
        [14, 8, 10],
        [
          BluetoothEscposPrinter.ALIGN.LEFT,
          BluetoothEscposPrinter.ALIGN.CENTER,
          BluetoothEscposPrinter.ALIGN.RIGHT,
        ],
        [name, qtyAndUnit, amount],
        {}
      );
    }

    await BluetoothEscposPrinter.printText("================================\n\r", {});

    // Totals
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.RIGHT);
    await BluetoothEscposPrinter.printText(`Sub Total:    Rs.${subTotal}\n\r`, {});

    if (discount > 0) {
      await BluetoothEscposPrinter.printText(`Discount:     -Rs.${discount}\n\r`, {});
    }

    // GST
    if (taxPercentage > 0 && taxAmount > 0) {
      await BluetoothEscposPrinter.printText(
        `CGST (${taxPercentage / 2}%):  Rs.${cgst}\n\r`,
        {}
      );
      await BluetoothEscposPrinter.printText(
        `SGST (${taxPercentage / 2}%):  Rs.${sgst}\n\r`,
        {}
      );
    }

    await BluetoothEscposPrinter.printText(`Total:        Rs.${totalAmount}\n\r`, {
      bold: true,
    });

    if (remaining > 0) {
      await BluetoothEscposPrinter.printText(`Balance Due:  Rs.${remaining}\n\r`, {
        bold: true,
      });
    }

    // QR Code for UPI Payment
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.CENTER);
    await BluetoothEscposPrinter.printText("\n\r", {});

    if (upiId) {
      const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
        shopName
      )}&am=${totalAmount}&cu=INR`;
      await BluetoothEscposPrinter.printText("\n\rScan QR to Pay:\n\r", {});
      await BluetoothEscposPrinter.printQRCode(
        upiLink,
        240,
        BluetoothEscposPrinter.ERROR_CORRECTION.L
      );
    }

    // Footer
    await BluetoothEscposPrinter.printText(
      "\n\r\n\rThank you! Visit again\n\r\n\r\n\r\n\r",
      {}
    );
    await BluetoothEscposPrinter.cutOnePoint();

    Alert.alert("Success", "Bill printed!");
  } catch (error: any) {
    Alert.alert("Print Failed", error?.message || "Check connection.");
    throw error;
  }
};

/**
 * Test print with dummy data
 */
export const printTestBill = async (): Promise<void> => {
  const dummyBill = {
    dailyBillNumber: "T-01",
    subTotal: 200,
    taxPercentage: 5,
    totalAmount: 210,
    discount: 0,
    paidAmount: 210,
    paymentStatus: "PAID",
    createdAt: new Date().toISOString(),
    items: [
      { name: "Milk", quantity: 2, unit: "liter", total: 120 },
      { name: "Eggs", quantity: 1, unit: "dozen", total: 80 },
    ],
  };
  await printBill(dummyBill);
};
```

**Key Features:**
- ESC/POS command formatting
- Column-based layout for items
- QR code generation for UPI payments
- GST calculation (CGST/SGST)
- Text alignment (LEFT, CENTER, RIGHT)
- Bold text support
- Paper cut command
- Unit shorthand conversion

---

## 🎨 UI Implementation (PrintTest.tsx)

The printer setup screen includes:

### Features:
1. **Bluetooth Status Indicator** - Shows online/offline/none status
2. **Device Scanner** - Scans for paired and nearby printers
3. **Connection Management** - Connect, disconnect, and reconnect
4. **Saved Printer Display** - Shows currently saved printer
5. **Test Print Button** - Print a test receipt
6. **Long Press to Forget** - Long press on saved printer to disconnect

### Key Functions:
```typescript
// Check printer status
const checkPrinterStatus = async () => {
  const hasSaved = await isThermalPrinterSaved();
  if (!hasSaved) {
    setStatus("none");
    return;
  }

  const printer = await getConnectedThermalPrinter();
  const isReachable = await testRealConnection();
  
  setStatus(isReachable ? "connected" : "offline");
  setLocalConnectedPrinter(printer);
};

// Test real connection
const testRealConnection = async (): Promise<boolean> => {
  try {
    await BluetoothEscposPrinter.printerAlign(BluetoothEscposPrinter.ALIGN.LEFT);
    return true;
  } catch (e) {
    return false;
  }
};

// Scan for devices
const handleScan = async () => {
  const foundDevices = await scanThermalPrinters();
  setDevices(foundDevices);
};

// Connect to printer
const handleConnect = async (device: any) => {
  await connectPrinter(device.address, device.name);
  const isReachable = await testRealConnection();
  setStatus(isReachable ? "connected" : "offline");
};

// Reconnect saved printer
const handleReconnect = async () => {
  const success = await reconnectSavedPrinter();
  if (success) {
    const isReachable = await testRealConnection();
    setStatus(isReachable ? "connected" : "offline");
  }
};
```

---

## 📱 Integration in Billing Page

### 1. Check Printer Status
```typescript
const [isPrinterConnected, setIsPrinterConnected] = useState(false);

const checkPrinterStatus = useCallback(async () => {
  try {
    const hasSaved = await isThermalPrinterSaved();
    setIsPrinterConnected(hasSaved);
  } catch {
    setIsPrinterConnected(false);
  }
}, []);

useEffect(() => {
  checkPrinterStatus();
}, [checkPrinterStatus]);
```

### 2. Print After Checkout
```typescript
const handlePrintPress = async () => {
  if (!lastCreatedBillId) return;
  
  if (isPrinterConnected) {
    try {
      const bill = await fetchBillById(lastCreatedBillId);
      if (bill) await printBill(bill);
      else Alert.alert("Error", "Could not load bill for printing");
    } catch {
      Alert.alert("Error", "Could not load bill for printing");
    }
  } else {
    // Navigate to printer setup
    router.push("/PrintTest");
  }
};
```

### 3. Success Sheet with Print Button
```typescript
<BillSuccessSheet
  visible={!!lastCreatedBillId}
  billId={lastCreatedBillId}
  isPrinterConnected={isPrinterConnected}
  onPrint={handlePrintPress}
  onNextCustomer={handleNextCustomer}
/>
```

---

## 🔌 Available API Methods

### BluetoothManager
```typescript
// Check if Bluetooth is enabled
await BluetoothManager.isBluetoothEnabled(): Promise<boolean>

// Scan for devices
await BluetoothManager.scanDevices(): Promise<string> // Returns JSON

// Connect to printer
await BluetoothManager.connect(address: string): Promise<void>

// Disconnect from printer
await BluetoothManager.disconnect(address: string): Promise<void>
```

### BluetoothEscposPrinter
```typescript
// Initialize printer
await BluetoothEscposPrinter.printerInit(): Promise<void>

// Set text alignment
await BluetoothEscposPrinter.printerAlign(align: number): Promise<void>
// ALIGN.LEFT = 0, ALIGN.CENTER = 1, ALIGN.RIGHT = 2

// Print text
await BluetoothEscposPrinter.printText(text: string, options?: { bold?: boolean }): Promise<void>

// Print columns
await BluetoothEscposPrinter.printColumn(
  widths: number[],
  aligns: number[],
  texts: string[],
  options?: { bold?: boolean }
): Promise<void>

// Print QR code
await BluetoothEscposPrinter.printQRCode(
  content: string,
  size: number,
  errorCorrection: number
): Promise<void>
// ERROR_CORRECTION.L = 0, M = 1, Q = 2, H = 3

// Cut paper
await BluetoothEscposPrinter.cutOnePoint(): Promise<void>

// Set blob (font size/style)
await BluetoothEscposPrinter.setBlob(blob: number): Promise<void>
```

---

## 🐛 Common Issues & Solutions

### 1. **TurboModule Crash: "disconnect called with 0 arguments"**
**Solution:** Always pass the printer address when disconnecting
```typescript
// ❌ Wrong
await BluetoothManager.disconnect();

// ✅ Correct
await BluetoothManager.disconnect(printerAddress);
```

### 2. **Connection Fails on Some Printers**
**Solution:** Try the channel 1 hack
```typescript
try {
  await BluetoothManager.connect(address);
} catch {
  await BluetoothManager.connect(address + ",1");
}
```

### 3. **Printer Not Found During Scan**
**Checklist:**
- ✅ Bluetooth is enabled
- ✅ Location permission granted (Android 11 and below)
- ✅ Printer is powered on
- ✅ Printer is in pairing mode (hold FEED button while turning on)
- ✅ Printer is within range

### 4. **Print Quality Issues**
**Solutions:**
- Use `setBlob(0)` for normal text
- Keep line width under 32 characters for 58mm printers
- Keep line width under 48 characters for 80mm printers
- Truncate long product names

### 5. **QR Code Not Scanning**
**Solutions:**
- Use size 240 or higher
- Use ERROR_CORRECTION.L for better compatibility
- Ensure UPI link format is correct: `upi://pay?pa=UPI_ID&pn=NAME&am=AMOUNT&cu=INR`

---

## 📊 Receipt Layout Best Practices

### 58mm Printer (32 characters wide)
```
================================
        SHOP NAME
     123 Main Street
    Phone: +91 1234567890
   GSTIN: 29ABCDE1234F1Z5
================================
Bill No: #123
Date: 31/05/2026 10:30 AM
Customer: John Doe
================================
Item            Qty      Amount
--------------------------------
Milk            2 ltr   Rs.120
Eggs            1 dzn    Rs.80
--------------------------------
Sub Total:           Rs.200
CGST (2.5%):          Rs.5
SGST (2.5%):          Rs.5
Total:               Rs.210
================================
     Scan QR to Pay:
      [QR CODE HERE]

   Thank you! Visit again
```

### Column Widths
```typescript
// For 58mm printer (total width ~32)
[14, 8, 10] // Item name, Qty, Amount

// For 80mm printer (total width ~48)
[20, 12, 16] // Item name, Qty, Amount
```

---

## 🚀 Quick Start Checklist

- [ ] Install `@vardrz/react-native-bluetooth-escpos-printer`
- [ ] Install `@react-native-async-storage/async-storage`
- [ ] Add Android permissions to `AndroidManifest.xml`
- [ ] Create `bluetoothPermission.ts` utility
- [ ] Create `printerManager.ts` utility
- [ ] Create `thermalPrinter.ts` utility
- [ ] Create printer setup UI (`PrintTest.tsx`)
- [ ] Integrate print functionality in billing page
- [ ] Test with physical thermal printer
- [ ] Handle edge cases (offline, disconnected, etc.)

---

## 📚 Additional Resources

- [Library GitHub](https://github.com/vardrz/react-native-bluetooth-escpos-printer)
- [ESC/POS Command Reference](https://reference.epson-biz.com/modules/ref_escpos/index.php)
- [UPI Deep Link Format](https://www.npci.org.in/what-we-do/upi/upi-specifications)

---

## 💡 Tips & Tricks

1. **Always request permissions before scanning**
2. **Save printer address for auto-reconnect**
3. **Test connection before printing**
4. **Handle printer offline gracefully**
5. **Provide clear user feedback**
6. **Use column layout for better formatting**
7. **Truncate long text to fit printer width**
8. **Add paper cut command at the end**
9. **Use QR codes for UPI payments**
10. **Test with multiple printer models**

---

## 📝 License
This implementation guide is based on the `@vardrz/react-native-bluetooth-escpos-printer` library.

---

**Created for Store Saathi App**  
Last Updated: May 31, 2026

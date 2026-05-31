# 🖨️ Thermal Printer Setup Guide - MemberMesh

## Overview
MemberMesh now supports Bluetooth thermal printer integration for printing subscription receipts. This guide will help you set up and use the thermal printer feature.

## 📦 What's Installed

### Dependencies
- `@vardrz/react-native-bluetooth-escpos-printer` v0.1.1 - Bluetooth ESC/POS printer library
- `@react-native-async-storage/async-storage` - For storing printer connection
- `expo-build-properties` - For Android build configuration

### Files Created

#### Utility Files
1. **`utils/bluetoothPermission.ts`** - Handles Bluetooth and Location permissions
2. **`utils/printerManager.ts`** - Manages printer connection, scanning, and storage
3. **`utils/thermalPrinter.ts`** - Handles receipt formatting and printing

#### UI Components
4. **`app/printer/index.tsx`** - Printer setup and configuration screen

#### Updated Files
5. **`app/dashboard/index.tsx`** - Added "Printer Setup" card
6. **`app/subscription/index.tsx`** - Added print functionality for subscriptions
7. **`app.json`** - Added Android permissions and build properties

---

## 🚀 Quick Start

### 1. Rebuild the App
Since we added native dependencies, you need to rebuild:

```bash
# For Expo
npx expo prebuild --clean
npx expo run:android

# Or if using EAS Build
eas build --platform android --profile development
```

### 2. Access Printer Setup
From the dashboard, tap on the **"Printer Setup"** card to configure your thermal printer.

### 3. Connect Your Printer
1. Turn on your thermal printer
2. Make sure Bluetooth is enabled on your device
3. Tap **"Scan for Printers"**
4. Select your printer from the list
5. Wait for connection confirmation

### 4. Test Print
Once connected, tap **"Test Print"** to verify the printer is working correctly.

---

## 📱 Features

### Dashboard Integration
- **Printer Setup Card** - Quick access to printer configuration from the dashboard

### Subscription Screen
- **Printer Icon** - Top-right corner button to access printer setup
- **Print on Create** - After creating a new subscription, you'll get an option to print the receipt
- **Print on Renew** - After renewing a subscription, you'll get an option to print the renewal receipt

### Printer Setup Screen
- **Status Indicator** - Shows connection status (Connected/Offline/No Printer)
- **Device Scanner** - Scans for paired and nearby Bluetooth printers
- **Connection Management** - Connect, reconnect, and forget printer
- **Test Print** - Print a test receipt to verify functionality

---

## 🧾 Receipt Format

### Subscription Receipt
```
NEW MEMBERSHIP
================================
Member: John Doe
Plan: Gold Plan
Duration: 1 mo
================================
Start Date: 31/05/2026
End Date: 30/06/2026
Created: 31/05/2026 10:30 AM
================================
        Amount Paid: Rs.500

Welcome to our membership!
```

### Renewal Receipt
```
MEMBERSHIP RENEWAL
================================
Member: John Doe
Plan: Gold Plan
Duration: 1 mo
================================
Start Date: 31/05/2026
End Date: 30/06/2026
Renewed: 31/05/2026 10:30 AM
================================
        Amount Paid: Rs.500

Thank you for renewing!
```

---

## 🔧 Android Permissions

The following permissions are automatically configured in `app.json`:

### Bluetooth Permissions (Android 12+)
- `BLUETOOTH_SCAN` - Scan for Bluetooth devices
- `BLUETOOTH_CONNECT` - Connect to Bluetooth devices
- `BLUETOOTH_ADVERTISE` - Advertise Bluetooth services

### Legacy Bluetooth (Android 11 and below)
- `BLUETOOTH` - Basic Bluetooth functionality
- `BLUETOOTH_ADMIN` - Bluetooth administration

### Location Permissions
- `ACCESS_FINE_LOCATION` - Required for Bluetooth scanning on Android 11 and below
- `ACCESS_COARSE_LOCATION` - Coarse location access

---

## 🐛 Troubleshooting

### Printer Not Found During Scan
**Solutions:**
1. ✅ Ensure Bluetooth is enabled on your device
2. ✅ Grant Location permission (required on Android 11 and below)
3. ✅ Power on your thermal printer
4. ✅ Put printer in pairing mode (hold FEED button while turning on)
5. ✅ Ensure printer is within Bluetooth range

### Connection Failed
**Solutions:**
1. Check if printer is already paired in device Bluetooth settings
2. Try forgetting the printer and reconnecting
3. Restart the printer
4. Restart the app

### Print Failed
**Solutions:**
1. Check if printer is still connected (status should show "Connected")
2. Try the "Reconnect" button if status shows "Offline"
3. Ensure printer has paper loaded
4. Check printer battery/power

### Printer Shows "Offline"
**Solutions:**
1. Tap the **"Reconnect"** button
2. If reconnection fails, forget the printer and scan again
3. Restart the printer and try again

---

## 📋 Supported Printers

This library supports **ESC/POS thermal printers** with Bluetooth connectivity:
- 58mm thermal printers
- 80mm thermal printers

### Tested Brands
- Most generic Bluetooth thermal printers
- Printers that support ESC/POS commands

---

## 💡 Usage Tips

1. **Save Your Printer** - Once connected, the printer is saved automatically for future use
2. **Check Status** - Always check the status indicator before printing
3. **Test First** - Use the test print feature to verify everything works
4. **Reconnect When Needed** - If the printer goes offline, use the reconnect button
5. **Paper Width** - Receipts are formatted for 58mm printers (32 characters wide)

---

## 🔐 Privacy & Storage

- Printer connection details are stored locally using AsyncStorage
- Only the printer's Bluetooth address and name are stored
- No sensitive data is transmitted to external servers
- You can forget/remove the printer at any time

---

## 📚 API Reference

### Printer Manager Functions

```typescript
// Check if printer is saved
await isThermalPrinterSaved(): Promise<boolean>

// Get saved printer info
await getConnectedThermalPrinter(): Promise<PrinterInfo | null>

// Scan for printers
await scanThermalPrinters(): Promise<DeviceType[]>

// Reconnect to saved printer
await reconnectSavedPrinter(): Promise<boolean>

// Clear saved printer
await clearSavedPrinter(): Promise<void>
```

### Thermal Printer Functions

```typescript
// Connect to printer
await connectPrinter(address: string, name?: string): Promise<void>

// Print subscription receipt
await printSubscriptionReceipt(subscription: any): Promise<void>

// Print renewal receipt
await printRenewalReceipt(subscription: any): Promise<void>

// Test print
await printTestReceipt(): Promise<void>
```

---

## 🎨 Customization

### Modify Receipt Layout
Edit `utils/thermalPrinter.ts` to customize:
- Header text
- Font styles (bold, alignment)
- Column widths
- Footer messages

### Change Receipt Content
Update the `printSubscriptionReceipt` and `printRenewalReceipt` functions to include:
- Additional member information
- Custom branding
- Terms and conditions
- QR codes for verification

---

## 📞 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the main implementation guide: `BLUETOOTH_PRINTER_IMPLEMENTATION.md`
3. Check printer manufacturer documentation

---

## ✅ Checklist

- [x] Install required packages
- [x] Configure Android permissions
- [x] Create utility files
- [x] Create printer setup UI
- [x] Integrate with dashboard
- [x] Add print functionality to subscriptions
- [x] Test with physical printer
- [ ] Rebuild app with native dependencies
- [ ] Test on Android device
- [ ] Configure printer settings

---

**Last Updated:** May 31, 2026  
**Version:** 1.0.0  
**App:** MemberMesh

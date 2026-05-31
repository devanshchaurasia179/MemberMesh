# 👤 User Journey - Thermal Printer Feature

## 🎯 Overview
This document shows the complete user journey for the thermal printer feature in MemberMesh.

---

## 📱 Journey 1: First-Time Printer Setup

### Step 1: Dashboard
```
┌─────────────────────────────────┐
│      📊 Dashboard               │
├─────────────────────────────────┤
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ Active   │  │ Active   │   │
│  │ Plans    │  │ Subs     │   │
│  └──────────┘  └──────────┘   │
│                                 │
│  ┌──────────┐  ┌──────────┐   │
│  │ Expired  │  │ 🖨️       │   │
│  │ Subs     │  │ Printer  │ ← Tap here
│  └──────────┘  │ Setup    │   │
│                 └──────────┘   │
└─────────────────────────────────┘
```

### Step 2: Printer Setup Screen (No Printer)
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ ⚪ No Printer           │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🔍 Scan for Printers   │ ← Tap here
│  └─────────────────────────┘   │
│                                 │
│         ℹ️                      │
│    How to Connect               │
│                                 │
│  1. Turn on thermal printer     │
│  2. Enable Bluetooth            │
│  3. Tap "Scan for Printers"     │
│  4. Select from list            │
└─────────────────────────────────┘
```

### Step 3: Permission Request
```
┌─────────────────────────────────┐
│  Permissions Required           │
├─────────────────────────────────┤
│                                 │
│  Bluetooth and Location         │
│  permissions are needed to      │
│  scan and connect to thermal    │
│  printers.                      │
│                                 │
│         [Allow]  [Deny]         │
└─────────────────────────────────┘
```

### Step 4: Device List
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  Available Devices              │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🖨️ Thermal Printer      │ ← Tap to
│  │    00:11:22:33:44:55    │   connect
│  │              [Paired]    │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🖨️ POS-5890             │   │
│  │    AA:BB:CC:DD:EE:FF    │   │
│  │              [Nearby]    │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 5: Connected State
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟢 Connected       🗑️   │   │
│  │                         │   │
│  │ Thermal Printer         │   │
│  │ 00:11:22:33:44:55       │   │
│  │                         │   │
│  │  ┌──────────────────┐  │   │
│  │  │ 🖨️ Test Print    │  │ ← Tap to test
│  │  └──────────────────┘  │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │  🔍 Scan for Printers   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 📱 Journey 2: Creating Subscription with Print

### Step 1: Subscriptions Screen
```
┌─────────────────────────────────┐
│  Subscriptions          🖨️ + New│
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ John Doe                │   │
│  │ Gold Plan - Active      │   │
│  │ Expires: Jun 30, 2026   │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Jane Smith              │   │
│  │ Silver Plan - Expired   │   │
│  │ Expired: May 15, 2026   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 2: Create Subscription Modal
```
┌─────────────────────────────────┐
│  New Subscription          ✕    │
├─────────────────────────────────┤
│                                 │
│  Member: [Select Member ▼]     │
│                                 │
│  Plan: [Select Plan ▼]         │
│                                 │
│  Start Date: [31/05/2026]      │
│                                 │
│  Amount: [500]                  │
│                                 │
│         [Cancel] [Create]       │
└─────────────────────────────────┘
```

### Step 3: Success with Print Option
```
┌─────────────────────────────────┐
│  Success                        │
├─────────────────────────────────┤
│                                 │
│  Subscription created           │
│  successfully                   │
│                                 │
│                                 │
│      [OK]  [Print Receipt]      │
│                    ↑            │
│                    └─ Tap here  │
└─────────────────────────────────┘
```

### Step 4: Receipt Prints
```
        ┌─────────────┐
        │             │
        │ NEW MEMBERSHIP
        │ ============
        │ Member: John
        │ Plan: Gold
        │ Duration: 1mo
        │ ============
        │ Start: 31/05
        │ End: 30/06
        │ ============
        │ Amount: 500
        │             │
        │ Welcome!    │
        │             │
        └─────────────┘
              📄
```

---

## 📱 Journey 3: Renewing Subscription with Print

### Step 1: Find Expired Subscription
```
┌─────────────────────────────────┐
│  Subscriptions          🖨️ + New│
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ Jane Smith              │   │
│  │ Silver Plan - Expired   │   │
│  │ Expired: May 15, 2026   │   │
│  │                         │   │
│  │  [Edit] [Renew] [Cancel]│ ← Tap Renew
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 2: Renew Modal
```
┌─────────────────────────────────┐
│  Renew Subscription        ✕    │
├─────────────────────────────────┤
│                                 │
│  Renewing for: Jane Smith       │
│  Plan: Silver Plan              │
│                                 │
│  ℹ️ This subscription has       │
│     expired. Renewal will       │
│     start from today.           │
│                                 │
│  Duration: [Leave empty]        │
│                                 │
│  Billing: [DAYS][MONTH][YEAR]  │
│                                 │
│         [Cancel] [Renew]        │
└─────────────────────────────────┘
```

### Step 3: Success with Print Option
```
┌─────────────────────────────────┐
│  Success                        │
├─────────────────────────────────┤
│                                 │
│  Subscription renewed           │
│  successfully                   │
│                                 │
│                                 │
│      [OK]  [Print Receipt]      │
│                    ↑            │
│                    └─ Tap here  │
└─────────────────────────────────┘
```

### Step 4: Renewal Receipt Prints
```
        ┌─────────────┐
        │             │
        │ MEMBERSHIP
        │   RENEWAL
        │ ============
        │ Member: Jane
        │ Plan: Silver
        │ Duration: 1mo
        │ ============
        │ Start: 31/05
        │ End: 30/06
        │ Renewed: Now
        │ ============
        │ Amount: 300
        │             │
        │ Thank you!  │
        │             │
        └─────────────┘
              📄
```

---

## 📱 Journey 4: Printer Goes Offline

### Step 1: Offline Status
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟡 Offline         🗑️   │   │
│  │                         │   │
│  │ Thermal Printer         │   │
│  │ 00:11:22:33:44:55       │   │
│  │                         │   │
│  │  ┌──────────────────┐  │   │
│  │  │ 🔄 Reconnect     │  │ ← Tap here
│  │  └──────────────────┘  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 2: Reconnecting
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟡 Offline         🗑️   │   │
│  │                         │   │
│  │ Thermal Printer         │   │
│  │ 00:11:22:33:44:55       │   │
│  │                         │   │
│  │      ⏳ Connecting...   │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

### Step 3: Reconnected
```
┌─────────────────────────────────┐
│  ← Printer Setup                │
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────┐   │
│  │ 🟢 Connected       🗑️   │   │
│  │                         │   │
│  │ Thermal Printer         │   │
│  │ 00:11:22:33:44:55       │   │
│  │                         │   │
│  │  ┌──────────────────┐  │   │
│  │  │ 🖨️ Test Print    │  │   │
│  │  └──────────────────┘  │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

---

## 🎯 Key User Actions

| Action | Location | Result |
|--------|----------|--------|
| Setup Printer | Dashboard → Printer Setup | Connect to thermal printer |
| Scan Devices | Printer Setup → Scan button | List available printers |
| Connect | Device list → Tap device | Save and connect printer |
| Test Print | Printer Setup → Test button | Print test receipt |
| Print on Create | After creating subscription | Print new subscription receipt |
| Print on Renew | After renewing subscription | Print renewal receipt |
| Reconnect | Printer Setup → Reconnect | Reconnect to saved printer |
| Forget Printer | Printer Setup → Trash icon | Remove saved printer |

---

## 💡 User Tips

1. **First Time**: Setup printer from dashboard before creating subscriptions
2. **Quick Access**: Use printer icon in subscriptions header
3. **Test First**: Always test print after connecting
4. **Reconnect**: If offline, use reconnect button instead of rescanning
5. **Optional Print**: You can skip printing by tapping "OK" instead

---

**Happy Printing! 🎉**

# 🚀 Quick Start - Thermal Printer

## 1️⃣ Rebuild the App (REQUIRED)

Since we added native Bluetooth dependencies, you must rebuild:

```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:android
```

## 2️⃣ Setup Printer (First Time)

1. Open MemberMesh app
2. Tap **"Printer Setup"** card on dashboard
3. Turn on your thermal printer
4. Tap **"Scan for Printers"**
5. Grant Bluetooth and Location permissions
6. Select your printer from the list
7. Wait for "Connected" status
8. Tap **"Test Print"** to verify

## 3️⃣ Print Receipts

### When Creating Subscription
1. Go to Subscriptions screen
2. Tap **"+ New"** button
3. Fill in subscription details
4. Submit
5. Alert appears → Tap **"Print Receipt"**

### When Renewing Subscription
1. Find subscription to renew
2. Tap **"Renew"** button
3. Confirm renewal details
4. Submit
5. Alert appears → Tap **"Print Receipt"**

## 🔧 Troubleshooting

### Printer Not Found?
- ✅ Turn on Bluetooth
- ✅ Grant Location permission
- ✅ Power on printer
- ✅ Put printer in pairing mode (hold FEED button)

### Connection Failed?
- ✅ Restart printer
- ✅ Forget and reconnect
- ✅ Check printer battery

### Print Failed?
- ✅ Check "Connected" status
- ✅ Tap "Reconnect" if offline
- ✅ Ensure paper is loaded

## 📍 Quick Access

- **Dashboard** → Printer Setup card
- **Subscriptions** → Printer icon (top-right)

## 📝 What Gets Printed

- Member name
- Plan name and duration
- Start and end dates
- Amount paid
- Timestamp

---

**That's it! You're ready to print receipts! 🎉**

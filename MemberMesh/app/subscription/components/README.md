# Subscription Components

This directory contains modular components for the subscription management screen.

## Components

### 1. **SubscriptionCard.tsx**
Displays individual subscription information with actions.

**Features:**
- Shows member details, plan info, dates, and status
- **Call button** - Initiates phone call to member's mobile number
- **WhatsApp button** - Opens WhatsApp chat with pre-filled message
- Edit, Renew, and Cancel action buttons
- Status-based color coding
- Null-safe rendering

**Props:**
- `item`: Subscription object
- `onEdit`: Edit handler function
- `onRenew`: Renew handler function
- `onCancel`: Cancel handler function
- `isCancelling`: Boolean for loading state

### 2. **CreateSubscriptionModal.tsx**
Modal for creating new subscriptions.

**Features:**
- Member information input (name, mobile, address)
- Plan selection from active plans
- Optional custom duration and billing cycle
- Form validation
- Auto-reset on submission

**Props:**
- `visible`: Boolean to show/hide modal
- `onClose`: Close handler
- `onSubmit`: Submit handler with form data
- `plans`: Array of available plans

### 3. **EditSubscriptionModal.tsx**
Modal for editing member details in a subscription.

**Features:**
- Edit member name, mobile, and address
- Pre-fills existing data
- Form validation

**Props:**
- `visible`: Boolean to show/hide modal
- `onClose`: Close handler
- `onSubmit`: Submit handler with updated data
- `subscription`: Current subscription object

### 4. **RenewSubscriptionModal.tsx**
Modal for renewing subscriptions.

**Features:**
- Shows member and plan information
- Optional custom duration
- Billing cycle selection
- Warning messages for cancelled/expired subscriptions

**Props:**
- `visible`: Boolean to show/hide modal
- `onClose`: Close handler
- `onSubmit`: Submit handler with renewal data
- `subscription`: Subscription to renew

### 5. **CancelConfirmationModal.tsx**
Confirmation dialog for cancelling subscriptions.

**Features:**
- Warning icon and message
- Member name display
- Loading state during cancellation
- Prevents accidental cancellations

**Props:**
- `visible`: Boolean to show/hide modal
- `onClose`: Close handler
- `onConfirm`: Confirmation handler
- `subscription`: Subscription to cancel
- `isLoading`: Loading state boolean

## Communication Features

### Phone Call
- Uses React Native's `Linking` API
- Validates mobile number availability
- Handles unsupported devices gracefully

### WhatsApp Integration
- Auto-formats phone numbers (adds +91 for Indian numbers)
- Pre-fills message with member name and plan
- Platform-specific URL handling (iOS/Android/Web)
- Checks if WhatsApp is installed

## Usage Example

```tsx
import SubscriptionCard from "./components/SubscriptionCard";
import CreateSubscriptionModal from "./components/CreateSubscriptionModal";

// In your component
<SubscriptionCard
  item={subscription}
  onEdit={handleEdit}
  onRenew={handleRenew}
  onCancel={handleCancel}
  isCancelling={false}
/>

<CreateSubscriptionModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onSubmit={handleCreate}
  plans={availablePlans}
/>
```

## Benefits of Component Structure

1. **Maintainability** - Each component has a single responsibility
2. **Reusability** - Components can be used in other screens
3. **Testability** - Easier to write unit tests for isolated components
4. **Readability** - Main screen file is much cleaner and easier to understand
5. **Scalability** - Easy to add new features or modify existing ones

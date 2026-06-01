import mongoose from "mongoose";

/**
 * SubscriptionHistory
 * One document per lifecycle event on a Subscription.
 * Events: CREATE | RENEW | CANCEL | EXPIRE
 */
const subscriptionHistorySchema = new mongoose.Schema(
  {
    subscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },

    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    event: {
      type: String,
      enum: ["CREATE", "RENEW", "CANCEL", "EXPIRE"],
      required: true,
    },

    // Snapshot of key fields at the time of the event
    startDate:        { type: Date, default: null },
    expiryDate:       { type: Date, default: null },
    amountPaid:       { type: Number, default: 0 },
    durationUsed:     { type: Number, default: null },
    billingCycleUsed: { type: String, default: null },
    status:           { type: String, default: null },

    // Optional free-text note (e.g. "Renewed for 3 months")
    note: { type: String, default: null },
  },
  { timestamps: true }   // createdAt = when the event was recorded
);

subscriptionHistorySchema.index({ subscription: 1, createdAt: -1 });

export default mongoose.model("SubscriptionHistory", subscriptionHistorySchema);

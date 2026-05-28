import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Member",
      required: true,
    },

    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },
    code: {
      type: String,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },

    expiryDate: {
      type: Date,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CANCELLED"],
      default: "ACTIVE",
    },

    paymentStatus: {
      type: String,
      enum: ["PAID", "PENDING"],
      default: "PAID",
    },

    amountPaid: {
      type: Number,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate active subscriptions (optional but recommended)
subscriptionSchema.index(
  { business: 1, member: 1, plan: 1, status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "ACTIVE" },
  }
);

export default mongoose.model("Subscription", subscriptionSchema);
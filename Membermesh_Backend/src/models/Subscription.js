import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    // ─── Inline member snapshot (no separate Member doc required) ───
    memberSnapshot: {
      name:    { type: String, required: true, trim: true },
      mobile:  { type: String, default: null, trim: true },
      address: { type: String, default: null, trim: true },
    },


    plan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: true,
    },

    code: { type: String },

    startDate: { type: Date, default: Date.now },
    expiryDate: { type: Date, default: null },

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

    // ─── Stores the ACTUAL amount charged (may differ from plan.price
    //     when a multi-unit duration is selected at renewal time) ───
    amountPaid: { type: Number, required: true },

    // ─── Stores the resolved duration used for this subscription period ───
    durationUsed:      { type: Number },          // e.g. 3
    billingCycleUsed:  { type: String },          // e.g. "MONTH"
  },
  { timestamps: true }
);

// Index for efficient querying by business and status
subscriptionSchema.index({ business: 1, status: 1 });

// Index for efficient querying by plan
subscriptionSchema.index({ plan: 1 });

export default mongoose.model("Subscription", subscriptionSchema);
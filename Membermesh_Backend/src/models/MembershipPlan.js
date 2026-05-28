import mongoose from "mongoose";

const membershipPlanSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    name: {
      type: String, // Free, Basic, Pro
      required: true,
    },

    price: {
      type: Number, // in ₹
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    billingCycle: {
      type: String,
      enum: ["DAYS", "MONTH", "YEAR", "LIFETIME"],
      default: "MONTH",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Prevent duplicate plan names per business
membershipPlanSchema.index(
  { business: 1, name: 1 },
  { unique: true }
);

export default mongoose.model("MembershipPlan", membershipPlanSchema);
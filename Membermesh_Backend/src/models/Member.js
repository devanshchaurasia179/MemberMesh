import mongoose from "mongoose";

const memberSchema = new mongoose.Schema(
  {
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Business",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
    },

phone: {
  type: String,
  default:undefined
},

    address: {
   type: String,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// ✅ Unique per business
memberSchema.index({ business: 1, phone: 1 }, { unique: true });

export default mongoose.model("Member", memberSchema);
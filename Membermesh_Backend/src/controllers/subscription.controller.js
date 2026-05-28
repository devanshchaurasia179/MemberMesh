import Subscription from "../models/Subscription.js";
import Member from "../models/Member.js";
import MembershipPlan from "../models/MembershipPlan.js";
import mongoose from "mongoose";
/* ================= HELPER: CALCULATE EXPIRY ================= */
function calculateExpiry(startDate, duration, billingCycle) {
  const date = new Date(startDate);

  switch (billingCycle) {
    case "DAYS":
      date.setDate(date.getDate() + duration);
      break;
    case "MONTH":
      date.setMonth(date.getMonth() + duration);
      break;
    case "YEAR":
      date.setFullYear(date.getFullYear() + duration);
      break;
    case "LIFETIME":
      return null;
  }

  return date;
}

/* ================= CREATE SUBSCRIPTION ================= */
export async function createSubscription(req, res) {
  try {
    let { memberId, planId, memberName,phone, planData } = req.body;
    const businessId = req.user.id;

    /* ================= MEMBER HANDLING ================= */
    let member;

    if (!memberId) {
      if (!memberName) {
        return res.status(400).json({
          message: "Member name required if memberId not provided",
        });
      }
      if(!phone){
          phone = new mongoose.Types.ObjectId()
                  .toString()
                  .slice(-8);
        }

      // ✅ Create minimal member
      member = await Member.create({
        business: businessId,
        name: memberName,
        phone:phone
      });

      memberId = member._id;
    } else {
      member = await Member.findOne({
        _id: memberId,
        business: businessId,
      });

      if (!member) {
        return res.status(404).json({ message: "Member not found" });
      }
    }

    /* ================= PLAN HANDLING ================= */
    let plan;

    if (!planId) {
      if (!planData?.name || !planData?.price || !planData?.duration) {
        return res.status(400).json({
          message:
            "Plan data (name, price, duration) required if planId not provided",
        });
      }

      // ✅ Create minimal plan
      plan = await MembershipPlan.create({
        business: businessId,
        name: planData.name,
        price: planData.price,
        duration: planData.duration,
        billingCycle: planData.billingCycle || "MONTH",
        isActive: true,
      });

      planId = plan._id;
    } else {
      plan = await MembershipPlan.findOne({
        _id: planId,
        business: businessId,
        isActive: true,
      });

      if (!plan) {
        return res.status(400).json({ message: "Invalid or inactive plan" });
      }
    }
/* ================= CHECK DUPLICATE PLAN ================= */
const existingSubscription = await Subscription.findOne({
  business: businessId,
  member: memberId,
  plan: planId,
  status: "ACTIVE",
});

if (existingSubscription) {
  return res.status(400).json({
    message: "User already has this subscription",
  });
}
/* ================= GENERATE CODE ================= */
const planPrefix = plan.name.replace(/\s+/g, "").toUpperCase();

const count = await Subscription.countDocuments({
  business: businessId,
  plan: planId,
});

const nextNumber = count + 1;

const formattedNumber = String(nextNumber).padStart(2, "0");

const code = `${planPrefix}${formattedNumber}`;

/* ================= SUBSCRIPTION ================= */
const startDate = new Date();

const expiryDate = calculateExpiry(
  startDate,
  plan.duration,
  plan.billingCycle
);

const subscription = await Subscription.create({
  business: businessId,
  member: memberId,
  plan: planId,
  code,
  startDate,
  expiryDate,
  amountPaid: plan.price,
  status: "ACTIVE",
  paymentStatus: "PAID",
});

    res.status(201).json({
      success: true,
      subscription,
    });

  } catch (error) {
    console.error("Create Subscription Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/* ================= GET ALL SUBSCRIPTIONS ================= */
export async function getAllSubscriptions(req, res) {
  try {
    const businessId = req.user.id;

    const subscriptions = await Subscription.find({
      business: businessId, // ✅ FIX
    })
      .populate("member")
      .populate("plan")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subscriptions,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
}

/* ================= GET SINGLE SUBSCRIPTION ================= */
export async function getSubscription(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: id,
      business: businessId, // ✅ SECURITY
    })
      .populate("member")
      .populate("plan");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    res.status(200).json({
      success: true,
      subscription,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch subscription" });
  }
}

/* ================= GET MEMBER SUBSCRIPTIONS ================= */
export async function getMemberSubscriptions(req, res) {
  try {
    const { memberId } = req.params;
    const businessId = req.user.id;

    const subscriptions = await Subscription.find({
      member: memberId,
      business: businessId, // ✅ FIX
    })
      .populate("plan")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      subscriptions,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch member subscriptions" });
  }
}

/* ================= RENEW SUBSCRIPTION ================= */
export async function renewSubscription(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    // 👇 Accept optional custom values from body
    const { duration, billingCycle } = req.body;

    const subscription = await Subscription.findOne({
      _id: id,
      business: businessId,
    }).populate("plan");

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const now = new Date();

    // 👇 Decide base date
    const baseDate =
      subscription.expiryDate && subscription.expiryDate >= now
        ? subscription.expiryDate
        : now;

    // 👇 Use custom values if provided, else fallback to plan
    const finalDuration = duration || subscription.plan.duration;
    const finalBillingCycle =
      billingCycle || subscription.plan.billingCycle;

    // 👇 Calculate new expiry
    const newExpiry = calculateExpiry(
      baseDate,
      finalDuration,
      finalBillingCycle
    );

    // 👇 Update subscription
    subscription.expiryDate = newExpiry;
    subscription.status = "ACTIVE";
    subscription.paymentStatus = "PAID";

    // 👇 Optional: update amount if custom duration used
    if (duration) {
      // simple proportional pricing (optional logic)
      const pricePerUnit =
        subscription.plan.price / subscription.plan.duration;

      subscription.amountPaid = pricePerUnit * finalDuration;
    } else {
      subscription.amountPaid = subscription.plan.price;
    }

    await subscription.save();

    res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    console.error("Renewal Error:", error);
    res.status(500).json({ message: "Renewal failed" });
  }
}
/* ================= CANCEL SUBSCRIPTION ================= */
export async function cancelSubscription(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const subscription = await Subscription.findOne({
      _id: id,
      business: businessId,
    });

    if (!subscription) {
      return res.status(404).json({ message: "Subscription not found" });
    }

    const now = new Date();

    // 👇 Set status + expiry immediately
    subscription.status = "CANCELLED";
    subscription.expiryDate = null;

    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled",
      subscription,
    });

  } catch (error) {
    console.error("Cancel Error:", error);
    res.status(500).json({ message: "Cancel failed" });
  }
}
/* ================= AUTO EXPIRE (CRON USE) ================= */
export async function markExpiredSubscriptionsByBusiness(businessId) {
  const now = new Date();

  await Subscription.updateMany(
    {
      business: businessId, // ✅ scoped
      expiryDate: { $lt: now },
      status: "ACTIVE",
    },
    {
      status: "EXPIRED",
    }
  );
}
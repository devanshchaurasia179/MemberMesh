import Subscription from "../models/Subscription.js";
import MembershipPlan from "../models/MembershipPlan.js";

/* ================================================================
   HELPER: CALCULATE EXPIRY DATE
   Returns null for LIFETIME plans.
================================================================ */
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
    default:
      throw new Error(`Unknown billingCycle: ${billingCycle}`);
  }

  return date;
}

/* ================================================================
   HELPER: CALCULATE SCALED PRICE
   Allows renewing for N units even if the base plan is 1 unit.
   Formula: totalPrice = (planPrice / planDuration) × selectedDuration
================================================================ */
function calculateScaledPrice(planPrice, planDuration, selectedDuration) {
  if (!planDuration || planDuration === 0) return planPrice;
  const pricePerUnit = planPrice / planDuration;
  return parseFloat((pricePerUnit * selectedDuration).toFixed(2));
}

/* ================================================================
   HELPER: GENERATE SUBSCRIPTION CODE
   Format: <PLANPREFIX><ZeroPaddedCount>  e.g. GOLD03
================================================================ */
async function generateSubscriptionCode(businessId, planId, planName) {
  const planPrefix = planName.replace(/\s+/g, "").toUpperCase().slice(0, 8);
  const count = await Subscription.countDocuments({ business: businessId, plan: planId });
  const formattedNumber = String(count + 1).padStart(2, "0");
  return `${planPrefix}${formattedNumber}`;
}

/* ================================================================
   HELPER: VALIDATE MEMBER SNAPSHOT INPUT
   name is required; mobile and address are optional.
================================================================ */
function extractMemberSnapshot(body) {
  const { name, mobile, address } = body;

  if (!name || !name.trim()) {
    return { error: "Member name is required" };
  }

  return {
    snapshot: {
      name:    name.trim(),
      mobile:  mobile?.trim()  || null,
      address: address?.trim() || null,
    },
  };
}

/* ================================================================
   CREATE SUBSCRIPTION
   Body: { name, mobile?, address?, planId, duration?, billingCycle? }
   - No member selection needed; snapshot is stored inline.
   - duration/billingCycle override the plan defaults for pricing.
================================================================ */
export async function createSubscription(req, res) {
  try {
    const businessId = req.user.id;
    const { planId, planData, duration, billingCycle, code: customCode } = req.body;

    /* ── 1. Validate member snapshot ── */
    const { snapshot, error: snapshotError } = extractMemberSnapshot(req.body);
    if (snapshotError) return res.status(400).json({ message: snapshotError });

    /* ── 2. Resolve plan ── */
    let plan;

    if (planId) {
      plan = await MembershipPlan.findOne({ _id: planId, business: businessId, isActive: true });
      if (!plan) return res.status(400).json({ message: "Invalid or inactive plan" });
    } else if (planData?.name && planData?.price != null && planData?.duration) {
      plan = await MembershipPlan.create({
        business:     businessId,
        name:         planData.name,
        price:        planData.price,
        duration:     planData.duration,
        billingCycle: planData.billingCycle || "MONTH",
        isActive:     true,
      });
    } else {
      return res.status(400).json({
        message: "Provide either a valid planId or planData (name, price, duration)",
      });
    }

    /* ── 3. Resolve effective duration & billing cycle ── */
    const finalDuration     = duration     ? Number(duration)     : plan.duration;
    const finalBillingCycle = billingCycle || plan.billingCycle;

    /* ── 4. Calculate scaled price ── */
    const amountPaid = calculateScaledPrice(plan.price, plan.duration, finalDuration);

    /* ── 5. Generate or use custom code & dates ── */
    let code;
    if (customCode && customCode.trim()) {
      const trimmedCode = customCode.trim();
      const existing = await Subscription.findOne({ business: businessId, code: trimmedCode });
      if (existing) return res.status(400).json({ message: "This code is already in use" });
      code = trimmedCode;
    } else {
      code = await generateSubscriptionCode(businessId, plan._id, plan.name);
    }
    const startDate = new Date();
    const expiryDate = calculateExpiry(startDate, finalDuration, finalBillingCycle);

    /* ── 6. Create subscription ── */
    const subscription = await Subscription.create({
      business:       businessId,
      memberSnapshot: snapshot,
      plan:           plan._id,
      code,
      startDate,
      expiryDate,
      amountPaid,
      durationUsed:     finalDuration,
      billingCycleUsed: finalBillingCycle,
      status:        "ACTIVE",
      paymentStatus: "PAID",
    });

    return res.status(201).json({ success: true, subscription });

  } catch (err) {
    console.error("createSubscription:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

/* ================================================================
   GET ALL SUBSCRIPTIONS  (for a business)
================================================================ */
export async function getAllSubscriptions(req, res) {
  try {
    const businessId = req.user.id;

    const subscriptions = await Subscription.find({ business: businessId })
      .populate("plan")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, subscriptions });

  } catch (err) {
    console.error("getAllSubscriptions:", err);
    return res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
}

/* ================================================================
   GET SINGLE SUBSCRIPTION
================================================================ */
export async function getSubscription(req, res) {
  try {
    const { id }      = req.params;
    const businessId  = req.user.id;

    const subscription = await Subscription.findOne({ _id: id, business: businessId })
      .populate("plan");

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    return res.status(200).json({ success: true, subscription });

  } catch (err) {
    console.error("getSubscription:", err);
    return res.status(500).json({ message: "Failed to fetch subscription" });
  }
}


/* ================================================================
   UPDATE SUBSCRIPTION (Edit member details)
   Body: { name?, mobile?, address? }
   - Updates the memberSnapshot inline data
================================================================ */
export async function updateSubscription(req, res) {
  try {
    const { id }     = req.params;
    const businessId = req.user.id;
    const { name, mobile, address, code } = req.body;

    const subscription = await Subscription.findOne({ _id: id, business: businessId })
      .populate("plan");

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    /* ── Update member snapshot fields ── */
    if (name !== undefined) {
      if (!name.trim()) return res.status(400).json({ message: "Member name cannot be empty" });
      subscription.memberSnapshot.name = name.trim();
    }
    if (mobile !== undefined) {
      subscription.memberSnapshot.mobile = mobile.trim() || null;
    }
    if (address !== undefined) {
      subscription.memberSnapshot.address = address.trim() || null;
    }

    /* ── Update subscription code ── */
    if (code !== undefined) {
      const trimmedCode = code.trim();
      if (!trimmedCode) return res.status(400).json({ message: "Code cannot be empty" });
      // Ensure code is unique within this business (excluding current subscription)
      const existing = await Subscription.findOne({
        business: businessId,
        code: trimmedCode,
        _id: { $ne: id },
      });
      if (existing) return res.status(400).json({ message: "This code is already in use" });
      subscription.code = trimmedCode;
    }

    subscription.markModified("memberSnapshot");
    await subscription.save();

    return res.status(200).json({ success: true, subscription });

  } catch (err) {
    console.error("updateSubscription:", err);
    return res.status(500).json({ message: "Update failed" });
  }
}

/* ================================================================
   RENEW SUBSCRIPTION
   Body: { duration?, billingCycle? }
   - If duration is provided, price is scaled proportionally.
   - Extends from current expiry if still active, else from now.
   - For cancelled/expired subscriptions, updates startDate to today.
================================================================ */
export async function renewSubscription(req, res) {
  try {
    const { id }         = req.params;
    const businessId     = req.user.id;
    const { duration, billingCycle } = req.body;

    const subscription = await Subscription.findOne({ _id: id, business: businessId })
      .populate("plan");

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    /* ── Resolve effective duration & billing cycle ── */
    const finalDuration     = duration     ? Number(duration)     : subscription.plan.duration;
    const finalBillingCycle = billingCycle || subscription.plan.billingCycle;

    /* ── Base date: extend from current expiry if still valid ── */
    const now      = new Date();
    const isCancelledOrExpired = subscription.status === "CANCELLED" || subscription.status === "EXPIRED";
    const baseDate = subscription.expiryDate && subscription.expiryDate >= now && !isCancelledOrExpired
      ? subscription.expiryDate
      : now;

    /* ── Scaled price ── */
    const amountPaid = calculateScaledPrice(
      subscription.plan.price,
      subscription.plan.duration,
      finalDuration
    );

    /* ── Apply updates ── */
    // Update startDate to today for cancelled/expired subscriptions
    if (isCancelledOrExpired) {
      subscription.startDate = now;
    }
    
    subscription.expiryDate      = calculateExpiry(baseDate, finalDuration, finalBillingCycle);
    subscription.status          = "ACTIVE";
    subscription.paymentStatus   = "PAID";
    subscription.amountPaid      = amountPaid;
    subscription.durationUsed    = finalDuration;
    subscription.billingCycleUsed = finalBillingCycle;

    await subscription.save();

    return res.status(200).json({ success: true, subscription });

  } catch (err) {
    console.error("renewSubscription:", err);
    return res.status(500).json({ message: "Renewal failed" });
  }
}

/* ================================================================
   CANCEL SUBSCRIPTION
================================================================ */
export async function cancelSubscription(req, res) {
  try {
    const { id }     = req.params;
    const businessId = req.user.id;

    const subscription = await Subscription.findOne({ _id: id, business: businessId });

    if (!subscription) return res.status(404).json({ message: "Subscription not found" });

    subscription.status     = "CANCELLED";
    subscription.expiryDate = null;

    await subscription.save();

    return res.status(200).json({ success: true, message: "Subscription cancelled", subscription });

  } catch (err) {
    console.error("cancelSubscription:", err);
    return res.status(500).json({ message: "Cancel failed" });
  }
}

/* ================================================================
   AUTO-EXPIRE  (called by a cron job, scoped to one business)
================================================================ */
export async function markExpiredSubscriptionsByBusiness(businessId) {
  const now = new Date();

  const result = await Subscription.updateMany(
    { business: businessId, expiryDate: { $lt: now }, status: "ACTIVE" },
    { $set: { status: "EXPIRED" } }
  );

  return result.modifiedCount; // useful for cron logging
}
import MembershipPlan from "../models/MembershipPlan.js";

/* ================= CREATE PLAN ================= */
export async function createPlan(req, res) {
  try {
    const { name, price, duration, billingCycle, isActive } = req.body;
    const businessId = req.user.id; // ✅ IMPORTANT

    if (!name || price === undefined || duration === undefined) {
      return res.status(400).json({
        message: "Name, price, and duration are required",
      });
    }

    // ✅ Prevent duplicate plan name per business
    const existing = await MembershipPlan.findOne({
      name,
      business: businessId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Plan with this name already exists",
      });
    }

    const plan = await MembershipPlan.create({
      business: businessId, // ✅ CRITICAL
      name,
      price,
      duration,
      billingCycle: billingCycle?.toUpperCase(),
      isActive,
    });

    res.status(201).json({ success: true, plan });

  } catch (error) {
    console.error("Create Plan Error:", error);
    res.status(500).json({ message: error.message || "Internal Server Error" });
  }
}

/* ================= GET ALL PLANS ================= */
export async function getAllPlans(req, res) {
  try {
    const businessId = req.user.id;
    const { onlyActive } = req.query;

    const filter = {
      business: businessId, // ✅ MUST
    };

    if (onlyActive === "true") {
      filter.isActive = true;
    }

    const plans = await MembershipPlan.find(filter).sort({ price: 1 });

    res.status(200).json({ success: true, plans });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plans" });
  }
}

/* ================= GET SINGLE PLAN ================= */
export async function getPlan(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const plan = await MembershipPlan.findOne({
      _id: id,
      business: businessId, // ✅ SECURITY
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ success: true, plan });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch plan" });
  }
}

/* ================= UPDATE PLAN ================= */
export async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    if (req.body.billingCycle) {
      req.body.billingCycle = req.body.billingCycle.toUpperCase();
    }

    const updatedPlan = await MembershipPlan.findOneAndUpdate(
      { _id: id, business: businessId }, // ✅ FIX
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({ success: true, plan: updatedPlan });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
}

/* ================= TOGGLE PLAN STATUS ================= */
export async function togglePlanStatus(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const plan = await MembershipPlan.findOne({
      _id: id,
      business: businessId, // ✅ FIX
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    plan.isActive = !plan.isActive;
    await plan.save();

    res.status(200).json({
      success: true,
      message: `Plan ${plan.isActive ? "activated" : "deactivated"} successfully`,
      isActive: plan.isActive,
    });

  } catch (error) {
    res.status(500).json({ message: "Action failed" });
  }
}

/* ================= DELETE PLAN ================= */
export async function deletePlanPermanent(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const plan = await MembershipPlan.findOneAndDelete({
      _id: id,
      business: businessId, // ✅ SECURITY FIX
    });

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.status(200).json({
      success: true,
      message: "Plan permanently removed",
    });

  } catch (error) {
    res.status(500).json({ message: "Delete failed" });
  }
}
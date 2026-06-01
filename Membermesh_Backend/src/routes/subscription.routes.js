import express from "express";
import {
  createSubscription,
  getAllSubscriptions,
  getSubscription,
  updateSubscription,
  renewSubscription,
  cancelSubscription,
  getSubscriptionHistory,
} from "../controllers/subscription.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = express.Router();

/* ================= CREATE ================= */
router.post("/",protectRoute, createSubscription);

/* ================= READ ================= */
router.get("/",protectRoute, getAllSubscriptions);           // Get all subscriptions
router.get("/:id/history",protectRoute, getSubscriptionHistory); // Get history for one
router.get("/:id",protectRoute, getSubscription);            // Get single subscription

/* ================= UPDATE ================= */
router.put("/renew/:id",protectRoute, renewSubscription);   // Renew subscription
router.put("/cancel/:id",protectRoute, cancelSubscription); // Cancel subscription
router.put("/:id",protectRoute, updateSubscription);         // Update member details

export default router;
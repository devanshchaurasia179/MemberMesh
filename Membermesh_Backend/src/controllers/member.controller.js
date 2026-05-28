import Member from "../models/Member.js";
import Subscription from "../models/Subscription.js";
import mongoose from "mongoose";
/* ================= CREATE CUSTOMER ================= */
export async function createCustomer(req, res) {
  try {
    const { name, phone, email, address } = req.body;
    const businessId = req.user.id; // ✅ from JWT

    if (!name) {
      return res.status(400).json({
        message: "Name required",
      });
    }
    if (!req.body.phone) {
  delete req.body.phone;
}
   let finalMobileNumber = phone?.trim();

    // 1️⃣ If mobile number NOT provided → generate fallback
    if (!finalMobileNumber) {
      finalMobileNumber = new mongoose.Types.ObjectId()
        .toString()
        .slice(-8);
    }

    // ✅ FIX: check duplicate INSIDE same business
    const existing = await Member.findOne({
      phone:finalMobileNumber,
      business: businessId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Member already exists with this phone",
      });
    }

    const member = await Member.create({
      business: businessId, // ✅ VERY IMPORTANT
      name,
      phone:finalMobileNumber,
      email,
      address,
    });

    res.status(201).json({ success: true, member });

  } catch (error) {
    console.error("Create Member Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

/* ================= GET ALL CUSTOMERS ================= */
export async function getAllCustomers(req, res) {
  try {
    const businessId = req.user.id;

    const members = await Member.find({
      business: businessId, // ✅ FILTER
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      members,
    });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customers" });
  }
}

/* ================= GET SINGLE CUSTOMER ================= */
export async function getCustomer(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const member = await Member.findOne({
      _id: id,
      business: businessId, // ✅ SECURITY FIX
    });

    if (!member) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ success: true, member });

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer" });
  }
}
/* ================= UPDATE CUSTOMER ================= */
export async function updateCustomer(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const updated = await Member.findOneAndUpdate(
      { _id: id, business: businessId }, // ✅ filter
      req.body,
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json({ success: true, member: updated });

  } catch (error) {
    res.status(500).json({ message: "Update failed" });
  }
}

/* ================= DELETE CUSTOMER (HARD DELETE) ================= */
export async function deleteCustomer(req, res) {
  try {
    const { id } = req.params;
    const businessId = req.user.id;

    const member = await Member.findOne({
      _id: id,
      business: businessId, // ✅ SECURITY
    });

    if (!member) {
      return res.status(404).json({ message: "Customer not found" });
    }

    // ✅ Delete only THIS business subscriptions
    await Subscription.deleteMany({
      member: id,
      business: businessId,
    });

    await Member.findOneAndDelete({
      _id: id,
      business: businessId,
    });

    res.status(200).json({
      success: true,
      message: "Customer and related subscriptions deleted permanently",
    });

  } catch (error) {
    console.error("Delete Customer Error:", error);
    res.status(500).json({ message: "Delete failed" });
  }
}
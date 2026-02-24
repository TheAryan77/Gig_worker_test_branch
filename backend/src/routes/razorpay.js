import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getDb } from "../config/firebase.js";

const router = Router();
let razorpayInstance = null;
//hey there

function getRazorpay() {
  if (razorpayInstance) return razorpayInstance;

  const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured (RAZORPAY_KEY_ID/RAZORPAY_KEY_SECRET)");
  }

  razorpayInstance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return razorpayInstance;
}

router.post("/razorpay/create-order", async (req, res) => {
  try {
    const { amount, currency = "INR", projectId, clientId, freelancerId, projectTitle } = req.body || {};

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const instance = getRazorpay();
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await instance.orders.create({
      amount: amountInPaise,
      currency,
      receipt: `project_${projectId || "generic"}_${Date.now()}`,
      notes: {
        projectId,
        clientId,
        freelancerId,
        projectTitle,
        type: "escrow_payment",
      },
    });

    const db = getDb();
    if (db) {
      await db.collection("payments").doc(order.id).set({
        type: "razorpay_order",
        status: "created",
        amount: order.amount,
        currency: order.currency,
        projectId,
        clientId,
        freelancerId,
        projectTitle,
        createdAt: new Date().toISOString(),
      });
    }

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
    });
  } catch (error) {
    console.error("[razorpay] order creation error", error);
    return res.status(500).json({ error: "Failed to create payment order" });
  }
});

router.post("/razorpay/verify-payment", async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields", verified: false });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "")
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const verified = expectedSignature === razorpay_signature;

    const db = getDb();
    if (db) {
      await db.collection("payments").doc(razorpay_order_id).set(
        {
          type: "razorpay_order",
          status: verified ? "verified" : "failed",
          paymentId: razorpay_payment_id,
          signature: razorpay_signature,
          verified,
          verifiedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    }

    if (!verified) {
      return res.status(400).json({ error: "Invalid payment signature", verified: false });
    }

    return res.json({ success: true, verified: true, paymentId: razorpay_payment_id, orderId: razorpay_order_id });
  } catch (error) {
    console.error("[razorpay] verification error", error);
    return res.status(500).json({ error: "Payment verification failed", verified: false });
  }
});

export default router;

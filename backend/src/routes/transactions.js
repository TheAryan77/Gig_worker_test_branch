import { Router } from "express";
import { getDb } from "../config/firebase.js";

const router = Router();

// Get transactions for a user
router.get("/transactions", async (req, res) => {
  try {
    const { freelancerId, clientId, limit = 50 } = req.query;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let query = db.collection("transactions");

    if (freelancerId) {
      query = query.where("freelancerId", "==", freelancerId);
    }
    if (clientId) {
      query = query.where("clientId", "==", clientId);
    }

    query = query.orderBy("createdAt", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const transactions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, transactions });
  } catch (error) {
    console.error("[transactions] get error", error);
    return res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// Create transaction
router.post("/transactions", async (req, res) => {
  try {
    const transactionData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const newTransaction = {
      ...transactionData,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("transactions").add(newTransaction);

    return res.json({ 
      success: true, 
      transactionId: docRef.id,
      message: "Transaction recorded successfully" 
    });
  } catch (error) {
    console.error("[transactions] create error", error);
    return res.status(500).json({ error: "Failed to create transaction" });
  }
});

// Request withdrawal
router.post("/withdrawals", async (req, res) => {
  try {
    const { userId, amount, method, accountDetails } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Check user balance
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    const availableBalance = userData.availableBalance || 0;

    if (amount > availableBalance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    // Create transaction record
    await db.collection("transactions").add({
      type: "withdrawal",
      freelancerId: userId,
      amount: parseFloat(amount),
      method,
      status: "completed",
      description: `Withdrawal via ${method}`,
      createdAt: new Date().toISOString(),
    });

    // Update user balance
    await db.collection("users").doc(userId).set({
      availableBalance: availableBalance - parseFloat(amount),
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    // Create withdrawal record for admin tracking
    await db.collection("withdrawals").add({
      userId,
      amount: parseFloat(amount),
      method,
      accountDetails,
      status: "pending",
      requestedAt: new Date().toISOString(),
    });

    return res.json({ 
      success: true, 
      message: "Withdrawal request submitted successfully",
      newBalance: availableBalance - parseFloat(amount)
    });
  } catch (error) {
    console.error("[withdrawals] create error", error);
    return res.status(500).json({ error: "Failed to process withdrawal" });
  }
});

// Get user earnings summary
router.get("/earnings/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Get user balance
    const userDoc = await db.collection("users").doc(userId).get();
    const availableBalance = userDoc.exists ? (userDoc.data().availableBalance || 0) : 0;

    // Get transactions
    const transactionsSnapshot = await db.collection("transactions")
      .where("freelancerId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(50)
      .get();

    const transactions = transactionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Calculate totals
    const totalEarnings = transactions
      .filter(t => t.type === "escrow_release")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalWithdrawn = transactions
      .filter(t => t.type === "withdrawal")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return res.json({
      success: true,
      earnings: {
        availableBalance,
        totalEarnings,
        totalWithdrawn,
        transactions
      }
    });
  } catch (error) {
    console.error("[earnings] get error", error);
    return res.status(500).json({ error: "Failed to fetch earnings" });
  }
});

export default router;

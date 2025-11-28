import { Router } from "express";
import { getDb } from "../config/firebase.js";

const router = Router();

// Create application
router.post("/applications", async (req, res) => {
  try {
    const applicationData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const newApplication = {
      ...applicationData,
      status: applicationData.status || "pending",
      appliedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("applications").add(newApplication);

    return res.json({ 
      success: true, 
      applicationId: docRef.id,
      message: "Application submitted successfully" 
    });
  } catch (error) {
    console.error("[applications] create error", error);
    return res.status(500).json({ error: "Failed to create application" });
  }
});

// Get applications (with filters)
router.get("/applications", async (req, res) => {
  try {
    const { jobId, freelancerId, clientId, status, limit = 50 } = req.query;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let query = db.collection("applications");

    if (jobId) {
      query = query.where("jobId", "==", jobId);
    }
    if (freelancerId) {
      query = query.where("freelancerId", "==", freelancerId);
    }
    if (clientId) {
      query = query.where("clientId", "==", clientId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }

    query = query.orderBy("appliedAt", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const applications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, applications });
  } catch (error) {
    console.error("[applications] get error", error);
    return res.status(500).json({ error: "Failed to fetch applications" });
  }
});

// Update application status
router.put("/applications/:applicationId", async (req, res) => {
  try {
    const { applicationId } = req.params;
    const updateData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    if (updateData.status === "approved") {
      updateData.approvedAt = new Date().toISOString();
    } else if (updateData.status === "rejected") {
      updateData.rejectedAt = new Date().toISOString();
    }

    await db.collection("applications").doc(applicationId).set(updateData, { merge: true });

    return res.json({ success: true, message: "Application updated successfully" });
  } catch (error) {
    console.error("[applications] update error", error);
    return res.status(500).json({ error: "Failed to update application" });
  }
});

// Batch reject applications for a job
router.post("/applications/batch-reject", async (req, res) => {
  try {
    const { jobId, excludeApplicationId } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let query = db.collection("applications")
      .where("jobId", "==", jobId)
      .where("status", "==", "pending");

    const snapshot = await query.get();
    const batch = db.batch();
    
    snapshot.docs.forEach(doc => {
      if (doc.id !== excludeApplicationId) {
        batch.update(doc.ref, {
          status: "rejected",
          rejectedAt: new Date().toISOString()
        });
      }
    });

    await batch.commit();

    return res.json({ 
      success: true, 
      message: "Other applications rejected",
      count: snapshot.size
    });
  } catch (error) {
    console.error("[applications] batch reject error", error);
    return res.status(500).json({ error: "Failed to reject applications" });
  }
});

export default router;

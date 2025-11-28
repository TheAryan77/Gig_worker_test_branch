import { Router } from "express";
import { getDb } from "../config/firebase.js";

const router = Router();

// Create a new job
router.post("/jobs", async (req, res) => {
  try {
    const jobData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Add timestamps and default values
    const newJob = {
      ...jobData,
      status: jobData.status || "open",
      proposals: jobData.proposals || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection("jobs").add(newJob);

    return res.json({ 
      success: true, 
      jobId: docRef.id,
      message: "Job posted successfully" 
    });
  } catch (error) {
    console.error("[jobs] create job error", error);
    return res.status(500).json({ error: "Failed to create job" });
  }
});

// Get jobs (with filters)
router.get("/jobs", async (req, res) => {
  try {
    const { clientId, status, jobCategory, limit = 50 } = req.query;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let query = db.collection("jobs");

    if (clientId) {
      query = query.where("clientId", "==", clientId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }
    if (jobCategory) {
      query = query.where("jobCategory", "==", jobCategory);
    }

    query = query.orderBy("createdAt", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const jobs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, jobs });
  } catch (error) {
    console.error("[jobs] get jobs error", error);
    return res.status(500).json({ error: "Failed to fetch jobs" });
  }
});

// Get single job
router.get("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const jobDoc = await db.collection("jobs").doc(jobId).get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    return res.json({ 
      success: true, 
      job: { id: jobDoc.id, ...jobDoc.data() } 
    });
  } catch (error) {
    console.error("[jobs] get job error", error);
    return res.status(500).json({ error: "Failed to fetch job" });
  }
});

// Update job
router.put("/jobs/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    updateData.updatedAt = new Date().toISOString();

    await db.collection("jobs").doc(jobId).set(updateData, { merge: true });

    return res.json({ success: true, message: "Job updated successfully" });
  } catch (error) {
    console.error("[jobs] update job error", error);
    return res.status(500).json({ error: "Failed to update job" });
  }
});

// Increment job proposals
router.post("/jobs/:jobId/increment-proposals", async (req, res) => {
  try {
    const { jobId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const jobRef = db.collection("jobs").doc(jobId);
    const jobDoc = await jobRef.get();
    
    if (!jobDoc.exists) {
      return res.status(404).json({ error: "Job not found" });
    }

    const currentProposals = jobDoc.data().proposals || 0;
    await jobRef.update({ 
      proposals: currentProposals + 1,
      updatedAt: new Date().toISOString()
    });

    return res.json({ success: true, proposals: currentProposals + 1 });
  } catch (error) {
    console.error("[jobs] increment proposals error", error);
    return res.status(500).json({ error: "Failed to increment proposals" });
  }
});

export default router;

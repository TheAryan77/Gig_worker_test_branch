import { Router } from "express";
import { getDb } from "../config/firebase.js";

const router = Router();

// Create project
router.post("/projects", async (req, res) => {
  try {
    const projectData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const newProject = {
      ...projectData,
      status: projectData.status || "pending-agreement",
      clientAgreed: false,
      freelancerAgreed: false,
      paymentStatus: "pending",
      currentStage: 0,
      stages: projectData.stages || [
        {
          name: "Planning & Setup",
          description: "Initial project setup, requirements gathering, and planning phase",
          status: "pending",
        },
        {
          name: "Development",
          description: "Main development work, implementing core features and functionality",
          status: "pending",
        },
        {
          name: "Testing & Delivery",
          description: "Final testing, bug fixes, documentation, and project handover",
          status: "pending",
        },
      ],
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("projects").add(newProject);

    return res.json({ 
      success: true, 
      projectId: docRef.id,
      message: "Project created successfully" 
    });
  } catch (error) {
    console.error("[projects] create error", error);
    return res.status(500).json({ error: "Failed to create project" });
  }
});

// Get project by ID
router.get("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const projectDoc = await db.collection("projects").doc(projectId).get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    return res.json({ 
      success: true, 
      project: { id: projectDoc.id, ...projectDoc.data() } 
    });
  } catch (error) {
    console.error("[projects] get error", error);
    return res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Get projects (with filters)
router.get("/projects", async (req, res) => {
  try {
    const { clientId, freelancerId, status, limit = 50 } = req.query;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    let query = db.collection("projects");

    if (clientId) {
      query = query.where("clientId", "==", clientId);
    }
    if (freelancerId) {
      query = query.where("freelancerId", "==", freelancerId);
    }
    if (status) {
      query = query.where("status", "==", status);
    }

    query = query.orderBy("createdAt", "desc").limit(parseInt(limit));

    const snapshot = await query.get();
    const projects = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, projects });
  } catch (error) {
    console.error("[projects] get list error", error);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Update project
router.put("/projects/:projectId", async (req, res) => {
  try {
    const { projectId } = req.params;
    const updateData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    await db.collection("projects").doc(projectId).set(updateData, { merge: true });

    return res.json({ success: true, message: "Project updated successfully" });
  } catch (error) {
    console.error("[projects] update error", error);
    return res.status(500).json({ error: "Failed to update project" });
  }
});

// Sign agreement
router.post("/projects/:projectId/sign-agreement", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userRole, userName } = req.body; // userRole: "client" or "freelancer"
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectData = projectDoc.data();
    const updateData = {};

    if (userRole === "client") {
      updateData.clientAgreed = true;
    } else {
      updateData.freelancerAgreed = true;
    }

    // Check if both have agreed
    const otherPartyAgreed = userRole === "client" ? projectData.freelancerAgreed : projectData.clientAgreed;

    if (otherPartyAgreed) {
      updateData.status = "pending-payment";
      updateData.agreedAt = new Date().toISOString();
    }

    await projectRef.update(updateData);

    // Create system message
    const systemMessage = otherPartyAgreed 
      ? `${userName} has signed the agreement. Waiting for client to secure payment in escrow.`
      : `${userName} has signed the agreement.`;
    
    await db.collection("projects").doc(projectId).collection("messages").add({
      senderId: "system",
      senderName: "System",
      senderRole: userRole,
      content: systemMessage,
      type: "system",
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, bothAgreed: otherPartyAgreed });
  } catch (error) {
    console.error("[projects] sign agreement error", error);
    return res.status(500).json({ error: "Failed to sign agreement" });
  }
});

// Secure payment (escrow)
router.post("/projects/:projectId/secure-payment", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { escrowAmount, paymentMethod, paymentId, orderId } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const updateData = {
      status: "payment-secured",
      paymentStatus: "escrow",
      escrowAmount: parseFloat(escrowAmount),
      paymentMethod,
      paymentId,
      orderId,
      paidAt: new Date().toISOString(),
      "stages.0.status": "in-progress",
    };

    await db.collection("projects").doc(projectId).set(updateData, { merge: true });

    // System message
    await db.collection("projects").doc(projectId).collection("messages").add({
      senderId: "system",
      senderName: "System",
      senderRole: "client",
      content: `Payment of $${escrowAmount} secured in escrow. Project can now begin!`,
      type: "system",
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Payment secured successfully" });
  } catch (error) {
    console.error("[projects] secure payment error", error);
    return res.status(500).json({ error: "Failed to secure payment" });
  }
});

// Update stage
router.put("/projects/:projectId/stages/:stageIndex", async (req, res) => {
  try {
    const { projectId, stageIndex } = req.params;
    const { status } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const stages = projectDoc.data().stages || [];
    const idx = parseInt(stageIndex);
    
    if (idx < 0 || idx >= stages.length) {
      return res.status(400).json({ error: "Invalid stage index" });
    }

    stages[idx].status = status;
    if (status === "completed") {
      stages[idx].completedAt = new Date().toISOString();
    }

    const updateData = { 
      stages, 
      currentStage: idx 
    };

    // Check if all stages completed
    const allCompleted = stages.every(s => s.status === "completed");
    if (allCompleted) {
      updateData.status = "completed";
      updateData.completedAt = new Date().toISOString();
    }

    await projectRef.update(updateData);

    return res.json({ success: true, stages });
  } catch (error) {
    console.error("[projects] update stage error", error);
    return res.status(500).json({ error: "Failed to update stage" });
  }
});

// Release payment
router.post("/projects/:projectId/release-payment", async (req, res) => {
  try {
    const { projectId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const projectRef = db.collection("projects").doc(projectId);
    const projectDoc = await projectRef.get();
    
    if (!projectDoc.exists) {
      return res.status(404).json({ error: "Project not found" });
    }

    const projectData = projectDoc.data();
    const escrowAmount = projectData.escrowAmount || 0;
    const freelancerId = projectData.freelancerId;

    await projectRef.update({
      paymentStatus: "released",
      releasedAt: new Date().toISOString(),
    });

    // Update freelancer's balance
    if (freelancerId) {
      const userRef = db.collection("users").doc(freelancerId);
      const userDoc = await userRef.get();
      const currentBalance = userDoc.exists ? (userDoc.data().availableBalance || 0) : 0;
      
      await userRef.set({
        availableBalance: currentBalance + escrowAmount,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    // Create transaction record
    await db.collection("transactions").add({
      type: "escrow_release",
      projectId,
      freelancerId,
      amount: escrowAmount,
      status: "completed",
      createdAt: new Date().toISOString(),
    });

    // System message
    await db.collection("projects").doc(projectId).collection("messages").add({
      senderId: "system",
      senderName: "System",
      senderRole: "client",
      content: `Payment of $${escrowAmount} has been released to the freelancer.`,
      type: "system",
      createdAt: new Date().toISOString(),
    });

    return res.json({ success: true, message: "Payment released successfully" });
  } catch (error) {
    console.error("[projects] release payment error", error);
    return res.status(500).json({ error: "Failed to release payment" });
  }
});

// Submit rating
router.post("/projects/:projectId/rating", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { stars, feedback } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    await db.collection("projects").doc(projectId).set({
      rating: {
        stars: parseInt(stars),
        feedback,
        ratedAt: new Date().toISOString(),
      }
    }, { merge: true });

    return res.json({ success: true, message: "Rating submitted successfully" });
  } catch (error) {
    console.error("[projects] rating error", error);
    return res.status(500).json({ error: "Failed to submit rating" });
  }
});

// Get project messages
router.get("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 100 } = req.query;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const snapshot = await db.collection("projects").doc(projectId).collection("messages")
      .orderBy("createdAt", "asc")
      .limit(parseInt(limit))
      .get();

    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return res.json({ success: true, messages });
  } catch (error) {
    console.error("[projects] get messages error", error);
    return res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message
router.post("/projects/:projectId/messages", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { senderId, senderName, senderRole, content, type = "text" } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const messageData = {
      senderId,
      senderName,
      senderRole,
      content,
      type,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("projects").doc(projectId).collection("messages").add(messageData);

    return res.json({ 
      success: true, 
      messageId: docRef.id,
      message: messageData
    });
  } catch (error) {
    console.error("[projects] send message error", error);
    return res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;

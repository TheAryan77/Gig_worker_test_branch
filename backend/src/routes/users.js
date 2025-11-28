import { Router } from "express";
import { getDb } from "../config/firebase.js";

const router = Router();

// Get user by ID
router.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ success: true, user: { id: userDoc.id, ...userDoc.data() } });
  } catch (error) {
    console.error("[users] get user error", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user profile
router.put("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    // Add updatedAt timestamp
    updateData.updatedAt = new Date().toISOString();

    await db.collection("users").doc(userId).set(updateData, { merge: true });

    return res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("[users] update user error", error);
    return res.status(500).json({ error: "Failed to update profile" });
  }
});

// Complete freelancer profile
router.post("/users/:userId/freelancer-profile", async (req, res) => {
  try {
    const { userId } = req.params;
    const { hourlyRate, experience, responseTime, techStack, bio, location, profession } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    await db.collection("users").doc(userId).set({
      hourlyRate: parseFloat(hourlyRate) || 0,
      experience,
      responseTime,
      techStack: Array.isArray(techStack) ? techStack : [],
      bio,
      location,
      profession,
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return res.json({ success: true, message: "Freelancer profile completed" });
  } catch (error) {
    console.error("[users] freelancer profile error", error);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

// Complete worker profile
router.post("/users/:userId/worker-profile", async (req, res) => {
  try {
    const { userId } = req.params;
    const { experience, availability, serviceArea, hourlyRate, skills, bio, phone, location } = req.body;
    const db = getDb();
    
    if (!db) {
      return res.status(500).json({ error: "Database not configured" });
    }

    const skillsArray = Array.isArray(skills) ? skills : 
      (typeof skills === "string" ? skills.split(",").map(s => s.trim()).filter(Boolean) : []);

    await db.collection("users").doc(userId).set({
      experience,
      availability,
      serviceArea,
      hourlyRate: parseFloat(hourlyRate) || 0,
      skills: skillsArray,
      bio,
      phone,
      location,
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return res.json({ success: true, message: "Worker profile completed" });
  } catch (error) {
    console.error("[users] worker profile error", error);
    return res.status(500).json({ error: "Failed to save profile" });
  }
});

export default router;

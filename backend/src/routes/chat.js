import { Router } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = Router();

const SYSTEM_PROMPT = `You are TrustHire's helpful AI assistant. TrustHire is a freelancing platform that connects clients with skilled freelancers (coders, designers, writers, etc.) and workers (for tasks like delivery, cleaning, repairs, etc.).

Key features of TrustHire:
- Secure escrow payments via Razorpay (UPI, Cards, NetBanking) and Crypto (MetaMask)
- Verified freelancers and workers
- Project-based and hourly work options
- Safe milestone-based payments
- Rating and review system
- Both digital (coding, design) and physical (delivery, repairs) work categories

Your role:
- Help users understand how TrustHire works
- Answer questions about posting projects, hiring freelancers, or becoming a freelancer
- Explain the payment and escrow system
- Be friendly, concise, and helpful
- If you don't know something specific about TrustHire, provide general helpful guidance

Keep responses short and conversational (2-3 sentences max unless more detail is needed).`;

function getModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
}

router.post("/chat", async (req, res) => {
  try {
    const { message, history = [] } = req.body || {};

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = getModel();
    if (!model) {
      return res.json({ response: getFallbackResponse(message) });
    }

    const chat = model.startChat({
      history: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: "model",
          parts: [
            {
              text: "I understand. I'm TrustHire's AI assistant, ready to help users with questions about the platform, freelancing, payments, and more. I'll keep my responses friendly and concise.",
            },
          ],
        },
        ...history.map((msg) => ({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        })),
      ],
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });

    const result = await chat.sendMessage(message);
    const text = result.response.text();
    return res.json({ response: text });
  } catch (error) {
    console.error("[chat] API error", error);
    return res.status(500).json({
      response: "I'm having trouble connecting right now. Please try again in a moment!",
    });
  }
});

function getFallbackResponse(message) {
  const lower = (message || "").toLowerCase();

  if (lower.includes("payment") || lower.includes("pay")) {
    return "TrustHire supports secure payments via Razorpay (UPI, Cards, NetBanking) and Crypto (MetaMask). All payments are held in escrow until project completion!";
  }

  if (lower.includes("freelancer") || lower.includes("hire")) {
    return "You can browse verified freelancers on TrustHire, view their profiles and ratings, and hire them for your projects. Post a project to get started!";
  }

  if (lower.includes("project") || lower.includes("post")) {
    return "To post a project, describe your requirements, set a budget, and choose between fixed-price or hourly work. Freelancers will then apply to your project!";
  }

  if (lower.includes("escrow")) {
    return "Our escrow system holds payment securely until project milestones are completed. This protects both clients and freelancers!";
  }

  if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
    return "Hello! How can I help you today? I can answer questions about hiring freelancers, posting projects, or our payment system.";
  }

  return "I'm here to help with TrustHire! You can ask me about posting projects, hiring freelancers, payments, or how our platform works.";
}

export default router;

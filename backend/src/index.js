import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat.js";
import razorpayRouter from "./routes/razorpay.js";
import usersRouter from "./routes/users.js";
import jobsRouter from "./routes/jobs.js";
import applicationsRouter from "./routes/applications.js";
import projectsRouter from "./routes/projects.js";
import transactionsRouter from "./routes/transactions.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", chatRouter);
app.use("/api", razorpayRouter);
app.use("/api", usersRouter);
app.use("/api", jobsRouter);
app.use("/api", applicationsRouter);
app.use("/api", projectsRouter);
app.use("/api", transactionsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
  console.log(`TrustHire backend running on http://localhost:${port}`);
});

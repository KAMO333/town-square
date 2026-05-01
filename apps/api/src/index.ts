import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cron from "node-cron";
import eventRoutes from "./routes/event.routes";
import { expireOldEvents } from "./services/expiry.service";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Town Square API is running" });
});

app.use("/api/events", eventRoutes);

// Run every night at 4AM
cron.schedule("0 4 * * *", async () => {
  console.log("Running nightly event expiry...");
  await expireOldEvents();
});

export { app };

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import eventRoutes from "./routes/event.routes";

dotenv.config();

const app = express();

app.use(cors());

// Update these two lines to allow larger payloads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", message: "Town Square API is running" });
});

app.use("/api/events", eventRoutes);

export { app };

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

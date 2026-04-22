import request from "supertest";
import express from "express";
import { prisma } from "../lib/prisma";
import eventRoutes from "../routes/event.routes";
import * as posterParser from "../services/posterParser.service";

jest.mock("../services/posterParser.service");

const app = express();
app.use(express.json());
app.use("/api/events", eventRoutes);

describe("POST /api/events/parse-poster", () => {
  beforeAll(async () => {
    await prisma.event.deleteMany();
    await prisma.venue.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should accept a poster URL, parse it, and save the event", async () => {
    (posterParser.parsePosterImage as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        eventName: "Soweto Massive",
        eventDate: "2026-05-01",
        eventTime: "20:00",
        venue: "Zone 6 Venue",
        address: "28 Blackchain Shopping Centre",
        vibe: ["Amapiano", "Live Music"],
      },
    });

    const response = await request(app)
      .post("/api/events/parse-poster")
      .send({ imageUrl: "https://cloudinary.com/fake-poster.webp" });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.eventName).toBe("Soweto Massive");
    expect(response.body.data.venueId).toBeDefined();
  });
});

import { prisma } from "../lib/prisma";

describe("Event Storage (PostgreSQL + PostGIS)", () => {
  beforeAll(async () => {
    // Clear the DB before testing
    await prisma.event.deleteMany();
    await prisma.venue.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should create a venue and an event linked to it", async () => {
    // 1. Create a Venue (The Ghost Record)
    const venue = await prisma.venue.create({
      data: {
        name: "Makubenjalo",
        address: "24097 Dippenaar St, Diepkloof Zone 2",
        vibeTags: ["Amapiano", "Deep House"],
      },
    });

    expect(venue.id).toBeDefined();

    // 2. Create an Event linked to that venue
    const event = await prisma.event.create({
      data: {
        eventName: "Colourful Sessions",
        posterUrl: "https://cloudinary.com/test-poster.webp",
        eventDate: new Date("2026-04-25"),
        eventTime: "18:00",
        vibe: ["Amapiano"],
        venueId: venue.id,
      },
    });

    expect(event.venueId).toBe(venue.id);
    expect(event.eventName).toBe("Colourful Sessions");
  });
});

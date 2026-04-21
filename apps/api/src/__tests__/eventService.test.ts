import { prisma } from "../lib/prisma";
import { EventService } from "../services/event.service";

describe("EventService - Ghost Venue Logic", () => {
  beforeAll(async () => {
    await prisma.event.deleteMany();
    await prisma.venue.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should reuse an existing venue instead of creating a duplicate", async () => {
    const existingVenue = await prisma.venue.create({
      data: {
        name: "Zone 6 Venue",
        address: "28 Blackchain Shopping Centre, Diepkloof",
        vibeTags: ["Mainstream", "Amapiano"],
      },
    });

    const parsedPosterData = {
      eventName: "Soweto Massive",
      posterUrl: "https://cloudinary.com/zone6.webp",
      eventDate: new Date("2026-05-01"),
      eventTime: "20:00",
      vibe: ["Amapiano", "Live Music"],
      venueName: "Zone 6 Venue",
    };
    const savedEvent = await EventService.saveParsedEvent(parsedPosterData);

    expect(savedEvent.venueId).toBe(existingVenue.id);
    expect(savedEvent.eventName).toBe("Soweto Massive");

    const venueCount = await prisma.venue.count();
    expect(venueCount).toBe(1);
  });
});

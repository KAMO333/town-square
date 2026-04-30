import { prisma } from "../lib/prisma";

export interface ParsedEventData {
  eventName: string | null;
  posterUrl: string;
  eventDate: Date;
  eventTime: string;
  vibe: string[];
  venueName: string;
  address: string;
}

export class EventService {
  static async saveParsedEvent(data: ParsedEventData) {
    let venue = await prisma.venue.findUnique({
      where: {
        name: data.venueName,
      },
    });

    if (!venue) {
      venue = await prisma.venue.create({
        data: {
          name: data.venueName,
          address: data.address,
          vibeTags: data.vibe,
        },
      });
    }

    const event = await prisma.event.create({
      data: {
        eventName: data.eventName,
        posterUrl: data.posterUrl,
        eventDate: data.eventDate,
        eventTime: data.eventTime,
        vibe: data.vibe,
        venueId: venue.id,
      },
    });

    return event;
  }
}

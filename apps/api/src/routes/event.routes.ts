import { Router, Request, Response } from "express";
import { parsePosterImage } from "../services/posterParser.service";
import { EventService } from "../services/event.service";
import { prisma } from "../lib/prisma";

const router = Router();

router.post(
  "/parse-poster",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        return res.status(400).json({
          success: false,
          error: "imageUrl is required",
        });
      }

      const parsedResult = await parsePosterImage(imageUrl);

      if (
        !parsedResult.success ||
        !parsedResult.data ||
        !parsedResult.data.venue ||
        !parsedResult.data.eventName
      ) {
        return res.status(422).json({
          success: false,
          error: "Could not extract sufficient event details from the poster.",
        });
      }

      const savedEvent = await EventService.saveParsedEvent({
        eventName: parsedResult.data.eventName,
        posterUrl: imageUrl,
        eventDate: new Date(parsedResult.data.eventDate),
        eventTime: parsedResult.data.eventTime,
        vibe: parsedResult.data.vibe || [],
        venueName: parsedResult.data.venue,
      });

      return res.status(201).json({
        success: true,
        data: savedEvent,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  },
);

router.get("/", async (_req: Request, res: Response) => {
  try {
    const events = await prisma.event.findMany({
      include: { venue: true },
      orderBy: { eventDate: "asc" },
    });
    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch events" });
  }
});

export default router;

import { Router, Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { parsePosterImage } from "../services/posterParser.service";
import { EventService } from "../services/event.service";
import { expireOldEvents } from "../services/expiry.service";
import { prisma } from "../lib/prisma";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

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
          missingFields: !parsedResult.success
            ? parsedResult.missingFields
            : [],
        });
      }

      const savedEvent = await EventService.saveParsedEvent({
        eventName: parsedResult.data.eventName,
        posterUrl: imageUrl,
        eventDate: new Date(parsedResult.data.eventDate),
        eventTime: parsedResult.data.eventTime,
        vibe: parsedResult.data.vibe || [],
        venueName: parsedResult.data.venue,
        address: parsedResult.data.address || "",
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

router.post(
  "/parse-only",
  async (req: Request, res: Response): Promise<any> => {
    try {
      const { imageUrl } = req.body;
      if (!imageUrl)
        return res
          .status(400)
          .json({ success: false, error: "imageUrl is required" });

      const parsedResult = await parsePosterImage(imageUrl);

      if (!parsedResult.success) {
        return res.status(422).json({
          success: false,
          error: "Could not extract sufficient event details from the poster.",
          missingFields: parsedResult.missingFields,
        });
      }

      return res.status(200).json({
        success: true,
        data: parsedResult.data,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Internal server error" });
    }
  },
);

router.post("/confirm", async (req: Request, res: Response): Promise<any> => {
  try {
    const { parsedData, posterUrl } = req.body;

    if (!parsedData || !posterUrl) {
      return res.status(400).json({
        success: false,
        error: "parsedData and posterUrl are required",
      });
    }

    console.log("Uploading to Cloudinary...");
    const uploadResult = await cloudinary.uploader.upload(posterUrl, {
      folder: "town-square",
      transformation: [{ format: "webp", quality: "auto" }],
    });
    console.log("Cloudinary URL:", uploadResult.secure_url);

    const savedEvent = await EventService.saveParsedEvent({
      eventName: parsedData.eventName,
      posterUrl: uploadResult.secure_url,
      eventDate: new Date(parsedData.eventDate),
      eventTime: parsedData.eventTime || "Till Late",
      vibe: parsedData.vibe || [],
      venueName: parsedData.venue,
      address: parsedData.address || "",
    });

    return res.status(201).json({ success: true, data: savedEvent });
  } catch (error) {
    console.error("Confirm error:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
});

router.get("/", async (_req: Request, res: Response) => {
  const events = await prisma.event.findMany({
    where: { isExpired: false },
    include: { venue: true },
    orderBy: { eventDate: "asc" },
  });
  res.json({ success: true, data: events });
});

router.post("/expire-now", async (_req: Request, res: Response) => {
  try {
    await expireOldEvents();
    res.json({ success: true, message: "Expiry run complete" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Expiry failed" });
  }
});

export default router;

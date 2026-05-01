import { prisma } from "../lib/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function expireOldEvents() {
  const now = new Date();

  // Find all events where date has passed and not yet expired
  const expiredEvents = await prisma.event.findMany({
    where: {
      eventDate: { lt: now },
      isExpired: false,
    },
  });

  if (expiredEvents.length === 0) {
    console.log("No events to expire.");
    return;
  }

  console.log(`Expiring ${expiredEvents.length} event(s)...`);

  for (const event of expiredEvents) {
    // Delete poster from Cloudinary
    if (event.posterUrl) {
      try {
        const publicId = event.posterUrl
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^/.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted poster: ${publicId}`);
      } catch (err) {
        console.error(`Failed to delete poster for event ${event.id}:`, err);
      }
    }

    // Mark event as expired and remove posterUrl
    await prisma.event.update({
      where: { id: event.id },
      data: {
        isExpired: true,
        posterUrl: "",
      },
    });

    console.log(`Expired: ${event.eventName}`);
  }

  console.log("Expiry run complete.");
}

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export interface ParsedPosterData {
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  address: string;
  vibe: string[];
}

export type ParseResult =
  | { success: true; data: ParsedPosterData }
  | { success: false; missingFields: string[] };

async function imageUrlToBase64(
  input: string,
): Promise<{ base64: string; mimeType: string }> {
  if (input.startsWith("data:image")) {
    const [header, base64] = input.split(",");
    const mimeType = header.match(/:(.*?);/)?.[1] || "image/jpeg";
    return { base64, mimeType };
  }

  const response = await fetch(input);
  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = response.headers.get("content-type") || "image/jpeg";
  return { base64, mimeType };
}

export async function parsePosterImage(imageUrl: string): Promise<ParseResult> {
  try {
    const { base64, mimeType } = await imageUrlToBase64(imageUrl);

    const prompt = `You are an event poster parser. Extract the following fields from this event poster image and return ONLY valid JSON, nothing else:
{
  "eventName": "name of the event",
  "eventDate": "date in YYYY-MM-DD format",
  "eventTime": "time doors open or event starts",
  "venue": "name of the venue",
  "address": "full address if visible",
  "vibe": ["array", "of", "music", "or", "event", "genres"]
}

If a field is not found on the poster, set its value to null. Return only the JSON object, no explanation.`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64,
          mimeType,
        },
      },
    ]);

    const raw = result.response.text();
    let parsed: Partial<ParsedPosterData & Record<string, null>> = {};

    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return {
        success: false,
        missingFields: ["eventDate", "eventTime", "venue"],
      };
    }

    const missingFields: string[] = [];
    const isMissing = (val: any) =>
      !val ||
      val === "null" ||
      val === "" ||
      (Array.isArray(val) && val.length === 0);

    if (isMissing(parsed.eventDate)) missingFields.push("eventDate");
    if (isMissing(parsed.eventTime)) missingFields.push("eventTime");
    if (isMissing(parsed.venue)) missingFields.push("venue");

    if (isMissing(parsed.address)) {
      console.log(
        `Address missing for ${parsed.venue}. Ghost directory lookup required.`,
      );
    }
    if (missingFields.length > 0) {
      return { success: false, missingFields };
    }

    return {
      success: true,
      data: parsed as ParsedPosterData,
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      missingFields: ["system_error"],
    };
  }
}

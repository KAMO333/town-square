const mockGenerateContent = jest.fn();

jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

global.fetch = jest.fn().mockResolvedValue({
  arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  headers: { get: () => "image/jpeg" },
});

import { parsePosterImage } from "../services/posterParser.service";

describe("parsePosterImage", () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it("should return parsed data when all fields are found", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            eventName: "Colourful Sessions",
            eventDate: "2026-04-25",
            eventTime: "18:00",
            venue: "Makubenjalo",
            address: "24097 Dippenaar St, Diepkloof Zone 2",
            vibe: ["Amapiano", "Deep House"],
          }),
      },
    });

    const result = await parsePosterImage(
      "https://fake-image-url.com/poster.jpg",
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveProperty("eventDate");
      expect(result.data).toHaveProperty("eventTime");
      expect(result.data).toHaveProperty("venue");
    }
  });

  it("should return failure when image has no event data", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      response: {
        text: () =>
          JSON.stringify({
            eventName: null,
            eventDate: null,
            eventTime: null,
            venue: null,
            address: null,
            vibe: [],
          }),
      },
    });

    const result = await parsePosterImage(
      "https://fake-image-url.com/random.jpg",
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.missingFields).toBeInstanceOf(Array);
      expect(result.missingFields.length).toBeGreaterThan(0);
    }
  });
});

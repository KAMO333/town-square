import AsyncStorage from "@react-native-async-storage/async-storage";

const SAVED_EVENTS_KEY = "town_square_saved_events";

export interface SavedEvent {
  id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  posterUrl: string;
  venue: {
    name: string;
    address?: string;
  };
  savedAt: string;
  contact: string;
}

export const saveEvent = async (event: any, contact: string): Promise<void> => {
  try {
    const existing = await getSavedEvents();
    const alreadySaved = existing.find((e) => e.id === event.id);
    if (alreadySaved) return;

    const savedEvent: SavedEvent = {
      id: event.id,
      eventName: event.eventName,
      eventDate: event.eventDate,
      eventTime: event.eventTime,
      posterUrl: event.posterUrl,
      venue: {
        name: event.venue?.name || "Unknown Venue",
        address: event.venue?.address,
      },
      savedAt: new Date().toISOString(),
      contact,
    };

    const updated = [...existing, savedEvent];
    await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save event:", error);
  }
};

export const getSavedEvents = async (): Promise<SavedEvent[]> => {
  try {
    const data = await AsyncStorage.getItem(SAVED_EVENTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to get saved events:", error);
    return [];
  }
};

export const removeSavedEvent = async (eventId: string): Promise<void> => {
  try {
    const existing = await getSavedEvents();
    const updated = existing.filter((e) => e.id !== eventId);
    await AsyncStorage.setItem(SAVED_EVENTS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to remove saved event:", error);
  }
};

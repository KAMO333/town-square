import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "https://town-square-api.onrender.com/api/events";

const mapStyle = [
  { elementType: "geometry", stylers: [{ color: "#212121" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#757575" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#212121" }] },
  {
    featureType: "administrative",
    elementType: "geometry",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#181818" }],
  },
  {
    featureType: "road",
    elementType: "geometry.fill",
    stylers: [{ color: "#2c2c2c" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#000000" }],
  },
];

interface Venue {
  name: string;
  latitude?: number;
  longitude?: number;
}

interface Event {
  id: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  vibe: string[];
  posterUrl: string;
  venue: Venue;
}

const getVibeIcon = (vibe: string[]): string => {
  if (!vibe || vibe.length === 0) return "🎵";
  const first = vibe[0].toLowerCase();
  if (
    first.includes("amapiano") ||
    first.includes("house") ||
    first.includes("dj")
  )
    return "🎵";
  if (first.includes("pub") || first.includes("bar") || first.includes("beer"))
    return "🍺";
  if (
    first.includes("theatre") ||
    first.includes("theater") ||
    first.includes("comedy")
  )
    return "🎭";
  if (first.includes("jazz") || first.includes("live")) return "🎷";
  return "🎵";
};

export default function MapScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch(API_URL);
      const json = await res.json();
      if (json.success) setEvents(json.data);
    } catch (error) {
      console.error(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, []),
  );

  const isTonight = (dateStr: string) =>
    new Date(dateStr).toDateString() === new Date().toDateString();

  const renderVenueItem = ({ item }: { item: Event }) => {
    const tonight = isTonight(item.eventDate);
    const icon = getVibeIcon(item.vibe);

    return (
      <TouchableOpacity
        style={[
          styles.venueCard,
          selectedEventId === item.id && styles.activeCard,
        ]}
        onPress={() => {
          setSelectedEventId(item.id);
          (navigation as any).navigate("EventDetail", { event: item });
        }}
      >
        <View style={styles.venueIconBox}>
          <Text style={styles.venueIcon}>{icon}</Text>
        </View>
        <View style={styles.venueInfo}>
          <Text style={styles.venueName}>
            {item.venue?.name || "Unknown Venue"}
          </Text>
          <Text style={styles.eventName}>{item.eventName}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text
            style={[styles.statusText, { color: tonight ? "#ff3c00" : "#666" }]}
          >
            {tonight ? "TONIGHT" : "UPCOMING"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapStyle}
        initialRegion={{
          latitude: -26.2485,
          longitude: 27.9333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {events.map((event) => {
          const tonight = isTonight(event.eventDate);
          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.venue?.latitude || -26.2485,
                longitude: event.venue?.longitude || 27.9333,
              }}
              pinColor={tonight ? "#ff3c00" : "#444444"}
              onPress={() => setSelectedEventId(event.id)}
            />
          );
        })}
      </MapView>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>SOWETO DIRECTORY</Text>
      </View>

      <View style={styles.directoryWrapper}>
        <FlatList
          data={events}
          renderItem={renderVenueItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  map: { width: "100%", height: "55%" },
  header: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(10,10,10,0.9)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  headerTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 18,
    color: "#fff",
    letterSpacing: 1,
  },
  directoryWrapper: {
    flex: 1,
    backgroundColor: "#050505",
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 16,
  },
  listPadding: { paddingHorizontal: 16, paddingBottom: 100 },
  venueCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#141414",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  activeCard: { borderColor: "#ff3c00" },
  venueIconBox: {
    width: 36,
    height: 36,
    backgroundColor: "rgba(255,60,0,0.1)",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  venueIcon: { fontSize: 16 },
  venueInfo: { flex: 1 },
  venueName: { color: "#fff", fontFamily: "DMSans_700Bold", fontSize: 13 },
  eventName: {
    color: "#666",
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  statusBadge: { alignItems: "flex-end", flexShrink: 0 },
  statusText: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 9,
    letterSpacing: 0.5,
  },
});

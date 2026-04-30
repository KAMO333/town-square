import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://192.168.1.9:3000/api/events";

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

export default function MapScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setEvents(json.data);
      });
  }, []);

  const renderVenueItem = ({ item }: any) => {
    const isTonight =
      new Date(item.eventDate).toDateString() === new Date().toDateString();

    return (
      <TouchableOpacity
        style={[
          styles.venueCard,
          selectedEventId === item.id && styles.activeCard,
        ]}
        onPress={() =>
          navigation.navigate("EventDetail" as never, { event: item } as never)
        }
      >
        <View>
          <Text style={styles.venueName}>
            {item.venue?.name || "Unknown Venue"}
          </Text>
          <Text style={styles.eventName}>{item.eventName}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: isTonight ? "#ff3c00" : "#666" },
            ]}
          >
            {isTonight ? "TONIGHT" : "UPCOMING"}
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
          latitude: -26.2485, // Soweto/Diepkloof area
          longitude: 27.9333,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {events.map((event: any) => {
          const isTonight =
            new Date(event.eventDate).toDateString() ===
            new Date().toDateString();
          return (
            <Marker
              key={event.id}
              coordinate={{
                latitude: event.venue?.latitude || -26.2485,
                longitude: event.venue?.longitude || 27.9333,
              }}
              pinColor={isTonight ? "#ff3c00" : "#444444"} // Red for tonight, Grey for upcoming
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
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listPadding}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  map: { width: "100%", height: "60%" },
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
    paddingTop: 20,
  },
  listPadding: { paddingHorizontal: 20, paddingBottom: 100 },
  venueCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#141414",
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  activeCard: { borderColor: "#ff3c00" },
  venueName: { color: "#fff", fontFamily: "DMSans_700Bold", fontSize: 14 },
  eventName: {
    color: "#666",
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: { alignItems: "flex-end" },
  statusText: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 9,
    letterSpacing: 0.5,
  },
});

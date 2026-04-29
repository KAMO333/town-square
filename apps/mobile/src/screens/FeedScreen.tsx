import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const API_URL = "http://192.168.1.9:3000/api/events";

export default function FeedScreen() {
  const navigation = useNavigation();
  const [events, setEvents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = async () => {
    try {
      const response = await fetch(API_URL);
      const json = await response.json();
      if (json.success) setEvents(json.data);
    } catch (error) {
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>
          TOWN<Text style={styles.logoAccent}>SQ</Text>
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Text>🔍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Text>🔔</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{events.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.locationBar}>
        <Text style={styles.pin}>◉</Text>
        <Text style={styles.locationText}>
          Near <Text style={styles.locationBold}>Diepkloof, Soweto</Text>
        </Text>
      </View>

      <ScrollView
        style={styles.feed}
        contentContainerStyle={styles.feedContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3c00"
            colors={["#ff3c00"]}
          />
        }
      >
        {events &&
          events.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={styles.posterCard}
              activeOpacity={0.9}
              onPress={() =>
                Alert.alert(
                  item.eventName,
                  `Venue: ${item.venue?.name}\n\nNavigation context is secure!`,
                )
              }
            >
              <View
                style={[
                  styles.posterImgPlaceholder,
                  { backgroundColor: "#1e1e1e" },
                ]}
              >
                {item.posterUrl && (
                  <Image
                    source={{ uri: item.posterUrl }}
                    style={styles.posterImg}
                  />
                )}
                <View style={styles.posterOverlay}>
                  <Text style={styles.posterTitle}>{item.eventName}</Text>
                </View>
              </View>
              <View style={styles.posterMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaDot}>◉</Text>
                  <Text style={styles.metaText}>
                    {item.venue?.name || "Unknown Venue"}
                  </Text>
                </View>
                <View style={styles.vibeTag}>
                  <Text style={styles.vibeTagText}>
                    {item.vibe?.[0] || "EVENT"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  logo: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 28,
    color: "#f0f0f0",
    letterSpacing: 2,
  },
  logoAccent: { color: "#ff3c00" },
  headerIcons: { flexDirection: "row", gap: 8 },
  iconBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#1e1e1e",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#ff3c00",
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: { color: "#fff", fontSize: 8, fontFamily: "SpaceMono_700Bold" },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 6,
  },
  pin: { color: "#ff3c00", fontSize: 12 },
  locationText: {
    color: "#666",
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
  },
  locationBold: { color: "#f0f0f0", fontFamily: "DMSans_700Bold" },
  feed: { flex: 1, paddingHorizontal: 16 },
  feedContent: { gap: 16, paddingBottom: 20 },
  posterCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  posterImgPlaceholder: {
    width: "100%",
    height: 180,
    justifyContent: "flex-end",
  },
  posterImg: { ...StyleSheet.absoluteFillObject, resizeMode: "cover" },
  posterOverlay: { padding: 16, backgroundColor: "rgba(0,0,0,0.6)" },
  posterTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 22,
    color: "#fff",
    letterSpacing: 1,
  },
  posterMeta: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    gap: 10,
  },
  metaItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  metaDot: { color: "#ff3c00", fontSize: 10 },
  metaText: { color: "#888", fontFamily: "DMSans_400Regular", fontSize: 11 },
  vibeTag: {
    marginLeft: "auto",
    backgroundColor: "#1e1e1e",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  vibeTagText: {
    color: "#ffb800",
    fontFamily: "DMSans_700Bold",
    fontSize: 9,
    textTransform: "uppercase",
  },
});

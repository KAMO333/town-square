import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";

const API_URL = "http://192.168.1.9:3000/api/events";
const FILTERS = ["All", "Tonight", "Club", "Pub", "Street"];

export default function FeedScreen() {
  const navigation = useNavigation<NavigationProp<any>>();
  const [events, setEvents] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");

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

  useFocusEffect(
    useCallback(() => {
      fetchEvents();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  const isTonight = (dateStr: string) =>
    new Date(dateStr).toDateString() === new Date().toDateString();

  const filteredEvents = events.filter((item) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Tonight") return isTonight(item.eventDate);
    return item.vibe?.some((v: string) =>
      v.toLowerCase().includes(activeFilter.toLowerCase()),
    );
  });

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
        <Text style={styles.radiusText}>5km ▾</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, activeFilter === f && styles.chipActive]}
            onPress={() => setActiveFilter(f)}
          >
            <Text
              style={[
                styles.chipText,
                activeFilter === f && styles.chipTextActive,
              ]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
        {filteredEvents.map((item: any) => (
          <TouchableOpacity
            key={item.id}
            style={styles.posterCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
          >
            <View style={styles.posterImgPlaceholder}>
              {item.posterUrl && (
                <Image
                  source={{ uri: item.posterUrl }}
                  style={styles.posterImg}
                />
              )}
              {isTonight(item.eventDate) && (
                <View style={styles.tonightBadge}>
                  <Text style={styles.tonightBadgeText}>TONIGHT</Text>
                </View>
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
    paddingBottom: 12,
    gap: 6,
  },
  pin: { color: "#ff3c00", fontSize: 12 },
  locationText: {
    color: "#666",
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
  },
  locationBold: { color: "#f0f0f0", fontFamily: "DMSans_700Bold" },
  radiusText: { marginLeft: "auto", color: "#ff3c00", fontSize: 11 },
  filterRow: { flexGrow: 0 },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 8,
    flexDirection: "row",
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#2a2a2a",
    backgroundColor: "#141414",
  },
  chipActive: { backgroundColor: "#ff3c00", borderColor: "#ff3c00" },
  chipText: { color: "#666", fontSize: 11, fontWeight: "600" },
  chipTextActive: { color: "#fff" },
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
    backgroundColor: "#1e1e1e",
  },
  posterImg: { ...StyleSheet.absoluteFillObject, resizeMode: "cover" },
  tonightBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: "#ff3c00",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  tonightBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
    fontFamily: "SpaceMono_700Bold",
  },
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

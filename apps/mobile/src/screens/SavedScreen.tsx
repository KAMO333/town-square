import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import {
  getSavedEvents,
  removeSavedEvent,
  SavedEvent,
} from "../services/savedEvents";

export default function SavedScreen() {
  const navigation = useNavigation();
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([]);

  const loadSaved = async () => {
    const events = await getSavedEvents();
    setSavedEvents(events);
  };

  useFocusEffect(
    useCallback(() => {
      loadSaved();
    }, []),
  );

  const isExpired = (dateStr: string) => new Date(dateStr) < new Date();

  const handleRemove = (eventId: string, eventName: string) => {
    Alert.alert("Remove Event", `Remove ${eventName} from your saved list?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          await removeSavedEvent(eventId);
          loadSaved();
        },
      },
    ]);
  };

  const renderItem = ({ item }: { item: SavedEvent }) => {
    const expired = isExpired(item.eventDate);

    return (
      <View style={[styles.card, expired && styles.cardExpired]}>
        <View style={styles.cardLeft}>
          {item.posterUrl ? (
            <Image
              source={{ uri: item.posterUrl }}
              style={[styles.thumb, expired && styles.thumbExpired]}
            />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]} />
          )}
        </View>

        <View style={styles.cardInfo}>
          <Text style={[styles.eventName, expired && styles.textMuted]}>
            {item.eventName}
          </Text>
          <Text style={styles.venueName}>{item.venue?.name}</Text>
          <Text style={styles.eventDate}>
            {new Date(item.eventDate).toDateString()} · {item.eventTime}
          </Text>
        </View>

        <View style={styles.cardRight}>
          {expired ? (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>EXPIRED</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.viewBtn}
              onPress={() =>
                (navigation as any).navigate("EventDetail", { event: item })
              }
            >
              <Text style={styles.viewBtnText}>VIEW</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => handleRemove(item.id, item.eventName)}
          >
            <Text style={styles.removeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          SAVED<Text style={styles.headerAccent}> EVENTS</Text>
        </Text>
        <Text style={styles.headerCount}>{savedEvents.length} saved</Text>
      </View>

      {savedEvents.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>♡</Text>
          <Text style={styles.emptyTitle}>NOTHING SAVED YET</Text>
          <Text style={styles.emptySub}>
            Tap "Remind Me" on any event to save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedEvents}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
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
    paddingVertical: 16,
  },
  headerTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 24,
    color: "#f0f0f0",
    letterSpacing: 2,
  },
  headerAccent: { color: "#ff3c00" },
  headerCount: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    color: "#666",
  },

  list: { paddingHorizontal: 16, paddingBottom: 100 },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    backgroundColor: "#141414",
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  cardExpired: { opacity: 0.5 },
  cardLeft: { flexShrink: 0 },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    resizeMode: "cover",
  },
  thumbExpired: { opacity: 0.4 },
  thumbPlaceholder: { backgroundColor: "#3d1a6e" },
  cardInfo: { flex: 1 },
  eventName: {
    fontFamily: "DMSans_700Bold",
    fontSize: 13,
    color: "#f0f0f0",
  },
  textMuted: { color: "#666" },
  venueName: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#666",
    marginTop: 2,
  },
  eventDate: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 9,
    color: "#444",
    marginTop: 4,
  },
  cardRight: { alignItems: "flex-end", gap: 6, flexShrink: 0 },
  expiredBadge: {
    backgroundColor: "#1e1e1e",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  expiredText: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 8,
    color: "#444",
    letterSpacing: 0.5,
  },
  viewBtn: {
    backgroundColor: "#ff3c00",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  viewBtnText: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 9,
    color: "#fff",
    letterSpacing: 0.5,
  },
  removeBtn: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  removeBtnText: { color: "#444", fontSize: 12 },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    paddingBottom: 100,
  },
  emptyIcon: { fontSize: 48, color: "#2a2a2a" },
  emptyTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 22,
    color: "#2a2a2a",
    letterSpacing: 2,
  },
  emptySub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#444",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});

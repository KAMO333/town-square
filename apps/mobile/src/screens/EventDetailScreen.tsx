import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function EventDetailScreen({ route, navigation }: any) {
  const { event } = route.params;

  const openMaps = () => {
    const query = encodeURIComponent(event.venue?.name || event.eventName);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  };

  const requestUber = () => {
    const nickname = encodeURIComponent(event.venue?.name);
    Linking.openURL(`uber://?action=setPickup&dropoff[nickname]=${nickname}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backText}>←</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerImage}>
          {event.posterUrl ? (
            <Image source={{ uri: event.posterUrl }} style={styles.poster} />
          ) : (
            <View style={styles.placeholder} />
          )}
          <View style={styles.overlay}>
            <Text style={styles.title}>{event.eventName}</Text>
            <Text style={styles.venueSub}>{event.venue?.name}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.infoBox}>
            <Text style={styles.label}>DATE & TIME</Text>
            <Text style={styles.value}>
              {new Date(event.eventDate).toDateString()} · {event.eventTime}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.label}>LOCATION</Text>
            <Text style={styles.value}>{event.venue?.name}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnPrimary} onPress={openMaps}>
              <Text style={styles.btnText}>🗺 Open in Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnSecondary} onPress={requestUber}>
              <Text style={styles.btnTextSec}>🚗 Request Uber</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  backText: { color: "#fff", fontSize: 20 },
  headerImage: { width: "100%", height: 400 },
  poster: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { width: "100%", height: "100%", backgroundColor: "#1e1e1e" },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
  },
  title: { fontFamily: "BebasNeue_400Regular", fontSize: 32, color: "#fff" },
  venueSub: { fontFamily: "DMSans_400Regular", color: "#888", fontSize: 16 },
  body: { padding: 20, gap: 16 },
  infoBox: {
    padding: 16,
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  label: {
    fontFamily: "SpaceMono_400Regular",
    fontSize: 10,
    color: "#666",
    marginBottom: 4,
  },
  value: { fontFamily: "DMSans_700Bold", fontSize: 14, color: "#f0f0f0" },
  actions: { gap: 10, marginTop: 10 },
  btnPrimary: {
    backgroundColor: "#ff3c00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnSecondary: {
    backgroundColor: "#1e1e1e",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  btnText: { color: "#fff", fontFamily: "DMSans_700Bold" },
  btnTextSec: { color: "#f0f0f0", fontFamily: "DMSans_700Bold" },
});

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RemindMeScreen({ route, navigation }: any) {
  const { event } = route.params;
  const [contact, setContact] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSetReminder = () => {
    if (!contact.trim()) {
      Alert.alert("Required", "Please enter a phone number or email.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Saved event preview */}
        <View style={styles.eventPreview}>
          <View style={styles.eventThumb} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventTitle}>{event.eventName}</Text>
            <Text style={styles.eventMeta}>
              {new Date(event.eventDate).toDateString()} · {event.venue?.name}
            </Text>
          </View>
          <View style={styles.savedCheck}>
            <Text style={styles.savedCheckText}>✓</Text>
          </View>
        </View>

        {!submitted ? (
          <>
            {/* Auth prompt */}
            <View style={styles.authPrompt}>
              <Text style={styles.authIcon}>🔔</Text>
              <Text style={styles.authTitle}>GET NOTIFIED</Text>
              <Text style={styles.authSubtitle}>
                Drop your number or email and we'll remind you before this
                event.
              </Text>
            </View>

            {/* Input */}
            <TextInput
              style={styles.input}
              placeholder="Phone number or email"
              placeholderTextColor="#666"
              value={contact}
              onChangeText={setContact}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleSetReminder}
            >
              <Text style={styles.btnPrimaryText}>Set Reminder →</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnSecondaryText}>Continue Browsing</Text>
            </TouchableOpacity>

            <Text style={styles.finePrint}>
              We only use this to send your event reminder. Nothing else.
            </Text>
          </>
        ) : (
          /* Success state */
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>YOU'RE ON THE LIST</Text>
            <Text style={styles.successSub}>
              We'll remind you before {event.eventName}. See you there.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, { marginTop: 20 }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.btnPrimaryText}>Back to Feed</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  content: { padding: 16, gap: 14 },

  eventPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#141414",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  eventThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: "#3d1a6e",
    flexShrink: 0,
  },
  eventInfo: { flex: 1 },
  eventTitle: { color: "#fff", fontFamily: "DMSans_700Bold", fontSize: 13 },
  eventMeta: {
    color: "#666",
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    marginTop: 2,
  },
  savedCheck: {
    width: 24,
    height: 24,
    backgroundColor: "rgba(0,230,118,0.15)",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  savedCheckText: { color: "#00e676", fontSize: 12, fontWeight: "700" },

  authPrompt: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  authIcon: { fontSize: 28 },
  authTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 22,
    color: "#f0f0f0",
    letterSpacing: 1,
  },
  authSubtitle: {
    fontFamily: "DMSans_400Regular",
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },

  input: {
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 12,
    padding: 14,
    color: "#f0f0f0",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
  },

  btnPrimary: {
    backgroundColor: "#ff3c00",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontFamily: "DMSans_700Bold", fontSize: 14 },

  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#2a2a2a" },
  dividerText: { color: "#666", fontFamily: "DMSans_400Regular", fontSize: 12 },

  btnSecondary: {
    backgroundColor: "#141414",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  btnSecondaryText: {
    color: "#f0f0f0",
    fontFamily: "DMSans_400Regular",
    fontSize: 14,
  },

  finePrint: {
    fontFamily: "DMSans_400Regular",
    fontSize: 10,
    color: "#444",
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 20,
  },

  successCard: {
    backgroundColor: "#141414",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,230,118,0.2)",
    padding: 30,
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  successIcon: { fontSize: 40 },
  successTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 24,
    color: "#00e676",
    letterSpacing: 1,
  },
  successSub: {
    fontFamily: "DMSans_400Regular",
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
  },
});

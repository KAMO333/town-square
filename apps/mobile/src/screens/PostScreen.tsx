import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Animated,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const PARSE_URL = "https://town-square-api.onrender.com/api/events/parse-only";
const CONFIRM_URL = "https://town-square-api.onrender.com/api/events/confirm";

type Status = "idle" | "loading" | "success" | "failure";

export default function PostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [base64Image, setBase64Image] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [parsedData, setParsedData] = useState<any>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status === "loading") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [status]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
      setBase64Image(`data:image/jpeg;base64,${result.assets[0].base64}`);
      setStatus("idle");
    }
  };

  // Helper to make dates readable (e.g., "Thursday, 30 April 2026")
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr === "null") return null;
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleSubmit = async () => {
    if (!base64Image) return;
    setStatus("loading");

    try {
      const response = await fetch(PARSE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: base64Image }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setParsedData(result.data);
        setStatus("success");
      } else if (response.status === 422) {
        setMissingFields(result.missingFields || []);
        setParsedData(result.data || null);
        setStatus("failure");
      } else {
        Alert.alert("Server Error", "Could not parse the poster.");
        setStatus("idle");
      }
    } catch (error) {
      Alert.alert("Network Error", "Check your connection to the Acer server.");
      setStatus("idle");
    }
  };

  const handleConfirm = async () => {
    setIsPublishing(true);
    try {
      const response = await fetch(CONFIRM_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parsedData: parsedData,
          posterUrl: base64Image,
        }),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success!", "Your event is now live on TownSQ!");
        // Reset screen completely
        setStatus("idle");
        setImageUri(null);
        setBase64Image(null);
        setParsedData(null);
      } else {
        Alert.alert("Error", "Failed to publish event.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Could not reach the server.");
    } finally {
      setIsPublishing(false);
    }
  };

  const renderFieldRow = (
    label: string,
    fieldKey: string,
    displayValue: string,
  ) => {
    const isMissing = status === "failure" && missingFields.includes(fieldKey);

    return (
      <View
        style={[styles.parsedField, isMissing && styles.parsedFieldMissing]}
      >
        <View
          style={[
            styles.fieldStatus,
            isMissing ? styles.statusMissing : styles.statusFound,
          ]}
        >
          <Text
            style={[
              styles.fieldStatusText,
              isMissing ? styles.statusTextMissing : styles.statusTextFound,
            ]}
          >
            {isMissing ? "✗" : "✓"}
          </Text>
        </View>
        <View style={styles.fieldInfo}>
          <Text style={styles.fieldName}>{label}</Text>
          <Text
            style={[styles.fieldValue, isMissing && styles.fieldValueEmpty]}
          >
            {isMissing ? "Not found on poster" : displayValue || "Unspecified"}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>POST AN EVENT</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.uploadZone,
            status === "failure" && styles.uploadZoneFailure,
          ]}
          onPress={pickImage}
          disabled={status === "loading" || isPublishing}
        >
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
          ) : (
            <>
              <Text style={styles.uploadIcon}>🖼</Text>
              <Text style={styles.uploadTextBold}>Drop your poster here</Text>
              <Text style={styles.uploadText}>Tap to choose from gallery</Text>
            </>
          )}
          {status === "failure" && (
            <View style={styles.overlayFailure}>
              <Text style={styles.overlayFailureIcon}>⚠️</Text>
            </View>
          )}
        </TouchableOpacity>

        {status === "idle" && (
          <>
            <Text style={styles.submitNote}>
              No account needed to post. Your poster goes live once verified.
            </Text>
            <TouchableOpacity
              style={[styles.btnPrimary, !imageUri && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={!imageUri}
            >
              <Text style={styles.btnPrimaryText}>Submit Poster →</Text>
            </TouchableOpacity>
          </>
        )}

        {status === "loading" && (
          <View style={styles.aiParsingCard}>
            <View style={styles.aiLabel}>
              <Animated.View style={[styles.aiDot, { opacity: pulseAnim }]} />
              <Text style={styles.aiLabelText}>AI Reading Poster</Text>
            </View>
            <ActivityIndicator color="#00e676" style={{ marginVertical: 20 }} />
          </View>
        )}

        {status === "success" && (
          <>
            <View style={styles.aiParsingCard}>
              <View style={styles.aiLabel}>
                <View style={styles.aiDot} />
                <Text style={styles.aiLabelText}>AI Read Poster</Text>
              </View>
              {renderFieldRow(
                "Event Date",
                "eventDate",
                formatDate(parsedData?.eventDate) as string,
              )}
              {renderFieldRow("Time", "eventTime", parsedData?.eventTime)}
              {renderFieldRow(
                "Venue / Location",
                "venue",
                [parsedData?.venue, parsedData?.address]
                  .filter(Boolean)
                  .join(", "),
              )}
              {renderFieldRow(
                "Vibe / Category",
                "vibe",
                Array.isArray(parsedData?.vibe) && parsedData.vibe.length > 0
                  ? parsedData.vibe.join(" · ")
                  : "General",
              )}
            </View>
            <TouchableOpacity
              style={styles.btnPrimary}
              onPress={handleConfirm}
              disabled={isPublishing}
            >
              {isPublishing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnPrimaryText}>Confirm & Publish</Text>
              )}
            </TouchableOpacity>
          </>
        )}

        {status === "failure" && (
          <>
            <View style={[styles.aiParsingCard, styles.aiParsingCardFailure]}>
              <View style={styles.aiLabel}>
                <View style={[styles.aiDot, styles.aiDotFailure]} />
                <Text style={styles.aiLabelText}>Missing Required Info</Text>
              </View>
              {renderFieldRow(
                "Event Date",
                "eventDate",
                formatDate(parsedData?.eventDate) as string,
              )}
              {renderFieldRow("Time", "eventTime", parsedData?.eventTime)}
              {renderFieldRow(
                "Venue / Location",
                "venue",
                [parsedData?.venue, parsedData?.address]
                  .filter(Boolean)
                  .join(", "),
              )}
              {renderFieldRow(
                "Vibe / Category",
                "vibe",
                Array.isArray(parsedData?.vibe) && parsedData.vibe.length > 0
                  ? parsedData.vibe.join(" · ")
                  : "General",
              )}
            </View>

            <View style={styles.failureNoticeBox}>
              <Text style={styles.failureNoticeText}>
                Your poster needs a{" "}
                <Text style={styles.textWhite}>
                  {missingFields.join(" and ")}
                </Text>{" "}
                to go live. Try uploading a clearer version.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.btnSecondary}
              onPress={() => setStatus("idle")}
            >
              <Text style={styles.btnSecondaryText}>↩ Try Another Poster</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#050505" },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40, gap: 16 },
  header: { paddingTop: 10, paddingBottom: 10 },
  headerTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 24,
    color: "#f0f0f0",
    letterSpacing: 2,
  },

  uploadZone: {
    borderWidth: 2,
    borderColor: "#2a2a2a",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 160,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  uploadZoneFailure: {
    borderColor: "rgba(255,60,0,0.3)",
    backgroundColor: "rgba(255,60,0,0.03)",
  },
  previewImage: { width: "100%", height: "100%", resizeMode: "cover" },
  overlayFailure: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayFailureIcon: { fontSize: 40 },
  uploadIcon: { fontSize: 32, marginBottom: 8 },
  uploadTextBold: {
    fontFamily: "DMSans_700Bold",
    color: "#f0f0f0",
    fontSize: 14,
  },
  uploadText: {
    fontFamily: "DMSans_400Regular",
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  submitNote: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#666",
    textAlign: "center",
    paddingHorizontal: 20,
  },

  btnPrimary: {
    backgroundColor: "#ff3c00",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.5 },
  btnPrimaryText: { fontFamily: "DMSans_700Bold", color: "#fff", fontSize: 14 },
  btnSecondary: {
    backgroundColor: "#141414",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  btnSecondaryText: {
    fontFamily: "DMSans_600SemiBold",
    color: "#f0f0f0",
    fontSize: 14,
  },

  aiParsingCard: {
    backgroundColor: "#141414",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    borderRadius: 16,
    padding: 12,
    gap: 10,
  },
  aiParsingCardFailure: { borderColor: "rgba(255,60,0,0.2)" },
  aiLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  aiDot: { width: 6, height: 6, backgroundColor: "#00e676", borderRadius: 3 },
  aiDotFailure: { backgroundColor: "#ff3c00" },
  aiLabelText: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 10,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  parsedField: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 10,
    backgroundColor: "#1e1e1e",
    borderRadius: 10,
  },
  parsedFieldMissing: { borderWidth: 1, borderColor: "rgba(255,60,0,0.2)" },
  fieldStatus: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
  },
  statusFound: { backgroundColor: "rgba(0,230,118,0.15)" },
  statusMissing: { backgroundColor: "rgba(255,60,0,0.15)" },
  fieldStatusText: { fontSize: 10, fontFamily: "DMSans_700Bold" },
  statusTextFound: { color: "#00e676" },
  statusTextMissing: { color: "#ff3c00" },

  fieldInfo: { flex: 1 },
  fieldName: {
    fontFamily: "SpaceMono_700Bold",
    fontSize: 9,
    color: "#666",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldValue: {
    fontFamily: "DMSans_500Medium",
    fontSize: 12,
    color: "#f0f0f0",
    marginTop: 2,
  },
  fieldValueEmpty: { color: "#ff3c00", fontSize: 11 },

  failureNoticeBox: {
    padding: 12,
    backgroundColor: "rgba(255,60,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(255,60,0,0.15)",
    borderRadius: 10,
  },
  failureNoticeText: {
    fontFamily: "DMSans_400Regular",
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
  },
  textWhite: { color: "#f0f0f0", fontFamily: "DMSans_700Bold" },
});

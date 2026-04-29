import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";

const API_URL = "http://192.168.1.9:3000/api/events/parse-poster";

export default function PostScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [base64Image, setBase64Image] = useState<string | null>(null);

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
    }
  };

  const handleSubmit = async () => {
    if (!base64Image) return;
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: base64Image,
        }),
      });

      const result = await response.json();
      if (result.success) {
        Alert.alert("Success!", `Event "${result.data.eventName}" saved.`);
        setImageUri(null);
        setBase64Image(null);
      } else {
        Alert.alert("AI Parsing Failed", result.error);
      }
    } catch (error) {
      Alert.alert("Error", "Check your Acer's Firewall or IP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>POST AN EVENT</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.uploadZone}
          onPress={pickImage}
          activeOpacity={0.8}
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
        </TouchableOpacity>

        <Text style={styles.submitNote}>
          No account needed to post. Your poster goes live once verified.
        </Text>

        <TouchableOpacity
          style={[
            styles.btnPrimary,
            (!imageUri || loading) && { opacity: 0.5 },
          ]}
          onPress={handleSubmit}
          disabled={!imageUri || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnPrimaryText}>Submit Poster →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#050505",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: "BebasNeue_400Regular",
    fontSize: 24,
    color: "#f0f0f0",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 20,
  },
  uploadZone: {
    borderWidth: 2,
    borderColor: "#2a2a2a",
    borderStyle: "dashed",
    borderRadius: 16,
    height: 200,
    backgroundColor: "#141414",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  uploadIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
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
    height: 56,
    justifyContent: "center",
  },
  btnPrimaryText: {
    fontFamily: "DMSans_700Bold",
    color: "#fff",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

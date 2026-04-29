import React from "react";
import { View, Text, ActivityIndicator, StatusBar } from "react-native";
import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useFonts } from "expo-font";
import { BebasNeue_400Regular } from "@expo-google-fonts/bebas-neue";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";

import FeedScreen from "./src/screens/FeedScreen";
import PostScreen from "./src/screens/PostScreen";

const Tab = createBottomTabNavigator();

const TS_THEME = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#050505",
    card: "#0a0a0a",
    text: "#f0f0f0",
    border: "#2a2a2a",
    primary: "#ff3c00",
  },
};

const MapScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontFamily: "SpaceMono_700Bold", color: "#ff3c00" }}>
      MAP VIEW
    </Text>
  </View>
);

const SavedScreen = () => (
  <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
    <Text style={{ fontFamily: "DMSans_400Regular", color: "#fff" }}>
      SAVED EVENTS
    </Text>
  </View>
);

// The actual Tab Navigator component
function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#ff3c00",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#0a0a0a",
          borderTopColor: "#2a2a2a",
          height: 70 + insets.bottom,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontFamily: "SpaceMono_400Regular",
          fontSize: 10,
          letterSpacing: 0.5,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarIcon: () => (
            <Text style={{ color: "#666", fontSize: 18 }}>◈</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: () => (
            <Text style={{ color: "#666", fontSize: 18 }}>◎</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostScreen}
        options={{
          tabBarIcon: () => (
            <Text style={{ color: "#666", fontSize: 18 }}>⊕</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{
          tabBarIcon: () => (
            <Text style={{ color: "#666", fontSize: 18 }}>♡</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#050505",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#ff3c00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={TS_THEME}>
        <StatusBar barStyle="light-content" backgroundColor="#050505" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

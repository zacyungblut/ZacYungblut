import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { AuthService } from "@/utils/authStorage";

export default function SettingsScreen() {
  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          AuthService.removeAuthToken();
          router.replace("/auth");
        },
      },
    ]);
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.settingsContainer}>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleLogout}
            activeOpacity={0.7}>
            <View style={styles.settingContent}>
              <Ionicons
                name="log-out-outline"
                size={24}
                color="#ff4444"
                style={styles.settingIcon}
              />
              <Text style={[styles.settingText, styles.logoutText]}>
                Logout
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  settingsContainer: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  logoutText: {
    color: "#ff4444",
  },
});

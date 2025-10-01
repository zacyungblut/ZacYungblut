import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface ProfileBarProps {
  username?: string;
  onUsernamePress?: () => void;
}

export default function ProfileBar({
  username = "timjroop",
  onUsernamePress,
}: ProfileBarProps) {
  const handleSettingsPress = () => {
    router.push("/settings");
  };

  const handleUsernamePress = () => {
    if (onUsernamePress) {
      onUsernamePress();
    }
    // Could open username selection modal or account switcher
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection} />

      <View style={styles.centerSection}>
        <TouchableOpacity
          style={styles.usernameButton}
          onPress={handleUsernamePress}
          activeOpacity={0.7}>
          <Text style={styles.username}>{username}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={colors.text.primary}
            style={styles.chevron}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleSettingsPress}
          activeOpacity={0.7}>
          <Ionicons name="cog" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
    height: 100,
    backgroundColor: colors.background.primary,
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  rightSection: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  usernameButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  username: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  chevron: {
    marginLeft: 4,
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

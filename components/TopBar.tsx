import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";

interface TopBarProps {
  title: string;
  onPremiumPress?: () => void;
  showBackButton?: boolean;
  onBackPress?: () => void;
}

export default function TopBar({
  title,
  onPremiumPress,
  showBackButton = false,
  onBackPress,
}: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        {showBackButton ? (
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackPress}
            activeOpacity={0.7}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
        ) : (
          <Image
            source={require("@/assets/images/official.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.premiumButton}
          onPress={onPremiumPress}
          activeOpacity={0.7}>
          <Text style={styles.premiumText}>🔮</Text>
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
  },
  leftSection: {
    flex: 1,
    alignItems: "flex-start",
  },
  centerSection: {
    flex: 2,
    alignItems: "center",
  },
  rightSection: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },
  logo: {
    width: 48,
    height: 48,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  premiumButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  premiumText: {
    fontSize: 20,
  },
});

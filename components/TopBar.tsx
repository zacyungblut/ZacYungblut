import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface TopBarProps {
  title: string;
  showBackButton?: boolean;
  onBackPress?: () => void;
  showAddButton?: boolean;
  onAddPress?: () => void;
  showPremiumButton?: boolean;
  showSettingsButton?: boolean;
}

export default function TopBar({
  title,
  showBackButton = false,
  onBackPress,
  showAddButton = false,
  onAddPress,
  showPremiumButton = true,
  showSettingsButton = false,
}: TopBarProps) {
  const handlePremiumPress = () => {
    router.push("/premium");
  };
  const handleSettingsPress = () => {
    router.push("/settings");
  };
  const handleHomePress = () => {
    router.push("/trust-center");
  };

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
          <TouchableOpacity onPress={handleHomePress}>
            <Image
              source={require("@/assets/images/official.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.centerSection}>
        <Text style={styles.title}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        {showSettingsButton && (
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={handleSettingsPress}
            activeOpacity={0.7}>
            <Ionicons name="cog" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
        {showAddButton && onAddPress ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}>
            <Ionicons name="add" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        ) : showPremiumButton ? (
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={handlePremiumPress}
            activeOpacity={0.7}>
            <Image
              source={require("@/assets/images/premium.png")}
              style={styles.premiumImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}
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
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
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
  addButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumButton: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumImage: {
    width: 36,
    height: 36,
  },
  settingsButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
});

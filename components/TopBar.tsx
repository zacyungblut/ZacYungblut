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
}

export default function TopBar({
  title,
  showBackButton = false,
  onBackPress,
  showAddButton = false,
  onAddPress,
}: TopBarProps) {
  const handlePremiumPress = () => {
    router.push("/premium");
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
        {showAddButton && onAddPress ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={onAddPress}
            activeOpacity={0.7}>
            <Ionicons name="add" size={28} color={colors.text.primary} />
          </TouchableOpacity>
        ) : (
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
        )}
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
  },
  logo: {
    width: 38,
    height: 38,
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
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumImage: {
    width: 40,
    height: 40,
  },
});

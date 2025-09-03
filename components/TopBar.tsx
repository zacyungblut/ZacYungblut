import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Text, View } from "@/components/Themed";

interface TopBarProps {
  title: string;
  onPremiumPress?: () => void;
}

export default function TopBar({ title, onPremiumPress }: TopBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Image
          source={require("@/assets/images/official.png")}
          style={styles.logo}
          resizeMode="contain"
        />
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
    alignItems: "flex-end",
  },
  logo: {
    width: 48,
    height: 48,
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
  },
  premiumText: {
    fontSize: 20,
  },
});

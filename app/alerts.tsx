import React from "react";
import { StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

export default function AlertsScreen() {
  const handlePremiumPress = () => {
    console.log("Premium pressed");
  };

  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Alerts"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content}>
        <View style={styles.alertsContainer}>
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptySubtitle}>
              You'll see important notifications here
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  alertsContainer: {
    flex: 1,
    paddingVertical: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },
});

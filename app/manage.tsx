import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

export default function ManageScreen() {
  const handlePremiumPress = () => {
    console.log("Premium pressed");
  };

  const handleBackPress = () => {
    router.back();
  };

  const handlePrivacySettings = () => {
    console.log("Privacy settings pressed");
  };

  const handleNotificationSettings = () => {
    console.log("Notification settings pressed");
  };

  const handleAccountSettings = () => {
    console.log("Account settings pressed");
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Manage"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content}>
        <View style={styles.manageContainer}>
          <TouchableOpacity
            style={styles.manageItem}
            onPress={handlePrivacySettings}
            activeOpacity={0.7}>
            <View style={styles.manageContent}>
              <Ionicons
                name="lock-closed-outline"
                size={24}
                color={colors.text.primary}
                style={styles.manageIcon}
              />
              <Text style={styles.manageText}>Privacy Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageItem}
            onPress={handleNotificationSettings}
            activeOpacity={0.7}>
            <View style={styles.manageContent}>
              <Ionicons
                name="notifications-outline"
                size={24}
                color={colors.text.primary}
                style={styles.manageIcon}
              />
              <Text style={styles.manageText}>Notification Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.manageItem}
            onPress={handleAccountSettings}
            activeOpacity={0.7}>
            <View style={styles.manageContent}>
              <Ionicons
                name="person-outline"
                size={24}
                color={colors.text.primary}
                style={styles.manageIcon}
              />
              <Text style={styles.manageText}>Account Settings</Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text.tertiary}
            />
          </TouchableOpacity>
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
    paddingTop: 20,
  },
  manageContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  manageItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  manageContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  manageIcon: {
    marginRight: 12,
  },
  manageText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
});

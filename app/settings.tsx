import React from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { AuthService } from "@/utils/authStorage";

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
}

export default function SettingsScreen() {
  const handleBackPress = () => {
    router.back();
  };

  const handlePremiumPress = () => {
    router.push("/premium");
  };

  const handleSubscriptionManagement = () => {
    // TODO: Navigate to subscription management
    console.log("Subscription management pressed");
  };

  const handleLanguageRegion = () => {
    // TODO: Navigate to language and region settings
    console.log("Language and region pressed");
  };

  const handleThemeDisplay = () => {
    // TODO: Navigate to theme and display settings
    console.log("Theme and display pressed");
  };

  const handleGetSupport = () => {
    Linking.openURL("https://makeitofficial.us/support").catch((err) => {
      console.error("Failed to open support URL:", err);
      Alert.alert(
        "Error",
        "Unable to open support page. Please try again later."
      );
    });
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            // TODO: Implement account deletion
            console.log("Account deletion confirmed");
          },
        },
      ]
    );
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

  const handleChangePhoneNumber = () => {
    // TODO: Navigate to change phone number screen
    console.log("Change phone number pressed");
  };

  const accountSettings: SettingItem[] = [
    {
      id: "subscription",
      title: "Subscription Management",
      icon: "card-outline",
      onPress: handleSubscriptionManagement,
      showChevron: true,
    },
    {
      id: "premium",
      title: "Upgrade to Premium",
      icon: "star-outline",
      color: colors.primary,
      onPress: handlePremiumPress,
      showChevron: true,
    },
    {
      id: "phone",
      title: "Change Phone Number",
      icon: "call",
      onPress: handleChangePhoneNumber,
      showChevron: true,
    },
  ];

  const appSettings: SettingItem[] = [
    {
      id: "language",
      title: "Language & Region",
      icon: "globe-outline",
      onPress: handleLanguageRegion,
      showChevron: true,
    },
    {
      id: "theme",
      title: "Theme & Display",
      icon: "color-palette-outline",
      onPress: handleThemeDisplay,
      showChevron: true,
    },
  ];

  const supportSettings: SettingItem[] = [
    {
      id: "support",
      title: "Get Support",
      icon: "help-circle-outline",
      onPress: handleGetSupport,
      showChevron: true,
    },
  ];

  const dangerousSettings: SettingItem[] = [
    {
      id: "logout",
      title: "Logout",
      icon: "log-out-outline",
      color: colors.status.warning || "#FF9500",
      onPress: handleLogout,
      showChevron: false,
    },
    {
      id: "delete",
      title: "Delete Account",
      icon: "trash-outline",
      color: colors.status.error || "#FF3B30",
      onPress: handleDeleteAccount,
      showChevron: false,
      destructive: true,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.destructive && styles.destructiveItem]}
      onPress={item.onPress}
      activeOpacity={0.7}>
      <View style={styles.settingContent}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.color || colors.text.secondary}
          style={styles.settingIcon}
        />
        <Text
          style={[
            styles.settingText,
            item.color && { color: item.color },
            item.destructive && styles.destructiveText,
          ]}>
          {item.title}
        </Text>
      </View>
      {item.showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={colors.text.tertiary}
        />
      )}
    </TouchableOpacity>
  );

  const renderSettingSection = (
    title: string,
    items: SettingItem[],
    isLast = false
  ) => (
    <View style={[styles.settingSection, !isLast && styles.sectionMargin]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.settingsContainer}>
        {items.map((item, index) => (
          <View key={item.id}>
            {renderSettingItem(item)}
            {index < items.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Settings"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSettingSection("Account", accountSettings)}
        {renderSettingSection("App Settings", appSettings)}
        {renderSettingSection("Support", supportSettings)}
        {renderSettingSection("Account Actions", dangerousSettings, true)}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Official v1.0.0</Text>
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },

  // Section styles
  settingSection: {
    marginBottom: 32,
  },
  sectionMargin: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 12,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Settings container and items
  settingsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.tertiary,
  },
  destructiveItem: {
    backgroundColor: colors.background.secondary,
  },
  settingContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
    width: 24,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  destructiveText: {
    color: colors.status.error || "#FF3B30",
  },
  separator: {
    height: 1,
    backgroundColor: colors.border.light,
    marginLeft: 52, // Align with text after icon
  },

  // Version info
  versionContainer: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 32,
  },
  versionText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
});

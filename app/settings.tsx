import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { usePostHog } from "posthog-react-native";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { AuthService } from "@/utils/authStorage";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { useNotification } from "@/contexts/NotificationContext";

interface SettingItem {
  id: string;
  title: string;
  icon: string;
  color?: string;
  onPress: () => void;
  showChevron?: boolean;
  destructive?: boolean;
  value?: string;
  loading?: boolean;
}

export default function SettingsScreen() {
  const { deleteUserAccountPermanently, loading, user } = useUserRedux();
  const { addNotification } = useNotification();
  const posthog = usePostHog();

  const handleBackPress = () => {
    router.back();
  };

  const handlePremiumPress = () => {
    router.push("/premium");
  };

  const handleEditProfile = () => {
    router.push("/pisser-tag");
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

  const handleTermsOfService = () => {
    Linking.openURL("https://makeitofficial.us/terms").catch((err) => {
      console.error("Failed to open terms URL:", err);
      Alert.alert(
        "Error",
        "Unable to open terms of service page. Please try again later."
      );
    });
  };

  const handleDeleteAccount = () => {
    // Track account deletion attempt initiation
    posthog.capture("account_deletion_initiated", {
      user_id: user?.id || "",
      platform: Platform.OS,
      source: "settings_screen",
    });

    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data.",
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => {
            // Track account deletion cancelled
            posthog.capture("account_deletion_cancelled", {
              user_id: user?.id || "",
              platform: Platform.OS,
              source: "settings_screen",
            });
          },
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              // Track account deletion confirmed
              posthog.capture("account_deletion_confirmed", {
                user_id: user?.id || "",
                platform: Platform.OS,
                source: "settings_screen",
              });

              await deleteUserAccountPermanently();

              // Track successful account deletion
              posthog.capture("account_deleted", {
                user_id: user?.id || "",
                platform: Platform.OS,
                source: "settings_screen",
              });

              // On successful deletion, the user will be logged out automatically
              // and redirected to auth screen via the Redux state change
              router.replace("/auth");
            } catch (error: any) {
              console.error("Account deletion failed:", error);

              // Track account deletion failure
              posthog.capture("account_deletion_failed", {
                user_id: user?.id || "",
                platform: Platform.OS,
                source: "settings_screen",
                error_message:
                  error.payload ||
                  "Failed to delete account. Please try again later.",
              });

              Alert.alert(
                "Deletion Failed",
                error.payload ||
                  "Failed to delete account. Please try again later."
              );
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    // Track logout attempt initiation
    posthog.capture("logout_initiated", {
      user_id: user?.id || "",
      platform: Platform.OS,
      source: "settings_screen",
    });

    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
        onPress: () => {
          // Track logout cancelled
          posthog.capture("logout_cancelled", {
            user_id: user?.id || "",
            platform: Platform.OS,
            source: "settings_screen",
          });
        },
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          // Track successful logout
          posthog.capture("logout_completed", {
            user_id: user?.id || "",
            platform: Platform.OS,
            source: "settings_screen",
          });

          AuthService.removeAuthToken();
          router.replace("/auth");
        },
      },
    ]);
  };

  const accountSettings: SettingItem[] = [
    {
      id: "premium",
      title: "Upgrade to Premium",
      icon: "star-outline",
      color: colors.primary,
      onPress: handlePremiumPress,
      showChevron: true,
    },
    {
      id: "profile",
      title: "Change Pissername",
      icon: "at-outline",
      onPress: handleEditProfile,
      showChevron: true,
      value: user?.pisserTag ? `@${user.pisserTag}` : "Not set",
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
    {
      id: "terms",
      title: "View Terms of Service",
      icon: "document-text-outline",
      onPress: handleTermsOfService,
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
      activeOpacity={0.7}
      disabled={item.loading}>
      <View style={styles.settingContent}>
        <Ionicons
          name={item.icon as any}
          size={24}
          color={item.color || colors.text.secondary}
          style={styles.settingIcon}
        />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.settingText,
              item.color && { color: item.color },
              item.destructive && styles.destructiveText,
              item.loading && styles.loadingText,
            ]}
            allowFontScaling={false}>
            {item.title}
          </Text>
          {item.value && (
            <Text style={styles.valueText} allowFontScaling={false}>
              {item.value}
            </Text>
          )}
          {item.loading && (
            <Text style={styles.statusText} allowFontScaling={false}>
              Loading...
            </Text>
          )}
        </View>
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
      <Text style={styles.sectionTitle} allowFontScaling={false}>
        {title}
      </Text>
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
        {renderSettingSection("Support", supportSettings)}
        {renderSettingSection("Account Actions", dangerousSettings, true)}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText} allowFontScaling={false}>
            PissTracker v{require("../app.json").expo.version}
          </Text>
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
    paddingVertical: 20,
    backgroundColor: colors.background.tertiary,
    minHeight: 60,
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
  textContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
  },
  destructiveText: {
    color: colors.status.error || "#FF3B30",
  },
  loadingText: {
    color: colors.text.secondary,
  },
  valueText: {
    fontSize: 14,
    marginTop: 4,
    color: colors.text.secondary,
  },
  statusText: {
    fontSize: 14,
    color: colors.primary,
    marginTop: 2,
    fontStyle: "italic",
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

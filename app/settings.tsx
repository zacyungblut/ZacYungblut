import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Linking,
  Share,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { AuthService } from "@/utils/authStorage";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { useNotification } from "@/contexts/NotificationContext";
import { referralMessage } from "@/utils/helpers";

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
  const {
    deleteUserAccountPermanently,
    loading,
    user,
    invites,
    sendUserInvite,
    fetchUser,
    cancelUserInvite,
    recordShareAttempt,
  } = useUserRedux();
  const { addNotification } = useNotification();
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  const handleBackPress = () => {
    router.back();
  };

  const handlePremiumPress = () => {
    router.push("/premium");
  };

  const handleManageRelationship = () => {
    router.push("/manage");
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

  const handleViewSearchHistory = () => {
    router.push("/past-searches");
  };

  const handleViewReferrals = () => {
    // TODO: Navigate to referrals screen
    console.log("View referrals pressed");
  };

  const handleShareReferralLink = async () => {
    console.log("Share referral link pressed");
    setIsInviteLoading(true);

    try {
      // Create the invite link
      const inviteLink = `https://makeitofficial.us/refer/${user?.id}`;

      // Show native share dialog
      try {
        const result = await Share.share({
          message: referralMessage,
          url: inviteLink,
          title: "My Relationship",
        });

        if (result.action === Share.sharedAction) {
          // Record successful share attempt
          try {
            const shareMethod = result.activityType
              ? `native_share:${result.activityType}`
              : "native_share:unknown";

            console.log(
              "Share successful via:",
              result.activityType || "unknown"
            );
          } catch (shareTrackingError) {
            console.error("Failed to track share attempt:", shareTrackingError);
          }

          addNotification({
            title: "Referral Link Shared",
            description: "Your referral link has been shared successfully",
            type: "success",
            emoji: "🎉",
          });

          // Refresh user data after successful share
          await fetchUser();
        } else {
          // Record aborted share attempt
          try {
            console.log("Share cancelled by user");
          } catch (shareTrackingError) {
            console.error("Failed to track aborted share:", shareTrackingError);
          }
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);

        Alert.alert("Share Error", "Failed to share the referral link");
      }
    } catch (error: any) {
      console.error("Error creating invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create invitation";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsInviteLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to permanently delete your account? This action cannot be undone and will remove all your data, relationships, and invites.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserAccountPermanently();
              // On successful deletion, the user will be logged out automatically
              // and redirected to auth screen via the Redux state change
              router.replace("/auth");
            } catch (error: any) {
              console.error("Account deletion failed:", error);
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

  // Calculate search-related data
  const searchData = React.useMemo(() => {
    if (!user) return null;

    // Get search transactions from user data (if available)
    const searchTransactions = (user as any).searchTransactions || [];
    const totalSearches = searchTransactions.length;

    // For now, we'll use a simple limit system
    // In a real app, this would be based on user's plan/subscription
    const searchLimit = 10; // Free users get 10 searches
    const searchesUsed = totalSearches;
    const searchesLeft = Math.max(0, searchLimit - searchesUsed);

    // Calculate referrals (users who joined through invites)
    const acceptedInvites = invites.sent.filter(
      (invite) => invite.status === "ACCEPTED"
    );
    const referralCount = 0;

    return {
      searchesLeft,
      searchesUsed,
      searchLimit,
      referralCount,
      totalSearches,
    };
  }, [user, invites.sent]);

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
      id: "relationship",
      title: "Manage Relationship",
      icon: "build-outline",
      onPress: handleManageRelationship,
      showChevron: true,
    },
  ];

  const searchSettings: SettingItem[] = [
    {
      id: "searches-remaining",
      title: "Searches Remaining",
      icon: "search-outline",
      onPress: handleViewSearchHistory,
      showChevron: true,
      value: searchData
        ? `${searchData.searchesLeft} of ${searchData.searchLimit}`
        : "0 of 10",
    },
    {
      id: "search-history",
      title: "Search History",
      icon: "time-outline",
      onPress: handleViewSearchHistory,
      showChevron: true,
      value: searchData
        ? `${searchData.totalSearches} searches made`
        : "0 searches made",
    },
  ];

  const referralSettings: SettingItem[] = [
    {
      id: "my-referrals",
      title: "My Referrals",
      icon: "people-outline",
      onPress: handleViewReferrals,
      showChevron: true,
    },
    {
      id: "referral-link",
      title: "Copy My Referral Link",
      icon: "link-outline",
      onPress: handleShareReferralLink,
      showChevron: false,
      loading: isInviteLoading,
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
            ]}>
            {item.title}
          </Text>
          {item.value && <Text style={styles.valueText}>{item.value}</Text>}
          {item.loading && <Text style={styles.statusText}>Loading...</Text>}
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
        {searchData && renderSettingSection("Searches", searchSettings)}
        {searchData && renderSettingSection("Referrals", referralSettings)}
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
    paddingVertical: 20, // Increased from 16 to match manage.tsx
    backgroundColor: colors.background.tertiary,
    minHeight: 60, // Added minimum height for better spacing
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
    color: colors.text.secondary,
    marginTop: 2,
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

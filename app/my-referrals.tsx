import React, { useMemo } from "react";
import { StyleSheet, ScrollView, View as RNView, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

// Phone number formatting helper
const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle US phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Handle US phone numbers with country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    const withoutCountryCode = cleaned.slice(1);
    return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(
      3,
      6
    )}-${withoutCountryCode.slice(6)}`;
  }

  // For other formats, just return as is with some basic formatting
  return phone;
};

// Time formatting helper
const formatJoinDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function MyReferralsScreen() {
  const { referrals } = useUserRedux();

  const handleBackPress = () => {
    router.back();
  };

  // Get shared referrals (people who used this user's referral code)
  const sharedReferrals = useMemo(() => {
    return referrals.shared || [];
  }, [referrals.shared]);

  // Sort by most recent first
  const sortedReferrals = useMemo(() => {
    return [...sharedReferrals].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [sharedReferrals]);

  const renderReferralItem = (referral: any, index: number) => {
    return (
      <RNView
        key={referral.id}
        style={[
          styles.referralItem,
          index === sortedReferrals.length - 1 && styles.lastReferralItem,
        ]}>
        <View style={styles.referralItemLeft}>
          <View style={styles.avatarContainer}>
            <Image
              source={require("@/assets/images/user.png")}
              style={styles.userImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.referralDetails}>
            <Text style={styles.phoneNumber}>
              {formatPhoneNumber(referral.claimer?.phone || "Unknown")}
            </Text>
            <Text style={styles.joinDate}>
              Joined {formatJoinDate(referral.claimedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.referralItemRight}>
          <View style={styles.bonusBadge}>
            <Text style={styles.bonusText}>+2</Text>
          </View>
        </View>
      </RNView>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="My Referrals"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Content area */}
      <View style={styles.contentContainer}>
        {sortedReferrals.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="people-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No Referrals Yet</Text>
            <Text style={styles.emptySubtitle}>
              Share your referral link to earn bonus searches when friends join
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.referralList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.referralListContent}>
            <View style={styles.referralHeader}>
              <Text style={styles.referralCount}>
                {sortedReferrals.length} successful referral
                {sortedReferrals.length !== 1 ? "s" : ""}
              </Text>
              <Text style={styles.bonusInfo}>
                +{sortedReferrals.length * 2} bonus searches earned
              </Text>
            </View>

            <View style={styles.referralItemsContainer}>
              {sortedReferrals.map((referral, index) =>
                renderReferralItem(referral, index)
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Referral list styles
  referralList: {
    flex: 1,
  },
  referralListContent: {
    paddingBottom: 20,
  },
  referralHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginBottom: 8,
  },
  referralCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
  bonusInfo: {
    fontSize: 12,
    color: colors.primary,
    marginTop: 4,
    fontWeight: "500",
  },

  // Referral item styles
  referralItemsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  referralItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lastReferralItem: {
    borderBottomWidth: 0,
  },
  referralItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  userImage: {
    width: 40,
    height: 40,
  },
  referralDetails: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  joinDate: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  referralItemRight: {
    alignItems: "center",
    justifyContent: "center",
  },
  bonusBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  bonusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
});

import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

type PricingTier = "monthly" | "annual";

export default function PremiumScreen() {
  const [selectedTier, setSelectedTier] = useState<PricingTier>("annual");

  const handleBackPress = () => {
    router.back();
  };

  const handleSubscribe = () => {
    console.log("Subscribe pressed for:", selectedTier);
    // Handle subscription logic
  };

  const userPhotos = [
    require("@/assets/images/girl1.jpg"),
    require("@/assets/images/girl2.jpg"),
    require("@/assets/images/girl3.jpg"),
    require("@/assets/images/girl4.jpg"),
    require("@/assets/images/girl5.jpg"),
  ];

  const pricingTiers = [
    {
      id: "annual" as PricingTier,
      title: "Annual",
      price: "$69.99",
      subtitle: "($5.84/month) after 14 day trial",
      savings: "Save 55%",
      isSelected: selectedTier === "annual",
    },
    {
      id: "monthly" as PricingTier,
      title: "Monthly",
      price: "$12.99/month",
      subtitle: "after 7 day trial",
      isSelected: selectedTier === "monthly",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Premium Logo */}
      <View style={styles.header}>
        <View style={styles.premiumIconContainer}>
          <Image
            source={require("@/assets/images/premium.png")}
            style={styles.premiumLogo}
            resizeMode="contain"
          />
        </View>
        <TouchableOpacity onPress={handleBackPress} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.text.tertiary} />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Get Official Premium</Text>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <View style={styles.userAvatars}>
            {userPhotos.map((photo, i) => (
              <Image
                key={i}
                source={photo}
                style={[styles.avatar, { left: i * 26 }]}
              />
            ))}
            <View
              style={[styles.avatar, styles.moreUsersAvatar, { left: 5 * 26 }]}>
              <Text style={styles.moreUsersText}>+999</Text>
            </View>
          </View>
          <Text style={styles.socialProofText}>Join 10,000+ premium users</Text>
        </View>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.offBlack}
              style={styles.checkmark}
            />
            <Text style={styles.featureText}>
              8 searches per month (vs 2 on free plan)
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.offBlack}
              style={styles.checkmark}
            />
            <Text style={styles.featureText}>
              Searches roll over to next month
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={colors.offBlack}
              style={styles.checkmark}
            />
            <Text style={styles.featureText}>Ad-free experience</Text>
          </View>
        </View>

        {/* Pricing Options */}
        <View style={styles.pricingContainer}>
          {pricingTiers.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.pricingCard,
                tier.isSelected && styles.pricingCardSelected,
              ]}
              onPress={() => setSelectedTier(tier.id)}
              activeOpacity={0.8}>
              <View style={styles.pricingHeader}>
                <Text
                  style={[
                    styles.pricingTitle,
                    tier.isSelected && styles.pricingTitleSelected,
                  ]}>
                  {tier.title}
                </Text>
                {tier.savings && (
                  <View style={styles.savingsBadge}>
                    <Text style={styles.savingsText}>{tier.savings}</Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.pricingPrice,
                  tier.isSelected && styles.pricingPriceSelected,
                ]}>
                {tier.price}
              </Text>
              <Text
                style={[
                  styles.pricingSubtitle,
                  tier.isSelected && styles.pricingSubtitleSelected,
                ]}>
                {tier.subtitle}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trust Indicators */}
        <View style={styles.trustIndicators}>
          <View style={styles.trustItem}>
            <Ionicons
              name="shield-checkmark"
              size={14}
              color={colors.text.secondary}
            />
            <Text style={styles.trustText}>100% confidential</Text>
          </View>
          <Text style={styles.trustSeparator}>•</Text>
          <View style={styles.trustItem}>
            <Ionicons name="time" size={14} color={colors.text.secondary} />
            <Text style={styles.trustText}>Cancel anytime</Text>
          </View>
        </View>

        {/* Footer Links */}
        <View style={styles.footerLinks}>
          <TouchableOpacity>
            <Text style={styles.linkText}>Restore Purchase</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}> • </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscribe Button */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.9}>
          <Text style={styles.subscribeButtonText}>Subscribe</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  premiumIconContainer: {
    flex: 1,
    alignItems: "center",
  },
  premiumLogo: {
    width: 70,
    height: 70,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    left: 20,
    top: 10,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingBottom: 100, // Space for button
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 40,
  },
  socialProof: {
    alignItems: "center",
    marginBottom: 30,
  },
  userAvatars: {
    flexDirection: "row",
    height: 40,
    width: 160,
    marginBottom: 8,
  },
  avatar: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.white,
  },
  moreUsersAvatar: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderColor: colors.border.light,
  },
  moreUsersText: {
    fontSize: 9,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  socialProofText: {
    fontSize: 14,
    color: colors.text.tertiary,
    fontWeight: "500",
  },
  featuresContainer: {
    paddingHorizontal: 40,
    marginBottom: 25,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkmark: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 15,
    color: colors.text.secondary,
    flex: 1,
  },
  pricingContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  pricingCard: {
    backgroundColor: colors.surface.light,
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border.light,
    position: "relative",
  },
  pricingCardSelected: {
    backgroundColor: colors.surface.overlaySuperLight,
    borderColor: colors.offBlack,
  },
  savingsBadge: {
    backgroundColor: "#00E676",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  savingsText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.white,
  },
  pricingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  pricingTitleSelected: {
    color: colors.text.primary,
  },
  pricingPrice: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
  },
  pricingPriceSelected: {
    color: colors.text.primary,
  },
  pricingSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  pricingSubtitleSelected: {
    color: colors.text.tertiary,
  },
  trustIndicators: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  trustItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  trustText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginLeft: 4,
    fontWeight: "500",
  },
  trustSeparator: {
    fontSize: 12,
    color: colors.text.quaternary,
    marginHorizontal: 12,
  },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    marginBottom: 10,
  },
  linkText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  linkSeparator: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: colors.border.medium,
  },
  subscribeButton: {
    backgroundColor: colors.offBlack,
    borderRadius: 25,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
});

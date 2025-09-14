import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Alert,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  PurchasesError,
} from "react-native-purchases";
import { usePostHog } from "posthog-react-native";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

type PricingTier = "monthly" | "weekly";

interface PricingTierData {
  id: PricingTier;
  title: string;
  price: string;
  savings?: string;
  isSelected: boolean;
  purchasePackage?: PurchasesPackage;
}

export default function PremiumScreen() {
  const [selectedTier, setSelectedTier] = useState<PricingTier>("weekly");
  const [offerings, setOfferings] = useState<PurchasesOffering | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  const { user } = useUserRedux();
  const posthog = usePostHog();

  const handleBackPress = () => {
    // Track premium screen exit
    posthog.capture("premium_screen_exited", {
      user_id: user?.id || "",
      platform: Platform.OS,
      selected_tier: selectedTier,
      time_on_screen: Date.now() - screenStartTime,
      exit_method: "back_button",
    });

    router.back();
  };

  // Track screen start time for time on screen calculation
  const [screenStartTime] = useState(Date.now());

  useEffect(() => {
    // Track premium screen viewed
    posthog.capture("premium_screen_viewed", {
      user_id: user?.id || "",
      platform: Platform.OS,
      source: "app_navigation",
    });

    initializePurchases();

    // Track screen exit when component unmounts
    return () => {
      posthog.capture("premium_screen_exited", {
        user_id: user?.id || "",
        platform: Platform.OS,
        selected_tier: selectedTier,
        time_on_screen: Date.now() - screenStartTime,
        exit_method: "navigation",
      });
    };
  }, []);

  const initializePurchases = async () => {
    try {
      // Get current customer info
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      // Get available offerings
      const offerings = await Purchases.getOfferings();
      if (offerings.current) {
        setOfferings(offerings.current);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error initializing purchases:", error);

      // Track initialization error
      posthog.capture("premium_purchases_init_failed", {
        user_id: user?.id || "",
        platform: Platform.OS,
        error_message: error instanceof Error ? error.message : String(error),
      });

      setIsLoading(false);
      Alert.alert(
        "Error",
        "Unable to load purchase options. Please try again later.",
        [{ text: "OK", onPress: () => {} }]
      );
    }
  };

  const handleSubscribe = async () => {
    if (!offerings || isPurchasing) return;

    // Track subscription attempt
    posthog.capture("premium_subscription_attempt", {
      user_id: user?.id || "",
      platform: Platform.OS,
      selected_tier: selectedTier,
      time_on_screen: Date.now() - screenStartTime,
    });

    setIsPurchasing(true);

    try {
      const packages = offerings.availablePackages;
      let selectedPackage: PurchasesPackage | undefined;

      if (selectedTier === "weekly") {
        selectedPackage = packages.find(
          (pkg) =>
            pkg.identifier.includes("weekly") || pkg.packageType === "WEEKLY"
        );
      } else {
        selectedPackage = packages.find(
          (pkg) =>
            pkg.identifier.includes("monthly") || pkg.packageType === "MONTHLY"
        );
      }

      if (!selectedPackage) {
        // Fallback to first available package
        selectedPackage = packages[0];
      }

      if (!selectedPackage) {
        throw new Error("No purchase packages available");
      }

      // Track purchase initiation
      posthog.capture("premium_purchase_initiated", {
        user_id: user?.id || "",
        platform: Platform.OS,
        package_identifier: selectedPackage.identifier,
        package_type: selectedPackage.packageType,
        price: selectedPackage.product.price,
        currency: selectedPackage.product.currencyCode,
        selected_tier: selectedTier,
      });

      const { customerInfo } = await Purchases.purchasePackage(selectedPackage);

      setCustomerInfo(customerInfo);

      // Check if user is now premium
      if (customerInfo.entitlements.active["premium"]) {
        // Track successful purchase
        posthog.capture("premium_subscription_completed", {
          user_id: user?.id || "",
          platform: Platform.OS,
          package_identifier: selectedPackage.identifier,
          package_type: selectedPackage.packageType,
          price: selectedPackage.product.price,
          currency: selectedPackage.product.currencyCode,
          selected_tier: selectedTier,
          time_to_purchase: Date.now() - screenStartTime,
        });

        Alert.alert(
          "Success!",
          "Welcome to Official Premium! Your subscription is now active.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    } catch (error) {
      const purchaseError = error as PurchasesError;

      if (purchaseError.userCancelled) {
        // Track user cancelled purchase
        posthog.capture("premium_purchase_cancelled", {
          user_id: user?.id || "",
          platform: Platform.OS,
          selected_tier: selectedTier,
          time_on_screen: Date.now() - screenStartTime,
        });
      } else {
        // Track purchase error
        posthog.capture("premium_purchase_failed", {
          user_id: user?.id || "",
          platform: Platform.OS,
          selected_tier: selectedTier,
          error_message: purchaseError.message || "Unknown purchase error",
          error_code: purchaseError.code,
        });

        Alert.alert(
          "Purchase Failed",
          purchaseError.message ||
            "Unable to complete purchase. Please try again.",
          [{ text: "OK" }]
        );
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    // Track restore attempt
    posthog.capture("premium_restore_attempt", {
      user_id: user?.id || "",
      platform: Platform.OS,
    });

    try {
      setIsLoading(true);
      const info = await Purchases.restorePurchases();
      setCustomerInfo(info);

      if (info.entitlements.active["premium"]) {
        // Track successful restore
        posthog.capture("premium_restore_successful", {
          user_id: user?.id || "",
          platform: Platform.OS,
        });

        Alert.alert(
          "Purchases Restored",
          "Your premium subscription has been restored!",
          [{ text: "OK", onPress: () => router.back() }]
        );
      } else {
        // Track no purchases found
        posthog.capture("premium_restore_no_purchases", {
          user_id: user?.id || "",
          platform: Platform.OS,
        });

        Alert.alert(
          "No Purchases Found",
          "No active premium subscriptions were found to restore.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      // Track restore error
      posthog.capture("premium_restore_failed", {
        user_id: user?.id || "",
        platform: Platform.OS,
        error_message: error instanceof Error ? error.message : String(error),
      });

      Alert.alert(
        "Restore Failed",
        "Unable to restore purchases. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTermsPress = () => {
    // Track terms view
    posthog.capture("premium_terms_viewed", {
      user_id: user?.id || "",
      platform: Platform.OS,
      source: "premium_screen",
    });

    Linking.openURL("https://makeitofficial.us/terms").catch((err) => {
      console.error("Failed to open Terms of Use:", err);

      // Track terms link error
      posthog.capture("premium_terms_link_failed", {
        user_id: user?.id || "",
        platform: Platform.OS,
        error_message: err instanceof Error ? err.message : String(err),
      });

      Alert.alert(
        "Error",
        "Unable to open Terms of Use. Please try again later.",
        [{ text: "OK" }]
      );
    });
  };

  const handlePrivacyPress = () => {
    // Track privacy policy view
    posthog.capture("premium_privacy_viewed", {
      user_id: user?.id || "",
      platform: Platform.OS,
      source: "premium_screen",
    });

    Linking.openURL("https://makeitofficial.us/privacy").catch((err) => {
      console.error("Failed to open Privacy Policy:", err);

      // Track privacy link error
      posthog.capture("premium_privacy_link_failed", {
        user_id: user?.id || "",
        platform: Platform.OS,
        error_message: err instanceof Error ? err.message : String(err),
      });

      Alert.alert(
        "Error",
        "Unable to open Privacy Policy. Please try again later.",
        [{ text: "OK" }]
      );
    });
  };

  const userPhotos = [
    require("@/assets/images/girl1.jpg"),
    require("@/assets/images/girl2.jpg"),
    require("@/assets/images/girl3.jpg"),
    require("@/assets/images/girl4.jpg"),
    require("@/assets/images/girl5.jpg"),
  ];

  // Build pricing tiers from actual purchase packages
  const buildPricingTiers = (): PricingTierData[] => {
    if (!offerings) {
      // Fallback static data
      return [
        {
          id: "weekly" as PricingTier,
          title: "Weekly",
          price: "$4.99/week",
          savings: "Most Popular",
          isSelected: selectedTier === "weekly",
        },
        {
          id: "monthly" as PricingTier,
          title: "Monthly",
          price: "$12.99/month",
          isSelected: selectedTier === "monthly",
        },
      ];
    }

    const packages = offerings.availablePackages;
    const tiers: PricingTierData[] = [];

    // Find weekly package
    const weeklyPackage = packages.find(
      (pkg) => pkg.identifier.includes("weekly") || pkg.packageType === "WEEKLY"
    );

    if (weeklyPackage) {
      tiers.push({
        id: "weekly",
        title: "Weekly",
        price: `${weeklyPackage.product.priceString}/week`,
        savings: "Most Popular",
        isSelected: selectedTier === "weekly",
        purchasePackage: weeklyPackage,
      });
    }

    // Find monthly package
    const monthlyPackage = packages.find(
      (pkg) =>
        pkg.identifier.includes("monthly") || pkg.packageType === "MONTHLY"
    );

    if (monthlyPackage) {
      tiers.push({
        id: "monthly",
        title: "Monthly",
        price: `${monthlyPackage.product.priceString}/month`,
        isSelected: selectedTier === "monthly",
        purchasePackage: monthlyPackage,
      });
    }

    return tiers;
  };

  // Enhanced tier selection with tracking
  const handleTierSelection = (tierId: PricingTier) => {
    // Track tier selection
    posthog.capture("premium_tier_selected", {
      user_id: user?.id || "",
      platform: Platform.OS,
      selected_tier: tierId,
      previous_tier: selectedTier,
      time_on_screen: Date.now() - screenStartTime,
    });

    setSelectedTier(tierId);
  };

  const pricingTiers = buildPricingTiers();

  // Check if user already has premium
  const isPremium = customerInfo?.entitlements.active["premium"] != null;

  if (isPremium) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.premiumActiveContainer}>
            <Ionicons name="checkmark-circle" size={64} color="#00E676" />
            <Text style={styles.premiumActiveTitle}>You're Premium!</Text>
            <Text style={styles.premiumActiveSubtitle}>
              Your subscription is active and all premium features are unlocked.
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
              Get notifications when your partner changes your relationship
              status
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

        {/* Loading State */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.offBlack} />
            <Text style={styles.loadingText}>Loading purchase options...</Text>
          </View>
        )}

        {/* Pricing Options */}
        {!isLoading && pricingTiers.length > 0 && (
          <View style={styles.pricingContainer}>
            {pricingTiers.map((tier) => (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.pricingCard,
                  tier.isSelected && styles.pricingCardSelected,
                ]}
                onPress={() => handleTierSelection(tier.id)}
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
              </TouchableOpacity>
            ))}
          </View>
        )}

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
          <TouchableOpacity onPress={handleTermsPress}>
            <Text style={styles.linkText}>Terms of Use</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}> • </Text>
          <TouchableOpacity onPress={handlePrivacyPress}>
            <Text style={styles.linkText}>Privacy Policy</Text>
          </TouchableOpacity>
          <Text style={styles.linkSeparator}> • </Text>
          <TouchableOpacity
            onPress={handleRestorePurchases}
            disabled={isLoading}
            activeOpacity={0.7}>
            <Text style={styles.linkText}>Restore Purchases</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscribe Button */}
      {!isLoading && (
        <View style={styles.stickyBottom}>
          <TouchableOpacity
            style={[
              styles.subscribeButton,
              (isPurchasing || pricingTiers.length === 0) &&
                styles.subscribeButtonDisabled,
            ]}
            onPress={handleSubscribe}
            disabled={isPurchasing || pricingTiers.length === 0}
            activeOpacity={0.9}>
            {isPurchasing ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.subscribeButtonText}>Subscribe</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
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
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text.secondary,
  },
  premiumActiveContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  premiumActiveTitle: {
    fontSize: 28,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 20,
    marginBottom: 12,
  },
  premiumActiveSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
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
  subscribeButtonDisabled: {
    backgroundColor: colors.text.quaternary,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
  },
  restoreButton: {
    marginTop: 8,
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },
});

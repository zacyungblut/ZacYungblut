import React, { useState } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

type PricingTier = "monthly" | "yearly" | "lifetime";

export default function PremiumScreen() {
  const [selectedTier, setSelectedTier] = useState<PricingTier>("yearly");

  const handleBackPress = () => {
    router.back();
  };

  const handleSubscribe = () => {
    console.log("Subscribe pressed for:", selectedTier);
    // Handle subscription logic
  };

  const pricingTiers = [
    {
      id: "monthly" as PricingTier,
      title: "Monthly",
      price: "$18.99",
      period: "month",
      isSelected: selectedTier === "monthly",
    },
    {
      id: "yearly" as PricingTier,
      title: "Yearly",
      price: "$98.99",
      period: "year",
      isSelected: selectedTier === "yearly",
    },
  ];

  const features = [
    {
      icon: "infinite",
      title: "Unlimited Searches",
    },
    {
      icon: "eye-off",
      title: "Anonymous Searching",
    },

    {
      icon: "shield-checkmark",
      title: "See When Your Partner Is Searched",
    },
    {
      icon: "notifications",
      title: "Personal Alerts",
    },
  ];

  return (
    <LinearGradient
      colors={["#D8B4FE", "#8B5CF6", "#6B46C1", "#000000"]}
      style={styles.gradientContainer}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          {/* Empty spacer to balance the close button */}
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.appName}>Premium</Text>
          {/* <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO</Text>
          </View> */}
        </View>

        <TouchableOpacity onPress={handleBackPress} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.subtitle}>
            Experience Official with unlimited{"\n"}access to all features.
          </Text>
        </View>

        {/* Pricing Container - Compact */}
        <View style={styles.pricingWrapper}>
          {pricingTiers.map((tier) => (
            <TouchableOpacity
              key={tier.id}
              style={[
                styles.pricingCard,
                tier.isSelected && styles.pricingCardSelected,
              ]}
              onPress={() => setSelectedTier(tier.id)}
              activeOpacity={0.8}>
              <View style={styles.radioContainer}>
                <View
                  style={[
                    styles.radioButton,
                    tier.isSelected && styles.radioButtonSelected,
                  ]}>
                  {tier.isSelected && <View style={styles.radioInner} />}
                </View>
              </View>

              <View style={styles.pricingContent}>
                <Text style={styles.pricingTitle}>{tier.title}</Text>
                <Text style={styles.pricingPrice}>
                  {tier.price}
                  {tier.period && (
                    <Text style={styles.pricingPeriod}> / {tier.period}</Text>
                  )}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>WHAT'S INCLUDED</Text>

          {features.map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <Ionicons
                name={feature.icon as any}
                size={24}
                color={colors.white}
                style={styles.featureIcon}
              />
              <Text style={styles.featureTitle}>{feature.title}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky Bottom Section */}
      <View style={styles.stickyBottom}>
        <TouchableOpacity
          style={styles.subscribeButton}
          onPress={handleSubscribe}
          activeOpacity={0.9}>
          <LinearGradient
            colors={[colors.white, "#F8F9FA"]}
            style={styles.subscribeButtonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}>
            <Ionicons name="card" size={24} color="#8B5CF6" />
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.trialText}>
          Cancel anytime. Fully confidential.
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  gradientContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerLeft: {
    width: 40, // To balance the close button
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 120, // Space for sticky bottom
  },
  headerSection: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 20,
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  appName: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.white,
    marginRight: 12,
  },
  proBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  proText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  subtitle: {
    fontSize: 18,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 26,
  },
  pricingWrapper: {
    marginHorizontal: 24,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
    padding: 4,
    marginBottom: 20,
  },
  pricingCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    borderWidth: 2,
    borderColor: "transparent",
  },
  pricingCardSelected: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  radioContainer: {
    marginRight: 16,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  radioButtonSelected: {
    borderColor: colors.white,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.white,
  },
  pricingContent: {
    flex: 1,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
    marginBottom: 2,
  },
  pricingPrice: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
  },
  pricingPeriod: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    fontWeight: "400",
  },
  bestValueBadge: {
    backgroundColor: "#FF3B82",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bestValueText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.white,
  },
  featuresSection: {
    paddingHorizontal: 24,
  },
  featuresTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255, 255, 255, 0.7)",
    marginBottom: 24,
    letterSpacing: 1,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  featureIcon: {
    marginRight: 20,
    marginLeft: 4,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
  },
  stickyBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    backdropFilter: "blur(20px)",
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: 34, // Safe area bottom
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  subscribeButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  subscribeButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#8B5CF6",
  },
  trialText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 20,
  },
});

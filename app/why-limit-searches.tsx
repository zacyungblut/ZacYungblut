import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import TopBar from "@/components/TopBar";
import { router } from "expo-router";

const searchLimitPoints = [
  {
    icon: "shield-checkmark",
    title: "Privacy protection\nfor everyone",
    description:
      "Limiting searches prevents users from mass-searching contacts to discover everyone's relationship status without consent.",
  },
  {
    icon: "heart",
    title: "Each search\nis valuable",
    description:
      "When searches are limited, users think carefully about who they search for, making each search more meaningful and intentional.",
  },
  {
    icon: "people",
    title: "Prevents spam\nand harassment",
    description:
      "Without limits, bad actors could spam search thousands of numbers, creating privacy violations and potential harassment.",
  },
  {
    icon: "eye",
    title: "Focused on\npeople you know",
    description:
      "We want you to search for people you're actually talking to or considering dating, not browse randomly through contacts.",
  },
  {
    icon: "checkmark-circle",
    title: "Build trust with\nthe right information",
    description:
      "You get enough searches to discover if someone is single or in a relationship when it matters most for your decisions.",
  },
  {
    icon: "star",
    title: "Quality over\nquantity approach",
    description:
      "Rather than unlimited browsing, we provide thoughtful limits that respect everyone's privacy while giving you what you need.",
  },
];

export default function WhyLimitSearchesScreen() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Search Limits"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      <LinearGradient
        colors={[colors.background.primary, colors.background.secondary]}
        style={styles.content}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView
            style={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            {/* Header */}
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/official.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Thoughtful Search Limits</Text>
            </View>

            {/* Search Limit Points */}
            {searchLimitPoints.map((point, index) => (
              <View key={index} style={styles.pointContainer}>
                <View style={styles.pointIcon}>
                  <Ionicons
                    name={point.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.pointContent}>
                  <Text style={styles.pointTitle}>{point.title}</Text>
                  <Text style={styles.pointDescription}>
                    {point.description}
                  </Text>
                </View>
              </View>
            ))}

            {/* Search Limits Table */}
            <View style={styles.tableContainer}>
              {/* <Text style={styles.tableTitle}>Search Allowances</Text> */}

              {/* Table Header */}
              <View style={styles.tableRow}>
                <View style={[styles.tableCell, styles.tableHeaderCell]}>
                  <Text style={styles.tableHeaderText}>Plan</Text>
                </View>
                <View
                  style={[
                    styles.tableCell,
                    styles.tableHeaderCell,
                    styles.tableCellLast,
                  ]}>
                  <Text style={styles.tableHeaderText}>Searches</Text>
                </View>
              </View>

              {/* Free Plan Row */}
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <Text style={styles.tableCellText}>Free</Text>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast]}>
                  <Text style={styles.tableCellText}>2 per month</Text>
                </View>
              </View>

              {/* Premium Plan Row */}
              <View style={styles.tableRow}>
                <View style={styles.tableCell}>
                  <View style={styles.premiumLabelContainer}>
                    {/* <Ionicons name="star" size={16} color={colors.primary} /> */}
                    <Text style={[styles.tableCellText, styles.premiumText]}>
                      Premium
                    </Text>
                    <Image
                      source={require("@/assets/images/premium.png")}
                      style={styles.premiumImage}
                      resizeMode="contain"
                    />
                  </View>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast]}>
                  <Text style={[styles.tableCellText, styles.premiumText]}>
                    8 per month
                  </Text>
                </View>
              </View>

              {/* Referral Bonus Row */}
              <View style={[styles.tableRow, styles.tableRowLast]}>
                <View style={styles.tableCell}>
                  <View style={styles.bonusLabelContainer}>
                    <Text style={styles.tableCellText}>Referral Bonus</Text>
                  </View>
                </View>
                <View style={[styles.tableCell, styles.tableCellLast]}>
                  <Text style={styles.tableCellText}>2 bonus per friend</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    paddingTop: 8,
  },
  content: {
    flex: 1,
  },
  premiumImage: {
    width: 20,
    height: 20,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  headerLogo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  pointContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  pointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pointContent: {
    flex: 1,
    paddingTop: 2,
  },
  pointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  pointDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  // Table Styles
  tableContainer: {
    marginTop: 32,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border.light || "#E2E8F0",
  },
  tableTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.primary,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light || "#E2E8F0",
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableCell: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRightWidth: 1,
    borderRightColor: colors.border.light || "#E2E8F0",
    justifyContent: "center",
  },
  tableCellLast: {
    borderRightWidth: 0,
  },
  tableHeaderCell: {
    backgroundColor: colors.primary,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "white",
    textAlign: "center",
  },
  tableCellText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.primary,
    textAlign: "center",
  },
  premiumLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  premiumText: {
    color: colors.primary,
    fontWeight: "600",
  },
  bonusLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  bottomExplanation: {
    marginTop: 32,
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  explanationTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  explanationText: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  explanationSignature: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

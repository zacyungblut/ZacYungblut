import React from "react";
import {
  StyleSheet,
  ScrollView,
  View,
  Platform,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import TopBar from "@/components/TopBar";
import { router } from "expo-router";

const trustPoints = [
  {
    icon: "shield-checkmark",
    title: "Relationships are private. So is Official",
    description:
      "Your privacy is our highest priority. We built Official with privacy-first design principles.",
  },
  {
    icon: "eye-off",
    title: "We never share WHO you are dating",
    description:
      "Only your relationship status is visible. Your partner's identity remains completely private.",
  },
  {
    icon: "lock-closed",
    title: "We never share ANY information about you",
    description:
      "Only your phone number is used for verification. No personal data, no tracking, no profiles.",
  },
  {
    icon: "time",
    title: "We never share relationship details",
    description:
      "Duration, anniversary dates, and relationship history stay between you and your partner.",
  },
  {
    icon: "search",
    title: "No one knows if you search for them",
    description:
      "Searches are completely anonymous. No notifications, no traces, no digital footprints.",
  },
  {
    icon: "server",
    title: "Minimal data, maximum security",
    description:
      "We store only what's absolutely necessary and encrypt everything. Your trust is earned, not assumed.",
  },
];

export default function TrustCenterScreen() {
  const handleBackPress = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Trust Center"
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
            {/* Header - now inside ScrollView */}
            <View style={styles.header}>
              <Image
                source={require("@/assets/images/official.png")}
                style={styles.headerLogo}
                resizeMode="contain"
              />
              <Text style={styles.headerTitle}>Your Privacy Matters</Text>
              {/* <Text style={styles.headerSubtitle}>
                Your privacy and trust matter to us
              </Text> */}
            </View>

            {/* Trust Points */}
            {trustPoints.map((point, index) => (
              <View key={index} style={styles.trustPointContainer}>
                <View style={styles.trustPointIcon}>
                  <Ionicons
                    name={point.icon as any}
                    size={24}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.trustPointContent}>
                  <Text style={styles.trustPointTitle}>{point.title}</Text>
                  <Text style={styles.trustPointDescription}>
                    {point.description}
                  </Text>
                </View>
              </View>
            ))}

            {/* Bottom Assurance */}
            <View style={styles.bottomAssurance}>
              <Text style={styles.assuranceTitle}>Our Promise</Text>
              <Text style={styles.assuranceText}>
                Official was built by people who believe privacy is a
                fundamental right, and nothing is more private than your
                relationship. We will protect your privacy at all costs.
              </Text>
              <Text style={styles.assuranceSignature}>— The Official Team</Text>
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
  },
  content: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32, // Increased horizontal padding
    paddingTop: 24, // Added top padding
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40, // Increased margin for better spacing
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
  headerSubtitle: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
  },
  trustPointContainer: {
    flexDirection: "row",
    marginBottom: 24,
    alignItems: "flex-start",
  },
  trustPointIcon: {
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
  trustPointContent: {
    flex: 1,
    paddingTop: 2,
  },
  trustPointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 6,
    lineHeight: 22,
  },
  trustPointDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 20,
  },
  bottomAssurance: {
    marginTop: 32,
    padding: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  assuranceTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 12,
    textAlign: "center",
  },
  assuranceText: {
    fontSize: 15,
    fontWeight: "400",
    color: colors.text.secondary,
    lineHeight: 22,
    textAlign: "center",
    marginBottom: 16,
  },
  assuranceSignature: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

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
    title: "Relationships are private.\nSo is Official",
  },
  {
    icon: "eye-off",
    title: "We never share\nWHO you are exclusive with",
  },
  {
    icon: "lock-closed",
    title: "We never share ANY\ninformation about you",
  },
  {
    icon: "time",
    title: "We never share relationship details",
  },
  {
    icon: "search",
    title: "No one knows when you\nsearch for them",
  },
  {
    icon: "server",
    title: "Minimal data, maximum security",
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
              <Text style={styles.headerTitle} allowFontScaling={false}>
                Your Privacy Matters
              </Text>
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
                    size={28}
                    color={colors.primary}
                  />
                </View>
                <View style={styles.trustPointContent}>
                  <Text style={styles.trustPointTitle} allowFontScaling={false}>
                    {point.title}
                  </Text>
                </View>
              </View>
            ))}

            {/* Bottom Assurance */}
            <View style={styles.bottomAssurance}>
              <Text style={styles.assuranceTitle} allowFontScaling={false}>
                Our Promise
              </Text>
              <Text style={styles.assuranceText} allowFontScaling={false}>
                Official was built by people who believe privacy is a
                fundamental right, and nothing is more private than your
                relationship. We will protect your privacy at all costs.
              </Text>
              <Text style={styles.assuranceSignature} allowFontScaling={false}>
                — The Official Team
              </Text>
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
    paddingHorizontal: 20, // Reduced from 32 to 20
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
    alignItems: "center", // Changed from "flex-start" to "center"
  },
  trustPointIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    // backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 0,
    borderColor: colors.primary,
  },
  trustPointContent: {
    flex: 1,
    justifyContent: "center", // Added to center the text vertically
  },
  trustPointTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    lineHeight: 22,
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

import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";

// Using your existing icon as a placeholder for the logo
import LogoPlaceholder from "@/assets/images/official.png";

// Colors matching the modern design
const colors = {
  background: "#F8F9FA",
  white: "#FFFFFF",
  text: "#2D3748",
  subtext: "#718096",
  primary: "#222038", // Modern purple-blue
  primaryLight: "#E6FFFA",
  border: "#E2E8F0",
  accent: "#FF6B6B", // Coral accent like the logo
};

export default function Auth() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Decorative background elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.shape, styles.triangle]} />
        <View style={[styles.shape, styles.star]} />
        <View style={[styles.shape, styles.plus]} />
      </View>

      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Logo and app icon */}
        <View style={styles.logoContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={LogoPlaceholder}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Welcome text */}
          <View style={styles.textContainer}>
            <Text style={styles.welcomeText}>Make it</Text>
            <Text style={styles.welcomeText}>Official</Text>
          </View>

          {/* Tagline */}
          <View style={styles.taglineContainer}>
            <Text style={styles.taglineText}>Made for couples.</Text>
            <Text style={styles.taglineText}>Designed for privacy.</Text>
          </View>
        </View>

        {/* Bottom buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signupButton]}
            onPress={() => router.push("/signup")}
            activeOpacity={0.8}>
            <Text style={[styles.buttonText, styles.signupButtonText]}>
              Sign Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => router.push("/signup")} // Update this to login route when ready
            activeOpacity={0.8}>
            <Text style={[styles.buttonText, styles.loginButtonText]}>
              Log In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  decorativeElements: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  circle: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: colors.border,
    opacity: 0.3,
  },
  circle1: {
    width: 120,
    height: 120,
    top: "15%",
    left: "10%",
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: "25%",
    right: "15%",
  },
  shape: {
    position: "absolute",
    opacity: 0.2,
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 25,
    borderRightWidth: 25,
    borderBottomWidth: 40,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: colors.border,
    top: "70%",
    left: "20%",
  },
  star: {
    width: 30,
    height: 30,
    backgroundColor: colors.border,
    top: "25%",
    right: "25%",
    transform: [{ rotate: "45deg" }],
  },
  plus: {
    width: 20,
    height: 20,
    backgroundColor: colors.border,
    bottom: "45%",
    left: "25%",
  },
  contentContainer: {
    flex: 1,
    zIndex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 50,
    height: 50,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: "600",
    color: colors.text,
    letterSpacing: -1,
  },
  taglineContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  taglineText: {
    fontSize: 18,
    color: colors.subtext,
    fontWeight: "400",
    lineHeight: 26,
  },
  buttonContainer: {
    paddingBottom: 50,
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
  },
  signupButton: {
    backgroundColor: colors.primary,
  },
  loginButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signupButtonText: {
    color: colors.white,
  },
  loginButtonText: {
    color: colors.text,
  },
});

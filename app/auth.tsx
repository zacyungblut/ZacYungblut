import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";

// Using your existing icon as a placeholder for the logo
import LogoPlaceholder from "@/assets/images/official.png";

// Colors matching the modern design
const colors = {
  background: "#F8F9FA",
  lightGrey: "#F5F5F7", // Light grey for top texture
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
      {/* Background with light grey texture at top */}
      <View style={styles.backgroundContainer}>
        <View style={styles.greyBackground} />

        {/* Curved white mask using border radius */}
        <View style={styles.curvedMask} />
      </View>

      {/* Main content container */}
      <View style={styles.contentContainer}>
        {/* Logo and app icon */}
        <View style={styles.logoContainer}>
          <Image
            source={LogoPlaceholder}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Welcome text */}
          <View style={styles.textContainer}>
            <Text style={styles.makeItText}>let's make it</Text>
            <Text style={styles.officialText}>Official</Text>
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

          {/* Terms and Privacy Policy */}
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By continuing, you agree to Official's{" "}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL("https://your-terms-url.com")}>
                Terms & Conditions
              </Text>{" "}
              and{" "}
              <Text
                style={styles.linkText}
                onPress={() => Linking.openURL("https://your-privacy-url.com")}>
                Privacy Policy
              </Text>
              .
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  backgroundContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  greyBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: colors.lightGrey,
  },
  curvedMask: {
    position: "absolute",
    top: 160,
    left: -50,
    right: -50,
    height: 300,
    backgroundColor: colors.white,
    borderTopLeftRadius: 120,
    borderTopRightRadius: 120,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 80,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3, // For Android shadow
  },
  logo: {
    width: 160,
    height: 160,
    marginBottom: 0,
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
    marginTop: 140,
    marginBottom: 40,
  },
  taglineText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: "400",
    lineHeight: 20,
  },
  buttonContainer: {
    gap: 12,
    marginHorizontal: 16,
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
  makeItText: {
    fontSize: 28,
    fontWeight: "300",
    color: colors.primary,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  officialText: {
    fontSize: 72,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: -1,
  },
  termsContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    alignItems: "center",
  },
  termsText: {
    fontSize: 12,
    color: colors.subtext,
    textAlign: "center",
    lineHeight: 16,
  },
  linkText: {
    color: colors.primary,
    fontWeight: "500",
  },
});

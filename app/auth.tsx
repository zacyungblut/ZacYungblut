import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import { useRouter } from "expo-router";

// Using your existing icon as a placeholder for the logo
import LogoPlaceholder from "@/assets/images/official.png";

// Define colors similar to the example
const colors = {
  white: "#FFFFFF",
  primary: "#000000",
  signup: "#007AFF", // iOS blue as signup color
};

export default function Signup() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo in center */}
      <View style={styles.logoContainer}>
        <Image
          source={LogoPlaceholder}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Bottom buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.signupButton]}
          onPress={() => router.push("/signup")}
          activeOpacity={0.8}>
          <Text style={[styles.buttonText, styles.signupButtonText]}>
            SIGN UP
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.loginButton]}
          onPress={() => router.push("/signup")}
          activeOpacity={0.8}>
          <Text style={[styles.buttonText, styles.loginButtonText]}>
            LOG IN
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginLeft: -8,
    marginTop: -100,
  },
  buttonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
  },
  button: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  loginButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(0, 0, 0, 0.1)",
  },
  signupButton: {
    backgroundColor: colors.signup,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 1,
  },
  loginButtonText: {
    color: colors.primary,
  },
  signupButtonText: {
    color: colors.white,
  },
});

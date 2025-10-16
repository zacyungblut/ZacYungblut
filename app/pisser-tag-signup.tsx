import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  View as RNView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { AuthService } from "@/utils/authStorage";
import { checkPisserTagAvailability } from "@/api";

interface AvailabilityResponse {
  available: boolean;
  tag: string;
  error: string | null;
}

export default function PisserTagSignupScreen() {
  const params = useLocalSearchParams();
  const mode = typeof params["mode"] === "string" ? params["mode"] : "signup";
  const isLoginMode = mode === "login";

  const [pisserTag, setPisserTag] = useState("");
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textInputRef = useRef<TextInput>(null);

  const handleBackPress = () => {
    router.back();
  };

  // Check availability when user stops typing
  useEffect(() => {
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    if (pisserTag.length >= 3) {
      checkTimeoutRef.current = setTimeout(() => {
        checkAvailability(pisserTag);
      }, 2000);
    } else {
      setIsAvailable(null);
      setError(null);
    }

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [pisserTag]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const checkAvailability = async (tag: string) => {
    if (tag.length < 3) {
      setIsAvailable(null);
      return;
    }

    setIsChecking(true);
    setIsAvailable(null);
    setError(null);

    try {
      const response = await checkPisserTagAvailability(tag);

      // Check if response and response.data exist
      if (!response || !response.data) {
        console.error("Invalid response from server:", response);
        setError("Unable to check availability. Please try again.");
        setIsAvailable(null);
        return;
      }

      const data: AvailabilityResponse = response.data;

      if (data.error) {
        setError(data.error);
        setIsAvailable(false);
      } else {
        setIsAvailable(data.available);
        if (!data.available) {
          // This shouldn't happen if backend is working correctly, but keep as fallback
          setError("This pissername is already taken");
        } else {
          setError(null);
        }
      }
    } catch (error: any) {
      console.error("Error checking availability:", error);

      // More detailed error handling
      if (error.response) {
        // Server responded with error status
        console.error("Server error response:", error.response.data);
        setError("Server error. Please try again.");
      } else if (error.request) {
        // Request was made but no response received
        console.error("No response received:", error.request);
        setError("Network error. Check your connection.");
      } else {
        // Something else happened
        console.error("Request setup error:", error.message);
        setError("Unable to check availability. Try again.");
      }
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const validatePisserTag = (tag: string): string | null => {
    if (tag.length < 3) {
      return "Pissername must be at least 3 characters";
    }
    if (tag.length > 20) {
      return "Pissername must be 20 characters or less";
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(tag)) {
      return "Pissername can only contain letters, numbers, underscores, dashes, and dots";
    }
    return null;
  };

  const canContinue =
    !loading &&
    !isChecking &&
    !error &&
    pisserTag.length >= 3 &&
    isAvailable === true &&
    !validatePisserTag(pisserTag);

  const handleContinue = async () => {
    if (!canContinue) return;

    const validationError = validatePisserTag(pisserTag);
    if (validationError) {
      Alert.alert("Invalid Pissername", validationError);
      return;
    }

    if (pisserTag.length === 0) {
      Alert.alert(
        "Pissername Required",
        "Please enter a pissername to continue."
      );
      return;
    }

    if (isAvailable !== true) {
      Alert.alert(
        "Pissername Not Available",
        "Please choose an available pissername to continue."
      );
      return;
    }

    try {
      // Save the pisser tag to device storage for later use during signup
      AuthService.setPendingPisserTag(pisserTag.toLowerCase().trim());

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to phone number signup
      router.push({
        pathname: "/signup",
        params: { mode },
      });
    } catch (error) {
      console.error("Error saving pisser tag:", error);
      Alert.alert("Error", "Failed to save pissername. Please try again.");
    }
  };

  const handleSkip = () => {
    // Remove any pending pisser tag and go to signup
    AuthService.removePendingPisserTag();
    router.push({
      pathname: "/signup",
      params: { mode },
    });
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <Ionicons name="time-outline" size={20} color={colors.text.secondary} />
      );
    }
    if (error) {
      return (
        <Ionicons name="close-circle" size={20} color={colors.accent.primary} />
      );
    }
    if (isAvailable === true) {
      return (
        <Ionicons name="checkmark-circle" size={20} color={colors.success} />
      );
    }
    if (isAvailable === false) {
      return (
        <Ionicons name="close-circle" size={20} color={colors.accent.primary} />
      );
    }
    return null;
  };

  const getStatusText = () => {
    if (pisserTag.length === 0) return "";
    if (pisserTag.length < 3) return "Minimum 3 characters";
    if (isChecking) return "Checking availability...";
    if (error) return error;
    if (isAvailable === true) return "Pissername available";
    if (isAvailable === false) return "This pissername is taken";
    return "";
  };

  const getStatusTextColor = () => {
    if (isChecking) return colors.text.secondary;
    if (error || isAvailable === false) return colors.accent.primary;
    if (isAvailable === true) return colors.success;
    return colors.text.secondary;
  };

  return (
    <View style={styles.container}>
      <TopBar
        title=""
        showBackButton={true}
        onBackPress={handleBackPress}
        showPremiumButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Intro Section */}
          <View style={styles.introSection}>
            <Text style={styles.introTitle}>
              {isLoginMode ? "Welcome back!" : "Create Your Username"}
            </Text>
            <Text style={styles.introDescription}>
              {isLoginMode
                ? "Choose a pissername for your account"
                : "Your pissername will be displayed when others search for you and when you post content."}
            </Text>
          </View>

          {/* Pisser Tag Input */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Pissername</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.atSymbol}>@</Text>
              <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={pisserTag}
                onChangeText={setPisserTag}
                placeholder="username"
                placeholderTextColor={colors.text.quaternary}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                maxLength={20}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
              />
              {getStatusIcon() && (
                <View style={styles.statusIcon}>{getStatusIcon()}</View>
              )}
            </View>

            {/* Status Text */}
            {getStatusText() ? (
              <Text
                style={[styles.statusText, { color: getStatusTextColor() }]}>
                {getStatusText()}
              </Text>
            ) : null}
          </View>

          {/* Continue Button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.continueButton,
                !canContinue && styles.continueButtonDisabled,
              ]}
              onPress={handleContinue}
              disabled={!canContinue}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.continueButtonText,
                  !canContinue && styles.continueButtonTextDisabled,
                ]}>
                {loading ? "Saving..." : "Continue"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Guidelines */}
          <View style={styles.guidelinesContainer}>
            <Text style={styles.guidelinesTitle}>Pissername Guidelines:</Text>
            <Text style={styles.guideline}>• 3-16 characters</Text>
            <Text style={styles.guideline}>
              • Letters, numbers, underscores, dashes, and dots only
            </Text>
            <Text style={styles.guideline}>
              • Can start or end with underscores
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
  },
  introSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  introDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  inputSection: {
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.medium,
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 52,
  },
  atSymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 18,
    color: colors.text.primary,
    paddingVertical: 12,
    fontWeight: "500",
  },
  statusIcon: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
  },
  buttonContainer: {
    paddingHorizontal: 4,
    marginBottom: 10,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: colors.border.medium,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  continueButtonTextDisabled: {
    color: colors.text.quaternary,
  },
  guidelinesContainer: {
    padding: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  guideline: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
});

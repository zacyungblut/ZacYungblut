import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
  Share,
  Alert,
  Linking,
} from "react-native";
import { useState, useRef } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from "react-native-reanimated";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import SearchResultCard, {
  SearchPlaceholderCard,
} from "@/components/SearchResultCard";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";
import { searchUserByPhone } from "@/api";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { calculateRemainingSearches, referralMessage } from "@/utils/helpers";
import { useNotification } from "@/contexts/NotificationContext";

const { width } = Dimensions.get("window");

// Tab bar height from TabBar.tsx
const TAB_BAR_HEIGHT = 120;

interface SearchResult {
  phone: string;
  exists: boolean;
  relationshipStatus: string;
  name: string | null;
}

export default function SearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isInviteLoading, setIsInviteLoading] = useState(false);

  // Animated value for focus state
  const focusAnimation = useSharedValue(0);
  // Animated value for placeholder card
  const placeholderAnimation = useSharedValue(0);

  // Get user data from Redux
  const { user, fetchUser } = useUserRedux();
  const { addNotification } = useNotification();

  // Calculate remaining searches
  const remainingSearches = calculateRemainingSearches(
    user?.searchTransactions || [],
    user?.bonusSearches || 0
  );

  const handleInputFocus = () => {
    setIsInputFocused(true);
    focusAnimation.value = withTiming(1, { duration: 300 });
    placeholderAnimation.value = withTiming(1, { duration: 400 });
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
    focusAnimation.value = withTiming(0, { duration: 300 });
    placeholderAnimation.value = withTiming(0, { duration: 300 });
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setSearchResult(null);
    setSearchError(null);

    // Perform search when user has typed a complete phone number
    if (text.length >= 10) {
      performSearch(text);
    }
  };

  const performSearch = async (phone: string) => {
    // Check if user has remaining searches
    if (remainingSearches <= 0) {
      setSearchError("You've used all your searches for this month.");
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Combine country code with phone number - ensure proper formatting
      const fullPhoneNumber = selectedCountry.dialCode + phone;
      console.log("Searching for phone number:", fullPhoneNumber);
      const response = await searchUserByPhone(fullPhoneNumber);

      if (response.data.success) {
        // Immediately show the actual relationship status instead of requiring unlock
        const result = response.data.result;

        // Get the actual status if it's known
        let actualStatus = result.relationshipStatus;
        if (actualStatus === "KNOWN") {
          // In the new system, we'll need to modify the backend to return the actual status
          actualStatus = "Single"; // This will be updated when backend is modified
        }

        setSearchResult({
          ...result,
          relationshipStatus: actualStatus,
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setSearchError("Search failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Search error:", error);
      if (error.response?.status === 401) {
        setSearchError("Please log in to search for users.");
      } else {
        setSearchError("Unable to search at this time. Please try again.");
      }
    } finally {
      setIsSearching(false);
      await fetchUser();
    }
  };

  // New combined function that performs search
  const handleCheckStatus = async () => {
    if (!phoneNumber) return;

    // Perform the search
    await performSearch(phoneNumber);
  };

  const handlePremiumPress = () => {
    router.push("/premium");
  };

  const handleShareReferralLink = async () => {
    console.log("Share referral link pressed");
    setIsInviteLoading(true);

    try {
      // Create the invite link
      const inviteLink = `https://makeitofficial.us/refer/${user?.id}`;

      // Show native share dialog
      try {
        const result = await Share.share({
          message: referralMessage,
          url: inviteLink,
          title: "My Relationship",
        });

        if (result.action === Share.sharedAction) {
          // Record successful share attempt
          try {
            const shareMethod = result.activityType
              ? `native_share:${result.activityType}`
              : "native_share:unknown";

            console.log(
              "Share successful via:",
              result.activityType || "unknown"
            );
          } catch (shareTrackingError) {
            console.error("Failed to track share attempt:", shareTrackingError);
          }

          addNotification({
            title: "Referral Link Shared",
            description: "Your referral link has been shared successfully",
            type: "success",
            emoji: "🎉",
          });

          // Refresh user data after successful share
          await fetchUser();
        } else {
          // Record aborted share attempt
          try {
            console.log("Share cancelled by user");
          } catch (shareTrackingError) {
            console.error("Failed to track aborted share:", shareTrackingError);
          }
        }
      } catch (shareError) {
        console.error("Error sharing:", shareError);
        Alert.alert("Share Error", "Failed to share the referral link");
      }
    } catch (error: any) {
      console.error("Error creating invite:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to create invitation";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsInviteLoading(false);
    }
  };

  const handleLearnWhy = () => {
    router.push("/why-limit-searches");
  };

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(focusAnimation.value, [0, 1], [1, 0]);
    const scale = interpolate(focusAnimation.value, [0, 1], [1, 0.8]);
    const translateY = interpolate(focusAnimation.value, [0, 1], [0, -100]);

    return {
      opacity,
      transform: [{ scale }, { translateY }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(focusAnimation.value, [0, 1], [0, -200]);

    return {
      transform: [{ translateY }],
    };
  });

  // Animated styles for placeholder card
  const placeholderAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(placeholderAnimation.value, [0, 1], [0, 1]);
    const translateY = interpolate(placeholderAnimation.value, [0, 1], [30, 0]);
    const scale = interpolate(placeholderAnimation.value, [0, 1], [0.95, 1]);

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  return (
    <View style={styles.container}>
      <TopBar title="Search Others" />

      {/* Main Content */}
      <View style={styles.contentContainer}>
        {/* Animated Header Section */}
        <Animated.View style={[styles.headerSection, headerAnimatedStyle]}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="search"
              size={80}
              color={colors.primary || "#2563EB"}
            />
          </View>
          <Text style={styles.titleText}>Find a Status</Text>
        </Animated.View>

        {/* Animated Content */}
        <Animated.View style={[styles.animatedContent, contentAnimatedStyle]}>
          {/* Phone Input Section */}
          <View style={styles.inputSection}>
            <PhoneTextInput
              label=""
              phoneNumber={phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
              selectedCountry={selectedCountry}
              placeholder="Enter phone number"
              autoFocus={false}
              onCountryChange={setSelectedCountry}
              containerStyle={styles.phoneInputContainer}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
            />
          </View>

          {/* Check Status Button */}
          <TouchableOpacity
            style={[
              styles.checkButton,
              (!phoneNumber || isSearching || remainingSearches <= 0) &&
                styles.checkButtonDisabled,
            ]}
            onPress={handleCheckStatus}
            disabled={!phoneNumber || isSearching || remainingSearches <= 0}
            activeOpacity={0.8}
            delayPressIn={0}
            delayPressOut={0}>
            {isSearching ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.checkButtonText}>Check Status</Text>
            )}
          </TouchableOpacity>

          {/* Results Section */}
          <View style={styles.resultsSection}>
            {searchResult ? (
              <SearchResultCard
                searchResult={searchResult}
                isUnlocking={false}
                onUnlockStatus={() => {}} // No longer needed
              />
            ) : isInputFocused && !searchError ? (
              <Animated.View style={placeholderAnimatedStyle}>
                <SearchPlaceholderCard
                  phoneNumber={phoneNumber}
                  isInputFocused={isInputFocused}
                />
              </Animated.View>
            ) : null}

            {searchError && (
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{searchError}</Text>

                {/* Show different buttons based on error type */}
                {searchError.includes("used all your searches") ? (
                  <View style={styles.errorButtonsContainer}>
                    <TouchableOpacity
                      style={styles.premiumButton}
                      onPress={handlePremiumPress}
                      delayPressIn={0}
                      delayPressOut={0}>
                      <View style={styles.buttonContent}>
                        <Ionicons name="star" size={20} color="white" />
                        <Text style={styles.premiumButtonText}>
                          Upgrade to Premium
                        </Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.referButton,
                        isInviteLoading && styles.buttonDisabled,
                      ]}
                      onPress={handleShareReferralLink}
                      disabled={isInviteLoading}
                      delayPressIn={0}
                      delayPressOut={0}>
                      <View style={styles.buttonContent}>
                        {isInviteLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={colors.primary}
                          />
                        ) : (
                          <>
                            <Ionicons
                              name="people"
                              size={20}
                              color={colors.primary}
                            />
                            <Text style={styles.referButtonText}>
                              Refer a Friend
                            </Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.learnWhyButton}
                      onPress={handleLearnWhy}
                      delayPressIn={0}
                      delayPressOut={0}>
                      <Text style={styles.learnWhyText}>
                        Learn why we limit searches
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.retryButton}
                    onPress={handleCheckStatus}
                    delayPressIn={0}
                    delayPressOut={0}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </View>

      {/* Fixed Premium Section - Only show when no search result */}
      {!searchResult && (
        <View style={styles.fixedPremiumSection}>
          <Text style={styles.premiumText}>
            <Text style={{ fontWeight: "bold" }}>
              {remainingSearches}{" "}
              {remainingSearches === 1 ? "search" : "searches"}
            </Text>{" "}
            left for this month.
          </Text>
          <Text style={styles.premiumSubtext}>
            Upgrade for 8 monthly searches +{" "}
            <Text style={styles.premiumLink}>Premium</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary || "#FFFFFF",
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: TAB_BAR_HEIGHT,
  },

  // Header Section - give it a fixed height initially
  headerSection: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
    height: 200,
    justifyContent: "center",
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary || "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  titleText: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text.primary || "#000000",
    textAlign: "center",
  },

  // Animated Content
  animatedContent: {
    flex: 1,
  },

  // Input Section
  inputSection: {
    marginBottom: 24,
  },

  phoneInputContainer: {
    marginBottom: 0,
  },

  // Check Button
  checkButton: {
    backgroundColor: colors.primary || "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    shadowColor: colors.primary || "#2563EB",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },

  checkButtonDisabled: {
    opacity: 0.6,
  },

  checkButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },

  // Results Section
  resultsSection: {
    flex: 1,
    alignItems: "center",
  },

  // Error Card
  errorCard: {
    alignItems: "center",
    paddingVertical: 0,
    paddingHorizontal: 24,
  },

  errorText: {
    fontSize: 16,
    color: colors.status.error || "#F44336",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },

  errorButtonsContainer: {
    width: "100%",
    alignItems: "center",
    gap: 12,
  },

  premiumButton: {
    backgroundColor: colors.primary || "#2563EB",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary || "#2563EB",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },

  referButton: {
    backgroundColor: colors.background.secondary || "#F8FAFC",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.medium || "#CBD5E1",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  premiumButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  referButtonText: {
    color: colors.primary || "#2563EB",
    fontSize: 16,
    fontWeight: "600",
  },

  buttonIcon: {
    marginRight: 6,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  learnWhyButton: {
    marginTop: 8,
    paddingVertical: 8,
  },

  learnWhyText: {
    color: colors.text.secondary || "#64748B",
    fontSize: 14,
    textDecorationLine: "underline",
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: colors.background.secondary || "#F8FAFC",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium || "#CBD5E1",
  },

  retryButtonText: {
    color: colors.text.primary || "#000000",
    fontSize: 16,
    fontWeight: "600",
  },

  // Fixed Premium Section
  fixedPremiumSection: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT + 20,
    left: 20,
    right: 20,
    alignItems: "center",
    backgroundColor: colors.background.primary || "#FFFFFF",
    paddingVertical: 16,
  },

  premiumText: {
    fontSize: 14,
    color: colors.text.secondary || "#64748B",
    textAlign: "center",
    marginBottom: 4,
  },

  premiumSubtext: {
    fontSize: 14,
    color: colors.text.secondary || "#64748B",
    textAlign: "center",
    marginTop: 4,
  },

  premiumLink: {
    color: colors.primary || "#2563EB",
    fontWeight: "600",
  },

  // Placeholder card styles
  placeholderCard: {
    backgroundColor: colors.background.secondary || "#F8FAFC",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.light || "#E2E8F0",
    opacity: 0.7,
  },

  placeholderIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary || "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  placeholderContent: {
    alignItems: "center",
  },

  placeholderTitle: {
    fontSize: 18,
    color: colors.text.secondary || "#64748B",
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },

  placeholderSubtitle: {
    fontSize: 14,
    color: colors.text.tertiary || "#94A3B8",
    textAlign: "center",
  },
});

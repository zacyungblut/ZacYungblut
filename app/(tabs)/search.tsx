import {
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import SearchResultCard from "@/components/SearchResultCard";
import AnimatedSearchEmptyState from "@/components/AnimatedSearchEmptyState";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";
import { searchUserByPhone, unlockUserStatus } from "@/api";
import { useUserRedux } from "@/store/hooks/useUserRedux";

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
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Get user data and unlock transaction function from Redux
  const { user, addNewUnlockTransaction } = useUserRedux();

  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    setSearchResult(null);
    setSearchError(null);

    // Perform search when user has typed a complete phone number
    if (text.length >= 10) {
      // Adjust this based on your minimum phone number length
      performSearch(text);
    }
  };

  const performSearch = async (phone: string) => {
    setIsSearching(true);
    setSearchError(null);

    try {
      // Combine country code with phone number - ensure proper formatting
      const fullPhoneNumber = selectedCountry.dialCode + phone;
      console.log("Searching for phone number:", fullPhoneNumber); // Debug log
      const response = await searchUserByPhone(fullPhoneNumber);

      if (response.data.success) {
        setSearchResult(response.data.result);
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
    }
  };

  const handleUnlockStatus = async () => {
    if (!searchResult || isUnlocking) return;

    setIsUnlocking(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    try {
      const response = await unlockUserStatus(searchResult.phone);

      if (response.data.success) {
        setSearchResult((prev) =>
          prev
            ? {
                ...prev,
                relationshipStatus: response.data.result.relationshipStatus,
              }
            : null
        );

        // Add the new unlock transaction to Redux store
        addNewUnlockTransaction({
          id: response.data.result.transactionId,
          userId: user?.id || "",
          targetPhone: response.data.result.phone,
          targetStatus: response.data.result.relationshipStatus,
          createdAt: new Date().toISOString(),
        });

        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setSearchError("Failed to unlock status. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error: any) {
      console.error("Unlock error:", error);
      if (error.response?.status === 401) {
        setSearchError("Please log in to unlock status.");
      } else if (error.response?.status === 404) {
        setSearchError("User status not available.");
      } else {
        setSearchError("Failed to unlock status. Please try again.");
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleAddToWatchlist = () => {
    if (!searchResult) return;

    // TODO: Implement add to watchlist functionality
    console.log("Adding to watchlist:", searchResult.phone);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // You could show a toast or navigation here
    // For now, just log it
  };

  const clearSearch = () => {
    setPhoneNumber("");
    setSearchResult(null);
    setSearchError(null);
  };

  // Determine what to show in the content area
  const showAnimatedState = !searchResult && !searchError; // Show animated state when no results and no errors
  const showSearchResults = !isSearching && (searchResult || searchError);

  return (
    <View style={styles.container}>
      <TopBar title="Search" />

      {/* Content area - now takes up most of the screen */}
      <View style={styles.contentContainer}>
        {/* Always show animated empty state unless we have search results or errors */}
        {showAnimatedState && (
          <View style={styles.emptyStateWrapper}>
            <AnimatedSearchEmptyState
              phoneNumberLength={phoneNumber.length}
              isSearching={isSearching}
            />
          </View>
        )}

        {/* Search results or error */}
        {showSearchResults && (
          <View style={styles.searchResultsContainer}>
            {searchError ? (
              <View style={styles.errorContainer}>
                <Ionicons
                  name="alert-circle"
                  size={60}
                  color={colors.status.error || "#F44336"}
                />
                <Text style={styles.errorText}>{searchError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => performSearch(phoneNumber)}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : searchResult ? (
              <SearchResultCard
                searchResult={searchResult}
                isUnlocking={isUnlocking}
                onUnlockStatus={handleUnlockStatus}
                onAddToWatchlist={handleAddToWatchlist}
              />
            ) : null}
          </View>
        )}
      </View>

      {/* Search bar moved to the bottom for better thumb accessibility */}
      <View style={styles.searchBottomContainer}>
        <View style={styles.searchInputContainer}>
          <PhoneTextInput
            label=""
            phoneNumber={phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            selectedCountry={selectedCountry}
            placeholder="Search by phone number"
            autoFocus={false}
            onCountryChange={setSelectedCountry}
            containerStyle={styles.phoneInputContainer}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Content area styles - now takes up most of the screen with bottom padding for search input
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 120, // Add padding to account for search input + tab bar
    position: "relative",
  },

  // New wrapper for empty state positioning
  emptyStateWrapper: {
    position: "absolute",
    top: 40, // Position higher up from the top
    left: 16,
    right: 16,
    // bottom: 120, // Keep bottom padding for search input
  },

  // Search bar at the bottom styles - positioned above tab bar
  searchBottomContainer: {
    position: "absolute",
    bottom: TAB_BAR_HEIGHT, // Position above the tab bar
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    backgroundColor: colors.background.primary,
    borderTopWidth: 0,
    borderTopColor: colors.border.light,
  },
  searchInputContainer: {
    position: "relative",
  },
  phoneInputContainer: {
    marginBottom: 0,
  },

  // Search results styles
  searchResultsContainer: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 16,
  },

  // Error styles
  errorContainer: {
    paddingTop: 100,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.status.error || "#F44336",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});

import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

interface SearchResult {
  phone: string;
  exists: boolean;
  relationshipStatus: string;
  name: string | null;
}

interface SearchResultCardProps {
  searchResult: SearchResult;
  isUnlocking: boolean;
  onUnlockStatus: () => void;
  onAddToWatchlist: () => void;
}

// New interface for placeholder card
interface SearchPlaceholderCardProps {
  phoneNumber: string;
  isInputFocused: boolean;
}

// New placeholder card component
export const SearchPlaceholderCard: React.FC<SearchPlaceholderCardProps> = ({
  phoneNumber,
  isInputFocused,
}) => {
  const getPlaceholderContent = () => {
    if (!isInputFocused && !phoneNumber) {
      return {
        title: "Enter a phone number",
        subtitle: "Start typing to search for someone's status",
        showSpinner: false,
      };
    }

    if (phoneNumber.length > 0 && phoneNumber.length < 10) {
      return {
        title: "Keep typing to search",
        subtitle: `${10 - phoneNumber.length} more digits needed`,
        showSpinner: true,
      };
    }

    return {
      title: "Ready to search",
      subtitle: "Enter a phone number to see their status",
      showSpinner: false,
    };
  };

  const content = getPlaceholderContent();

  return (
    <View style={[styles.resultCard, styles.placeholderCard]}>
      <View style={styles.resultIconContainer}>
        {content.showSpinner ? (
          <ActivityIndicator size="large" color={colors.primary || "#2563EB"} />
        ) : (
          <Ionicons
            name="search"
            size={60}
            color={colors.text.tertiary || "#94A3B8"}
          />
        )}
      </View>

      <View style={[styles.resultContent, styles.placeholderContent]}>
        <Text style={styles.resultTitle}>{content.title}</Text>
        <Text style={[styles.resultStatus, { fontWeight: "600" }]}>
          {content.subtitle}
        </Text>
        <Text style={[styles.resultDate, { opacity: 0 }]}>
          Placeholder spacing
        </Text>
      </View>
    </View>
  );
};

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  searchResult,
  isUnlocking,
  onUnlockStatus,
  onAddToWatchlist,
}) => {
  const [isAddingToWatchlist, setIsAddingToWatchlist] = useState(false);
  const { watchlist, addPhoneToWatchlist } = useUserRedux();

  // Check if this phone number is already in the watchlist
  const isInWatchlist = watchlist.includes(searchResult.phone);

  const handleWatchlistPress = async () => {
    if (isInWatchlist || isAddingToWatchlist) return;

    setIsAddingToWatchlist(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await addPhoneToWatchlist(searchResult.phone);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Call the parent's callback if provided
      onAddToWatchlist();
    } catch (error: any) {
      console.error("Failed to add to watchlist:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsAddingToWatchlist(false);
    }
  };

  const getDisplayStatus = () => {
    if (searchResult.relationshipStatus === "KNOWN") {
      return "Known";
    } else if (searchResult.relationshipStatus === "UNKNOWN") {
      return "Unknown";
    } else {
      return searchResult.relationshipStatus;
    }
  };

  // Helper function to determine if this is a successful result
  const isSuccessfulResult = () => {
    return searchResult.exists && searchResult.relationshipStatus !== "UNKNOWN";
  };

  return (
    <View
      style={[
        styles.resultCard,
        isSuccessfulResult() && styles.resultCardSuccess,
      ]}>
      <View
        style={[
          styles.resultIconContainer,
          isSuccessfulResult() && styles.resultIconContainerSuccess,
        ]}>
        <Ionicons
          name={
            searchResult.relationshipStatus === "UNKNOWN"
              ? "help-circle"
              : "shield-checkmark"
          }
          size={60}
          color={isSuccessfulResult() ? "#1E40AF" : colors.primary || "#2563EB"}
        />
      </View>

      <View style={styles.resultContent}>
        <Text style={styles.resultTitle}>This number's status is</Text>
        <Text
          style={[
            styles.resultStatus,
            isSuccessfulResult() && styles.resultStatusSuccess,
          ]}>
          {getDisplayStatus()}
        </Text>

        <Text style={styles.resultDate}>
          Confirmed on:{" "}
          {new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </Text>
      </View>

      {/* Watchlist Button */}
      <TouchableOpacity
        style={[
          styles.watchlistButton,
          isSuccessfulResult() && styles.watchlistButtonSuccess,
          (isInWatchlist || isAddingToWatchlist) &&
            styles.watchlistButtonDisabled,
        ]}
        onPress={handleWatchlistPress}
        disabled={isInWatchlist || isAddingToWatchlist}
        activeOpacity={0.7}
        delayPressIn={0}
        delayPressOut={0}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        {isAddingToWatchlist ? (
          <ActivityIndicator size="small" color={colors.text.secondary} />
        ) : (
          <>
            <Ionicons
              name={isInWatchlist ? "checkmark" : "add"}
              size={10}
              color={
                isInWatchlist ? colors.status.success : colors.text.secondary
              }
            />
            <Text
              style={[
                styles.watchlistButtonText,
                isInWatchlist && { color: colors.status.success },
              ]}>
              {isInWatchlist ? "Added" : "Watchlist"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: colors.background.secondary || "#F8FAFC",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    width: "100%",
    marginBottom: 32,
    borderWidth: 1,
    borderColor: colors.border.light || "#E2E8F0",
    position: "relative",
  },

  // Success variant with subtle blue tones
  resultCardSuccess: {
    backgroundColor: "#F8FAFF", // Very subtle blue tint
    borderColor: "#E1E7FF", // Light blue border
  },

  resultIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.background.primary || "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },

  // Success variant for icon container
  resultIconContainerSuccess: {
    backgroundColor: "#F0F4FF", // Very light blue background
    borderWidth: 1,
    borderColor: "#E1E7FF", // Light blue border
  },

  resultContent: {
    alignItems: "center",
    marginBottom: 20,
  },

  resultTitle: {
    fontSize: 18,
    color: colors.text.secondary || "#64748B",
    marginBottom: 8,
    textAlign: "center",
  },

  resultStatus: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary || "#000000",
    marginBottom: 16,
    textAlign: "center",
  },

  // Success variant for status text
  resultStatusSuccess: {
    color: "#1E40AF", // Blue tone for successful status
  },

  resultDate: {
    fontSize: 14,
    color: colors.text.tertiary || "#94A3B8",
    textAlign: "center",
  },

  // Watchlist Button
  watchlistButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary || "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.medium || "#CBD5E1",
    position: "absolute",
    top: 16,
    right: 16,
  },

  // Success variant for watchlist button
  watchlistButtonSuccess: {
    backgroundColor: "#F8FAFF", // Subtle blue background
    borderColor: "#C7D2FE", // Light blue border
  },

  watchlistButtonText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.text.secondary || "#64748B",
    marginLeft: 4,
  },

  watchlistButtonDisabled: {
    opacity: 0.6,
  },

  // Additional styles for placeholder to ensure full width
  placeholderCard: {
    opacity: 0.7,
    minWidth: "100%",
    flex: 0,
  },

  placeholderContent: {
    width: "100%",
    maxWidth: "100%",
  },
});

export default SearchResultCard;

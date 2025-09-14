import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

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
}

// New interface for placeholder card
interface SearchPlaceholderCardProps {
  phoneNumber: string;
  isInputFocused: boolean;
  hasSearches: boolean;
  needsStatusSet?: boolean;
}

// New placeholder card component
export const SearchPlaceholderCard: React.FC<SearchPlaceholderCardProps> = ({
  phoneNumber,
  isInputFocused,
  hasSearches,
  needsStatusSet = false,
}) => {
  const getPlaceholderContent = () => {
    if (needsStatusSet) {
      return {
        title: "Set your status first",
        subtitle: "You must set your relationship status to search others",
        showSpinner: false,
      };
    }

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

    // When phone is complete (10+ digits)
    if (phoneNumber.length >= 10) {
      if (hasSearches) {
        return {
          title: "Searching...",
          subtitle: "We'll show the results in a moment",
          showSpinner: true,
        };
      } else {
        // This case shouldn't show since error will be displayed instead
        return {
          title: "No searches remaining",
          subtitle: "You've used all your searches for this month",
          showSpinner: false,
        };
      }
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
          <Image
            source={require("@/assets/images/search.png")}
            style={styles.searchIcon}
            resizeMode="contain"
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
}) => {
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

  // Helper function to get the appropriate icon based on status
  const getStatusIcon = () => {
    const status = searchResult.relationshipStatus;

    if (status === "UNKNOWN") {
      return "help-circle";
    }

    // For all known statuses (including generic ones), use shield-checkmark
    if (
      status === "Single" ||
      status === "In a relationship" ||
      status === "Dating" ||
      status === "Engaged" ||
      status === "Married" ||
      status === "Separated" ||
      status === "Widowed" ||
      status === "Situationship" ||
      status === "Friends with Benefits" ||
      status === "On a Break" ||
      status === "Open Relationship" ||
      status === "Polyamorous"
    ) {
      return "shield-checkmark";
    }

    // Default fallback
    return "shield-checkmark";
  };

  // Helper function to determine color based on status type
  const getStatusColor = () => {
    const status = searchResult.relationshipStatus;

    if (status === "UNKNOWN") {
      return colors.primary || "#2563EB";
    }

    // All confirmed statuses get the success blue color
    return "#1E40AF";
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
        <Ionicons name={getStatusIcon()} size={60} color={getStatusColor()} />
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
    // backgroundColor: colors.background.primary || "#FFFFFF",
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

  searchIcon: {
    width: 60,
    height: 60,
  },
});

export default SearchResultCard;

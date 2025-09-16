import React, { useMemo } from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

// Status display mapping based on the schema and existing patterns
const STATUS_DISPLAY_MAP: { [key: string]: string } = {
  DATING: "Dating",
  EXCLUSIVE: "Exclusive",
  ENGAGED: "Engaged",
  MARRIED: "Married",
  SEPARATED: "Separated",
  WIDOWED: "Widowed",
  SITUATIONSHIP: "Situationship",
  FRIENDS_WITH_BENEFITS: "Friends with Benefits",
  ON_A_BREAK: "On a Break",
  OPEN_RELATIONSHIP: "Open Relationship",
  POLYAMOROUS: "Polyamorous",
  SINGLE: "Single",
  UNKNOWN: "Status Unknown",
};

// Status image mapping - using the same images as relationship.tsx
const getStatusImage = (status: string) => {
  switch (status) {
    case "Dating":
      return require("@/assets/images/dating.png");
    case "Exclusive":
      return require("@/assets/images/exclusive.png");
    case "Engaged":
      return require("@/assets/images/engaged.png");
    case "Married":
      return require("@/assets/images/married.png");
    case "Single":
      return require("@/assets/images/single.png");
    case "Status Unknown":
      return require("@/assets/images/unknown.png");
    case "In a relationship":
      return require("@/assets/images/dating.png");
    case "Situationship":
      return require("@/assets/images/situationship.png");
    default:
      // For other statuses that might not have specific images, use dating as fallback
      return require("@/assets/images/unknown.png");
  }
};

// Phone number formatting helper
const formatPhoneNumber = (phone: string): string => {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, "");

  // Handle US phone numbers (10 digits)
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // Handle US phone numbers with country code (11 digits starting with 1)
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    const withoutCountryCode = cleaned.slice(1);
    return `+1 (${withoutCountryCode.slice(0, 3)}) ${withoutCountryCode.slice(
      3,
      6
    )}-${withoutCountryCode.slice(6)}`;
  }

  // For other formats, just return as is with some basic formatting
  return phone;
};

// Time formatting helper
const formatSearchDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    return "Just now";
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
};

export default function PastSearchesScreen() {
  const { searchTransactions } = useUserRedux();

  const handleBackPress = () => {
    router.back();
  };

  // Sort search transactions by most recent first
  const sortedSearches = useMemo(() => {
    return [...searchTransactions]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .filter((search) => search.wasSuccessful); // Only show successful searches
  }, [searchTransactions]);

  const renderSearchItem = (search: any, index: number) => {
    const statusDisplay =
      STATUS_DISPLAY_MAP[search.targetStatus] || search.targetStatus;
    const statusImage = getStatusImage(search.targetStatus);

    return (
      <TouchableOpacity
        key={search.id}
        style={[
          styles.searchItem,
          index === sortedSearches.length - 1 && styles.lastSearchItem,
        ]}
        activeOpacity={0.7}>
        <View style={styles.searchItemLeft}>
          <View style={styles.statusImageContainer}>
            <Image
              source={statusImage}
              style={styles.statusImage}
              resizeMode="contain"
            />
          </View>
          <View style={styles.searchDetails}>
            <Text style={styles.phoneNumber}>
              {formatPhoneNumber(search.targetPhone)}
            </Text>
            <Text style={styles.searchDate}>
              {formatSearchDate(search.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.searchItemRight}>
          <Text style={styles.relationshipStatus}>{statusDisplay}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar
        title="Search History"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Content area */}
      <View style={styles.contentContainer}>
        {sortedSearches.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>Search History</Text>
            <Text style={styles.emptySubtitle}>
              Your search history will appear here so you can reference them
              later
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.searchList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.searchListContent}>
            <View style={styles.searchHeader}>
              <Text style={styles.searchCount}>
                {sortedSearches.length} search
                {sortedSearches.length !== 1 ? "es" : ""}
              </Text>
            </View>

            <View style={styles.searchItemsContainer}>
              {sortedSearches.map((search, index) =>
                renderSearchItem(search, index)
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },

  // Search list styles
  searchList: {
    flex: 1,
  },
  searchListContent: {
    paddingBottom: 20,
  },
  searchHeader: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
    marginBottom: 8,
  },
  searchCount: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
  },

  // Search item styles
  searchItemsContainer: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    overflow: "hidden",
  },
  searchItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  lastSearchItem: {
    borderBottomWidth: 0,
  },
  searchItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    backgroundColor: colors.background.secondary,
  },
  statusImage: {
    width: 40,
    height: 40,
  },
  searchDetails: {
    flex: 1,
  },
  phoneNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  searchDate: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  searchItemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  relationshipStatus: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.text.secondary,
    textAlign: "right",
    marginLeft: 10,
  },
});

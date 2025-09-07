import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { searchUserByPhone } from "@/api";

interface WatchlistItem {
  phone: string;
  name?: string;
  relationshipStatus: string;
  exists: boolean;
  addedDate: string;
}

export default function WatchlistScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);
  const [watchlistItems, setWatchlistItems] = useState<WatchlistItem[]>([]);
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const listRef = useRef<LegendListRef | null>(null);

  // Get watchlist data and functions from Redux
  const { watchlist, removePhoneFromWatchlist, fetchUserWatchlist, user } =
    useUserRedux();

  // Fetch watchlist data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadWatchlistData();
    }, [])
  );

  // Update watchlist items when Redux watchlist changes
  useEffect(() => {
    if (watchlist.length > 0) {
      loadWatchlistData();
    } else {
      setWatchlistItems([]);
    }
  }, [watchlist]);

  const loadWatchlistData = async () => {
    if (watchlist.length === 0) {
      setWatchlistItems([]);
      return;
    }

    setIsRefreshing(true);
    const items: WatchlistItem[] = [];

    // Load data for each phone number in the watchlist
    for (const phone of watchlist) {
      try {
        const response = await searchUserByPhone(phone);
        if (response.data.success) {
          items.push({
            phone,
            name: response.data.result.name,
            relationshipStatus:
              response.data.result.relationshipStatus || "UNKNOWN",
            exists: response.data.result.exists,
            addedDate: new Date().toISOString(), // We don't have the actual added date, so use current
          });
        } else {
          // If search fails, still show the phone number
          items.push({
            phone,
            relationshipStatus: "UNKNOWN",
            exists: false,
            addedDate: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to load data for ${phone}:`, error);
        // Add as unknown if API call fails
        items.push({
          phone,
          relationshipStatus: "UNKNOWN",
          exists: false,
          addedDate: new Date().toISOString(),
        });
      }
    }

    setWatchlistItems(items);
    setIsRefreshing(false);
  };

  const handleBackPress = () => {
    router.back();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const removeFromWatchlist = async (phoneNumber: string) => {
    // Add to loading set
    setLoadingItems((prev) => new Set(prev).add(phoneNumber));

    try {
      await removePhoneFromWatchlist(phoneNumber);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Remove from local state immediately for better UX
      setWatchlistItems((prev) =>
        prev.filter((item) => item.phone !== phoneNumber)
      );
    } catch (error) {
      console.error("Failed to remove from watchlist:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      // Remove from loading set
      setLoadingItems((prev) => {
        const newSet = new Set(prev);
        newSet.delete(phoneNumber);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "KNOWN") return colors.status.warning || "#FF9800";
    if (status === "UNKNOWN") return colors.text.tertiary;

    switch (status.toLowerCase()) {
      case "single":
        return colors.status.success || "#4CAF50";
      case "dating":
      case "engaged":
      case "married":
        return colors.status.error || "#F44336";
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "KNOWN") return "lock-closed";
    if (status === "UNKNOWN") return "help-circle";

    switch (status.toLowerCase()) {
      case "single":
        return "checkmark-circle";
      case "dating":
      case "engaged":
      case "married":
        return "heart";
      default:
        return "information-circle";
    }
  };

  const renderWatchlistItem = ({
    item,
  }: LegendListRenderItemProps<WatchlistItem>) => {
    const isRemoving = loadingItems.has(item.phone);

    return (
      <View style={styles.watchlistItem}>
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <Text style={styles.phoneText}>{item.phone}</Text>
            {item.name && <Text style={styles.nameText}>{item.name}</Text>}
          </View>
          <TouchableOpacity
            style={[
              styles.removeButton,
              isRemoving && styles.removeButtonDisabled,
            ]}
            onPress={() => removeFromWatchlist(item.phone)}
            disabled={isRemoving}
            activeOpacity={0.7}>
            {isRemoving ? (
              <ActivityIndicator size="small" color={colors.text.tertiary} />
            ) : (
              <Ionicons name="close" size={20} color={colors.text.tertiary} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.statusContainer}>
          <Ionicons
            name={getStatusIcon(item.relationshipStatus)}
            size={16}
            color={getStatusColor(item.relationshipStatus)}
          />
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(item.relationshipStatus) },
            ]}>
            {item.relationshipStatus === "UNKNOWN"
              ? "Status Unknown"
              : item.relationshipStatus === "KNOWN"
              ? "Status Available"
              : item.relationshipStatus}
          </Text>
        </View>

        {!item.exists && (
          <Text style={styles.notFoundText}>User not found on Official</Text>
        )}
      </View>
    );
  };

  const filteredItems = watchlistItems.filter(
    (item) =>
      item.phone.includes(searchQuery) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const showEmptyState = !isRefreshing && filteredItems.length === 0;
  const showWatchlistData = !isRefreshing && filteredItems.length > 0;

  return (
    <View style={styles.container}>
      <TopBar
        title="Watchlist"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Search bar at the top */}
      <View style={styles.searchHeaderContainer}>
        <View style={styles.searchInputContainer}>
          <PhoneTextInput
            label=""
            phoneNumber={searchQuery}
            onPhoneNumberChange={handleSearchChange}
            selectedCountry={selectedCountry}
            placeholder="Search watchlist..."
            autoFocus={false}
            onCountryChange={() => {}}
            containerStyle={styles.phoneInputContainer}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearSearch}
              activeOpacity={0.7}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.text.tertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Refresh button */}
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadWatchlistData}
          disabled={isRefreshing}
          activeOpacity={0.7}>
          {isRefreshing ? (
            <ActivityIndicator size="small" color={colors.text.secondary} />
          ) : (
            <Ionicons name="refresh" size={20} color={colors.text.secondary} />
          )}
          <Text style={styles.refreshButtonText}>
            {isRefreshing ? "Refreshing..." : "Refresh"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content area */}
      <View style={styles.contentContainer}>
        {isRefreshing && watchlistItems.length === 0 ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.text.secondary} />
            <Text style={styles.loadingText}>Loading watchlist...</Text>
          </View>
        ) : showEmptyState ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bookmark-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 0
                ? "No Results Found"
                : watchlist.length === 0
                ? "No Watchlist Items"
                : "Loading..."}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? `No watchlist items match "${searchQuery}"`
                : watchlist.length === 0
                ? "People you add to your watchlist will appear here"
                : "Loading your watchlist..."}
            </Text>
          </View>
        ) : showWatchlistData ? (
          <LegendList
            data={filteredItems}
            renderItem={renderWatchlistItem}
            keyExtractor={(item) => item.phone}
            recycleItems={true}
            maintainVisibleContentPosition
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Search header styles
  searchHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  searchInputContainer: {
    position: "relative",
    marginBottom: 12,
  },
  phoneInputContainer: {
    marginBottom: 0,
  },
  clearButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: [{ translateY: -10 }],
    zIndex: 1,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  refreshButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginLeft: 6,
  },

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Loading state
  loadingState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },

  // List styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },

  // Watchlist item styles
  watchlistItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
  },
  phoneText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  nameText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  removeButton: {
    padding: 4,
    borderRadius: 6,
  },
  removeButtonDisabled: {
    opacity: 0.6,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  notFoundText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: "italic",
    marginTop: 4,
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
});

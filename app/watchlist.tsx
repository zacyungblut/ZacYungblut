import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";
import { colors } from "@/constants/Colors";

const { width } = Dimensions.get("window");

interface WatchlistItem {
  id: string;
  phone: string;
  name?: string;
  relationshipStatus: string;
  addedDate: string;
}

export default function WatchlistScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);
  const listRef = useRef<LegendListRef | null>(null);

  // Mock data for now - replace with actual watchlist data from your store
  const [watchlistItems] = useState<WatchlistItem[]>([
    // Empty for now as requested
  ]);

  const handleBackPress = () => {
    router.back();
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // TODO: Implement search filtering logic here
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  const removeFromWatchlist = (itemId: string) => {
    // TODO: Implement remove from watchlist logic
    console.log("Remove from watchlist:", itemId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "single":
        return colors.status.success || "#4CAF50";
      case "dating":
      case "engaged":
      case "married":
        return colors.status.error || "#F44336";
      case "unknown":
        return colors.text.tertiary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "single":
        return "checkmark-circle";
      case "dating":
      case "engaged":
      case "married":
        return "heart";
      case "unknown":
        return "help-circle";
      default:
        return "information-circle";
    }
  };

  const renderWatchlistItem = ({
    item,
  }: LegendListRenderItemProps<WatchlistItem>) => (
    <View style={styles.watchlistItem}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.phoneText}>{item.phone}</Text>
          {item.name && <Text style={styles.nameText}>{item.name}</Text>}
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFromWatchlist(item.id)}
          activeOpacity={0.7}>
          <Ionicons name="close" size={20} color={colors.text.tertiary} />
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
          {item.relationshipStatus}
        </Text>
      </View>

      <Text style={styles.addedDateText}>
        Added {new Date(item.addedDate).toLocaleDateString()}
      </Text>
    </View>
  );

  const filteredItems = watchlistItems.filter(
    (item) =>
      item.phone.includes(searchQuery) ||
      (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      </View>

      {/* Content area */}
      <View style={styles.contentContainer}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="bookmark-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>
              {searchQuery.length > 0
                ? "No Results Found"
                : "No Watchlist Items"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery.length > 0
                ? `No watchlist items match "${searchQuery}"`
                : "People you add to your watchlist will appear here"}
            </Text>
          </View>
        ) : (
          <LegendList
            data={filteredItems}
            renderItem={renderWatchlistItem}
            keyExtractor={(item) => item.id}
            recycleItems={true}
            maintainVisibleContentPosition
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
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

  // Search header styles
  searchHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.primary,
  },
  searchInputContainer: {
    position: "relative",
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

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
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
  addedDateText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: "italic",
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

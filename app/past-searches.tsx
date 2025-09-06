import React, { useRef, useMemo } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

interface PastSearchItem {
  id: string;
  phone: string;
  relationshipStatus: string;
  searchedDate: string;
}

export default function PastSearchesScreen() {
  const listRef = useRef<LegendListRef | null>(null);
  const { unlockTransactions } = useUserRedux();

  const handleBackPress = () => {
    router.back();
  };

  // Transform unlock transactions into past search items
  const pastSearchItems = useMemo<PastSearchItem[]>(() => {
    return unlockTransactions.map((transaction) => ({
      id: transaction.id,
      phone: transaction.targetPhone,
      relationshipStatus: transaction.targetStatus,
      searchedDate: transaction.createdAt,
    }));
  }, [unlockTransactions]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "single":
        return colors.status.success || "#4CAF50";
      case "dating":
      case "engaged":
      case "married":
      case "situationship":
      case "friends_with_benefits":
      case "open_relationship":
      case "polyamorous":
        return colors.status.error || "#F44336";
      case "separated":
      case "on_a_break":
        return colors.status.warning || "#FF9800";
      case "widowed":
        return colors.text.secondary;
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
        return "heart";
      case "engaged":
        return "diamond";
      case "married":
        return "heart-circle";
      case "situationship":
      case "friends_with_benefits":
        return "people";
      case "separated":
      case "on_a_break":
        return "pause-circle";
      case "open_relationship":
      case "polyamorous":
        return "heart-half";
      case "widowed":
        return "heart-dislike";
      case "unknown":
        return "help-circle";
      default:
        return "information-circle";
    }
  };

  const formatStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "friends_with_benefits":
        return "Friends w/ Benefits";
      case "on_a_break":
        return "On a Break";
      case "open_relationship":
        return "Open Relationship";
      default:
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove the + and format based on country code
    const cleanPhone = phone.replace("+", "");

    // US/Canada format
    if (cleanPhone.startsWith("1") && cleanPhone.length === 11) {
      const areaCode = cleanPhone.slice(1, 4);
      const exchange = cleanPhone.slice(4, 7);
      const number = cleanPhone.slice(7);
      return `+1 (${areaCode}) ${exchange}-${number}`;
    }

    // For other countries, just add the + back
    return `+${cleanPhone}`;
  };

  const handleViewDetails = (itemId: string) => {
    // Could navigate to more details or show a modal
    console.log("View search details:", itemId);
  };

  const renderPastSearchItem = ({
    item,
  }: LegendListRenderItemProps<PastSearchItem>) => (
    <TouchableOpacity
      style={styles.searchItem}
      onPress={() => handleViewDetails(item.id)}
      activeOpacity={0.7}>
      <View style={styles.itemHeader}>
        <View style={styles.itemInfo}>
          <Text style={styles.phoneText}>{formatPhoneNumber(item.phone)}</Text>
        </View>
        <View style={styles.searchIconContainer}>
          <Ionicons name="search" size={20} color={colors.text.tertiary} />
        </View>
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
          {formatStatusText(item.relationshipStatus)}
        </Text>
      </View>

      <Text style={styles.searchedDateText}>
        Searched{" "}
        {new Date(item.searchedDate).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Past Searches"
        showBackButton={true}
        onBackPress={handleBackPress}
      />

      {/* Content area */}
      <View style={styles.contentContainer}>
        {pastSearchItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="search-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No Search History</Text>
            <Text style={styles.emptySubtitle}>
              Your unlocked searches will appear here so you can reference them
              later
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerInfo}>
              <Text style={styles.headerText}>
                {pastSearchItems.length} search
                {pastSearchItems.length !== 1 ? "es" : ""} unlocked
              </Text>
            </View>
            <LegendList
              data={pastSearchItems}
              renderItem={renderPastSearchItem}
              keyExtractor={(item) => item.id}
              recycleItems={true}
              maintainVisibleContentPosition
              ref={listRef}
              style={styles.list}
              contentContainerStyle={styles.listContent}
            />
          </>
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

  // Header info styles
  headerInfo: {
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  headerText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: "500",
  },

  // List styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },

  // Search item styles
  searchItem: {
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
  searchIconContainer: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: colors.background.primary,
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
  searchedDateText: {
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

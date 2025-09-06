import React from "react";
import { StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
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
  onAddToWatchlist: () => void;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({
  searchResult,
  isUnlocking,
  onUnlockStatus,
  onAddToWatchlist,
}) => {
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

  const handleWatchlistPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onAddToWatchlist();
  };

  return (
    <View style={styles.resultContainer}>
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <View style={styles.headerLeft}>
            <Ionicons
              name={getStatusIcon(searchResult.relationshipStatus)}
              size={40}
              color={getStatusColor(searchResult.relationshipStatus)}
            />
            <Text style={styles.phoneResultText}>{searchResult.phone}</Text>
          </View>

          <TouchableOpacity
            style={styles.watchlistButton}
            onPress={handleWatchlistPress}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="add" size={16} color={colors.text.secondary} />
            <Text style={styles.watchlistButtonText}>Watchlist</Text>
          </TouchableOpacity>
        </View>

        {searchResult.name && (
          <Text style={styles.nameText}>{searchResult.name}</Text>
        )}

        <View style={styles.statusContainer}>
          <Text style={styles.statusLabel}>Relationship Status</Text>

          {searchResult.relationshipStatus === "KNOWN" ? (
            <View style={styles.knownStatusContainer}>
              <View style={styles.lockedStatusIndicator}>
                <Ionicons
                  name="lock-closed"
                  size={24}
                  color={colors.status.warning || "#FF9800"}
                />
                <Text style={styles.lockedStatusText}>Status Available</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.unlockButton,
                  isUnlocking && styles.unlockButtonDisabled,
                ]}
                onPress={onUnlockStatus}
                disabled={isUnlocking}
                activeOpacity={0.8}>
                {isUnlocking ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <>
                    <Ionicons name="lock-open" size={20} color="white" />
                    <Text style={styles.unlockButtonText}>Unlock Status</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : searchResult.relationshipStatus === "UNKNOWN" ? (
            <View style={styles.unknownStatusContainer}>
              <Text style={styles.unknownStatusText}>Unknown</Text>
              <Text style={styles.unknownSubtext}>
                This person hasn't hasn't set their status yet.
              </Text>
            </View>
          ) : (
            <Text
              style={[
                styles.statusText,
                {
                  color: getStatusColor(searchResult.relationshipStatus),
                },
              ]}>
              {searchResult.relationshipStatus}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // Result styles
  resultContainer: {
    paddingTop: 32,
  },
  resultCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  phoneResultText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 12,
    flex: 1,
  },
  watchlistButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  watchlistButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.text.secondary,
    marginLeft: 4,
  },
  nameText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 16,
    textAlign: "center",
  },
  statusContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Known status styles
  knownStatusContainer: {
    alignItems: "center",
    width: "100%",
  },
  lockedStatusIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  lockedStatusText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.status.warning || "#FF9800",
    marginLeft: 8,
  },
  unlockButton: {
    backgroundColor: colors.status.success || "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minHeight: 56,
    width: "100%",
    shadowColor: colors.status.success || "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  unlockButtonDisabled: {
    opacity: 0.6,
  },
  unlockButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
    marginLeft: 8,
  },

  // Unknown status styles
  unknownStatusContainer: {
    alignItems: "center",
  },
  unknownStatusText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text.tertiary,
    marginBottom: 8,
  },
  unknownSubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    textAlign: "center",
    fontStyle: "italic",
  },
});

export default SearchResultCard;

import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import SearchBar from "@/components/SearchBar";
import { colors } from "@/constants/Colors";
import { getLeaderboard } from "@/api";

interface LeaderboardUser {
  id: string;
  name: string;
  pisserTag?: string;
  score: number;
  rank: number;
  postCount: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  isCurrentUser?: boolean;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  currentUserRank?: LeaderboardUser;
  meta: {
    totalUsers: number;
    generatedAt: string;
  };
}

export default function LeaderboardScreen() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] =
    useState<LeaderboardUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await getLeaderboard(50);
      const data: LeaderboardResponse = response.data;

      setLeaderboardData(data.leaderboard);
      setCurrentUserRank(data.currentUserRank || null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const onRefresh = () => {
    fetchLeaderboard(true);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    // Filter leaderboard data based on search query
    // You can implement this filtering logic as needed
  };

  const handleMenuPress = () => {
    // Handle menu button press - you can add your menu logic here
    console.log("Menu pressed");
  };

  // Filter leaderboard data based on search query
  const filteredLeaderboardData = leaderboardData.filter(
    (user) =>
      searchQuery === "" ||
      (user.pisserTag &&
        user.pisserTag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRankIcon = (rank: number) => {
    return (
      <View style={styles.rankNumberContainer}>
        <Text style={styles.rankNumber}>{rank}</Text>
      </View>
    );
  };

  const renderLeaderboardItem = (user: LeaderboardUser, index: number) => (
    <TouchableOpacity
      key={user.id}
      style={[
        styles.leaderboardItem,
        index === 0 && styles.firstPlace,
        index === 1 && styles.secondPlace,
        index === 2 && styles.thirdPlace,
      ]}
      activeOpacity={0.7}>
      {/* Rank */}
      <View style={styles.rankContainer}>{getRankIcon(user.rank)}</View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <View style={styles.userNameRow}>
          <Text style={styles.userName}>
            {user.pisserTag ? `@${user.pisserTag}` : user.name}
          </Text>
          {user.isCurrentUser && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>You</Text>
            </View>
          )}
        </View>
        <Text style={styles.userScore}>
          {user.score.toLocaleString()} points
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Search users..."
          onSearchChange={handleSearchChange}
          onMenuPress={handleMenuPress}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading leaderboard...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <SearchBar
          placeholder="Search users..."
          onSearchChange={handleSearchChange}
          onMenuPress={handleMenuPress}
        />
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle"
            size={48}
            color={colors.text.secondary}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchLeaderboard()}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        placeholder="Search users..."
        onSearchChange={handleSearchChange}
        onMenuPress={handleMenuPress}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Top Pissers</Text>
          <Text style={styles.headerSubtitle}>
            Based on piss engagement and activity
          </Text>
        </View>

        {/* Current User Rank (if not in top 50) */}
        {currentUserRank && !currentUserRank.isCurrentUser && (
          <View style={styles.currentUserSection}>
            <Text style={styles.currentUserSectionTitle}>Your Rank</Text>
            {renderLeaderboardItem(currentUserRank, -1)}
          </View>
        )}

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          {filteredLeaderboardData.length > 0 ? (
            filteredLeaderboardData.map((user, index) =>
              renderLeaderboardItem(user, index)
            )
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="trophy" size={48} color={colors.text.tertiary} />
              <Text style={styles.emptyText}>
                {searchQuery
                  ? "No users found"
                  : "No leaderboard data available"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try a different search term"
                  : "Start posting to see rankings!"}
              </Text>
            </View>
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  headerSection: {
    paddingVertical: 24,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  currentUserSection: {
    marginBottom: 24,
  },
  currentUserSectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.background.quaternary,
    borderRadius: 12,
  },
  firstPlace: {
    backgroundColor: colors.background.quaternary,
  },
  secondPlace: {
    backgroundColor: colors.background.quaternary,
  },
  thirdPlace: {
    backgroundColor: colors.background.quaternary,
  },
  rankContainer: {
    width: 32,
    alignItems: "flex-start",
    marginHorizontal: 8,
  },
  rankNumberContainer: {
    // Remove this container styling - not needed anymore
  },
  rankNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginRight: 8,
  },
  youBadge: {
    backgroundColor: colors.text.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  youBadgeText: {
    color: colors.background.primary,
    fontSize: 12,
    fontWeight: "600",
  },
  userScore: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  bottomSpacing: {
    height: 120, // Account for tab bar
  },
});

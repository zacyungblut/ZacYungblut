import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

const leaderboardData: LeaderboardUser[] = [
  { id: "1", name: "Emma Johnson", score: 2850, rank: 1 },
  { id: "2", name: "Michael Chen", score: 2720, rank: 2 },
  { id: "3", name: "Sarah Williams", score: 2650, rank: 3 },
  { id: "4", name: "David Rodriguez", score: 2580, rank: 4 },
  { id: "5", name: "Jessica Taylor", score: 2490, rank: 5 },
  { id: "6", name: "Alex Thompson", score: 2420, rank: 6, isCurrentUser: true },
  { id: "7", name: "Maria Garcia", score: 2380, rank: 7 },
  { id: "8", name: "James Wilson", score: 2320, rank: 8 },
  { id: "9", name: "Lisa Anderson", score: 2250, rank: 9 },
  { id: "10", name: "Ryan Martinez", score: 2180, rank: 10 },
];

export default function LeaderboardScreen() {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Ionicons name="trophy" size={24} color="#FFD700" />;
      case 2:
        return <Ionicons name="medal" size={24} color="#C0C0C0" />;
      case 3:
        return <Ionicons name="medal" size={24} color="#CD7F32" />;
      default:
        return (
          <View style={styles.rankNumberContainer}>
            <Text style={styles.rankNumber}>{rank}</Text>
          </View>
        );
    }
  };

  const renderLeaderboardItem = (user: LeaderboardUser, index: number) => (
    <TouchableOpacity
      key={user.id}
      style={[
        styles.leaderboardItem,
        user.isCurrentUser && styles.currentUserItem,
        index === 0 && styles.firstPlace,
        index === 1 && styles.secondPlace,
        index === 2 && styles.thirdPlace,
      ]}
      activeOpacity={0.7}>
      {/* Rank */}
      <View style={styles.rankContainer}>{getRankIcon(user.rank)}</View>

      {/* User Avatar */}
      <View
        style={[
          styles.avatarContainer,
          user.isCurrentUser && styles.currentUserAvatar,
        ]}>
        <Ionicons
          name="person"
          size={24}
          color={user.isCurrentUser ? colors.white : colors.text.secondary}
        />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text
          style={[
            styles.userName,
            user.isCurrentUser && styles.currentUserText,
          ]}>
          {user.name}
          {user.isCurrentUser && " (You)"}
        </Text>
        <Text
          style={[
            styles.userScore,
            user.isCurrentUser && styles.currentUserScore,
          ]}>
          {user.score.toLocaleString()} points
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={user.isCurrentUser ? colors.white : colors.text.tertiary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Leaderboard" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>Top Players</Text>
          <Text style={styles.headerSubtitle}>
            See how you rank against other players
          </Text>
        </View>

        {/* Leaderboard List */}
        <View style={styles.leaderboardContainer}>
          {leaderboardData.map((user, index) =>
            renderLeaderboardItem(user, index)
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
    paddingHorizontal: 24,
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
  leaderboardContainer: {
    gap: 8,
  },
  leaderboardItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  firstPlace: {
    borderColor: "#FFD700",
    borderWidth: 2,
  },
  secondPlace: {
    borderColor: "#C0C0C0",
    borderWidth: 2,
  },
  thirdPlace: {
    borderColor: "#CD7F32",
    borderWidth: 2,
  },
  currentUserItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryLight,
    borderWidth: 2,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    marginRight: 16,
  },
  rankNumberContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.primary,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background.quaternary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  currentUserAvatar: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.white,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  currentUserText: {
    color: colors.white,
  },
  userScore: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  currentUserScore: {
    color: colors.text.light,
  },
  bottomSpacing: {
    height: 120, // Account for tab bar
  },
});

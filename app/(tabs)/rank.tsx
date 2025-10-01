import React from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View as RNView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

interface UserRankData {
  id: string;
  name: string;
  rank:
    | "Bronze"
    | "Silver Streamer"
    | "Golden Shower"
    | "Platinum Pisser"
    | "Grand Master"
    | "One Above Piss";
  elo: number;
  streak: number;
  postQuality: number;
  totalPosts: number;
  likesReceived: number;
  commentsReceived: number;
  isCurrentUser?: boolean;
}

// Mock user data - in real app this would come from API/Redux
const currentUserData: UserRankData = {
  id: "current",
  name: "You",
  rank: "Bronze",
  elo: 1847,
  streak: 12,
  postQuality: 8.4,
  totalPosts: 156,
  likesReceived: 2341,
  commentsReceived: 567,
  isCurrentUser: true,
};

export default function RankScreen() {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case "One Above Piss":
        return "#9B59B6"; // Purple
      case "Grand Master":
        return "#FF6B6B"; // Red
      case "Platinum Pisser":
        return "#95A5A6"; // Silver/Platinum
      case "Golden Shower":
        return "#FFD700"; // Gold
      case "Silver Streamer":
        return "#C0C0C0"; // Silver
      case "Bronze":
        return "#CD7F32"; // Bronze
      default:
        return colors.text.secondary;
    }
  };

  const getRankImage = (rank: string) => {
    switch (rank) {
      case "One Above Piss":
        return require("@/assets/images/one_above_piss.png");
      case "Grand Master":
        return require("@/assets/images/grand_master.png");
      case "Platinum Pisser":
        return require("@/assets/images/platinum_pisser.png");
      case "Golden Shower":
        return require("@/assets/images/golden_shower.png");
      case "Silver Streamer":
        return require("@/assets/images/silver_streamer.png");
      case "Bronze":
        return require("@/assets/images/bronze.png");
      default:
        return require("@/assets/images/unknown.png");
    }
  };

  return (
    <View style={styles.container}>
      {/* ELO Top Bar */}
      <View style={styles.eloTopBar}>
        <View style={styles.eloLeftSection}>
          <Image
            source={getRankImage(currentUserData.rank)}
            style={styles.eloRankIcon}
            resizeMode="contain"
          />
        </View>

        <View style={styles.eloCenterSection}>
          <View style={styles.eloInfo}>
            <Text style={styles.eloNumber}>{currentUserData.elo}</Text>
            <Image
              source={require("@/assets/images/mmr_black.png")}
              style={styles.mmrIcon}
              resizeMode="contain"
            />
          </View>
          <View style={styles.eloProgressContainer}>
            <View style={styles.eloProgressBar}>
              <View
                style={[
                  styles.eloProgressFill,
                  {
                    width: `${Math.min(
                      ((currentUserData.elo % 200) / 200) * 100,
                      100
                    )}%`,
                    backgroundColor: getRankColor(currentUserData.rank),
                  },
                ]}
              />
            </View>
            <Text style={styles.eloProgressText}>
              {Math.max(
                0,
                (Math.floor(currentUserData.elo / 200) + 1) * 200 -
                  currentUserData.elo
              )}{" "}
              to next rank
            </Text>
          </View>
        </View>

        <View style={styles.eloRightSection}>
          <Text style={styles.rankName}>{currentUserData.rank}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Current Rank Header */}
        <View style={styles.rankHeader}>
          <View style={styles.rankIconContainer}>
            <Image
              source={getRankImage(currentUserData.rank)}
              style={styles.rankHeaderImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.rankTitle}>{currentUserData.rank}</Text>
        </View>

        {/* Rank Progression */}
        <View style={styles.progressionSection}>
          <Text style={styles.sectionTitle}>Rank Progression</Text>
          <View style={styles.ranksList}>
            {[
              "Bronze",
              "Silver Streamer",
              "Golden Shower",
              "Platinum Pisser",
              "Grand Master",
              "One Above Piss",
            ].map((rank, index) => {
              const isCurrentRank = rank === currentUserData.rank;
              const isPastRank =
                [
                  "Bronze",
                  "Silver Streamer",
                  "Golden Shower",
                  "Platinum Pisser",
                  "Grand Master",
                  "One Above Piss",
                ].indexOf(currentUserData.rank) > index;

              return (
                <View
                  key={rank}
                  style={[
                    styles.rankItem,
                    isCurrentRank && styles.currentRankItem,
                  ]}>
                  <Image
                    source={getRankImage(rank)}
                    style={[
                      styles.rankImage,
                      {
                        opacity: 1,
                      },
                    ]}
                    resizeMode="contain"
                  />
                  <Text
                    style={[
                      styles.rankName,
                      isCurrentRank && styles.currentRankName,
                    ]}>
                    {rank}
                  </Text>
                  <Text style={styles.rankElo}>{1000 + index * 400}+ Elo</Text>
                </View>
              );
            })}
          </View>
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
  // New ELO Top Bar Styles
  eloTopBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 65, // Increased from 50 for more breathing room
    paddingBottom: 20, // Increased from 16 for more space
    height: 130, // Increased from 110 to accommodate larger padding
    backgroundColor: colors.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  eloLeftSection: {
    flex: 0.8,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  eloRankIcon: {
    width: 28, // Slightly smaller from 32
    height: 28, // Slightly smaller from 32
  },
  eloCenterSection: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  eloInfo: {
    flexDirection: "row",
    alignItems: "center", // Changed from "baseline" to "center" for better image alignment
    marginBottom: 6,
  },
  eloNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginRight: 6, // Increased spacing for the image
  },
  mmrIcon: {
    width: 16, // Appropriate size for the MMR icon
    height: 16,
  },
  eloProgressContainer: {
    width: "100%",
    alignItems: "center",
  },
  eloProgressBar: {
    width: "100%",
    height: 5, // Reduced from 6
    backgroundColor: colors.background.quaternary,
    borderRadius: 2.5, // Adjusted to match height
    overflow: "hidden",
    marginBottom: 3, // Reduced from 4
  },
  eloProgressFill: {
    height: "100%",
    borderRadius: 2.5, // Adjusted to match height
  },
  eloProgressText: {
    fontSize: 10, // Reduced from 11
    color: colors.text.secondary,
    textAlign: "center",
  },
  eloRightSection: {
    flex: 1,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  rankHeader: {
    alignItems: "center",
    paddingVertical: 32,
  },
  rankIconContainer: {
    marginBottom: 16,
  },
  rankHeaderImage: {
    width: 150, // Increased size for the large image
    height: 150, // Increased size for the large image
  },
  rankTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: colors.text.primary, // Changed color to black
  },
  rankSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  eloSection: {
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  eloContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  eloProgress: {
    width: "100%",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statIcon: {
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  statSubtitle: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 2,
  },
  metricsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  metricItem: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  metricDescription: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  progressionSection: {
    marginBottom: 24,
  },
  ranksList: {
    gap: 12,
  },
  rankItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  currentRankItem: {
    backgroundColor: colors.background.tertiary,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  rankImage: {
    width: 24,
    height: 24,
    marginRight: 16,
  },
  rankName: {
    flex: 1,
    fontSize: 14, // Reduced from 16 for the right section rank name
    fontWeight: "500",
    color: colors.text.primary,
  },
  currentRankName: {
    fontWeight: "bold",
  },
  rankElo: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bottomSpacing: {
    height: 120, // Account for tab bar
  },
});

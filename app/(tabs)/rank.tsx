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
  rank: "Golden Shower",
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

  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "One Above Piss":
        return <Ionicons name="crown" size={32} color="#9B59B6" />;
      case "Grand Master":
        return <Ionicons name="trophy" size={32} color="#FF6B6B" />;
      case "Platinum Pisser":
        return <Ionicons name="medal" size={32} color="#95A5A6" />;
      case "Golden Shower":
        return <Ionicons name="medal" size={32} color="#FFD700" />;
      case "Silver Streamer":
        return <Ionicons name="medal" size={32} color="#C0C0C0" />;
      case "Bronze":
        return <Ionicons name="medal" size={32} color="#CD7F32" />;
      default:
        return (
          <Ionicons name="person" size={32} color={colors.text.secondary} />
        );
    }
  };

  const renderStatCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    icon?: string
  ) => (
    <View style={styles.statCard}>
      {icon && (
        <Ionicons
          name={icon as any}
          size={24}
          color={colors.primary}
          style={styles.statIcon}
        />
      )}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* <TopBar title="Your Rank" /> */}

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

        {/* ELO Section */}
        <View style={styles.eloSection}>
          <View style={styles.eloContainer}>
            <Text style={styles.eloNumber}>{currentUserData.elo}</Text>
            <Text style={styles.eloLabel}>ELO Rating</Text>
          </View>
          <View style={styles.eloProgress}>
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
              points to next rank
            </Text>
          </View>
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
    paddingTop: 40,
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
  eloNumber: {
    fontSize: 36,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  eloLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  eloProgress: {
    width: "100%",
  },
  eloProgressBar: {
    height: 8,
    backgroundColor: colors.background.quaternary,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  eloProgressFill: {
    height: "100%",
    borderRadius: 4,
  },
  eloProgressText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
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
    fontSize: 16,
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

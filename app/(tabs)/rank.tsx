import React from "react";
import { StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

interface ClanMember {
  id: string;
  name: string;
  rank: string;
  level: number;
  avatar?: string;
  isCurrentUser?: boolean;
}

const clanMembers: ClanMember[] = [
  { id: "1", name: "Emma Johnson", rank: "Leader", level: 45 },
  { id: "2", name: "Michael Chen", rank: "Co-Leader", level: 42 },
  { id: "3", name: "Sarah Williams", rank: "Elder", level: 38 },
  { id: "4", name: "David Rodriguez", rank: "Member", level: 35 },
  {
    id: "5",
    name: "Jessica Taylor",
    rank: "Member",
    level: 32,
    isCurrentUser: true,
  },
  { id: "6", name: "Alex Thompson", rank: "Member", level: 28 },
];

export default function RankScreen() {
  const getRankIcon = (rank: string) => {
    switch (rank) {
      case "Leader":
        return <Ionicons name="crown" size={24} color="#FFD700" />;
      case "Co-Leader":
        return <Ionicons name="star" size={24} color="#FF6B6B" />;
      case "Elder":
        return <Ionicons name="shield" size={24} color="#4ECDC4" />;
      default:
        return (
          <Ionicons name="person" size={24} color={colors.text.secondary} />
        );
    }
  };

  const renderClanMember = (member: ClanMember) => (
    <TouchableOpacity
      key={member.id}
      style={[
        styles.memberItem,
        member.isCurrentUser && styles.currentUserItem,
      ]}
      activeOpacity={0.7}>
      {/* Rank Icon */}
      <View style={styles.rankContainer}>{getRankIcon(member.rank)}</View>

      {/* Member Avatar */}
      <View
        style={[
          styles.avatarContainer,
          member.isCurrentUser && styles.currentUserAvatar,
        ]}>
        <Ionicons
          name="person"
          size={24}
          color={member.isCurrentUser ? colors.white : colors.text.secondary}
        />
      </View>

      {/* Member Info */}
      <View style={styles.memberInfo}>
        <Text
          style={[
            styles.memberName,
            member.isCurrentUser && styles.currentUserText,
          ]}>
          {member.name}
          {member.isCurrentUser && " (You)"}
        </Text>
        <Text
          style={[
            styles.memberRank,
            member.isCurrentUser && styles.currentUserRank,
          ]}>
          {member.rank} • Level {member.level}
        </Text>
      </View>

      {/* Arrow */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={member.isCurrentUser ? colors.white : colors.text.tertiary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <TopBar title="Clan Rank" />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Clan Header */}
        <View style={styles.clanHeader}>
          <Image
            source={require("@/assets/images/clan.png")}
            style={styles.clanImage}
            resizeMode="contain"
          />
          <Text style={styles.clanName}>Elite Squad</Text>
          <Text style={styles.clanDescription}>
            A community of top performers
          </Text>
        </View>

        {/* Clan Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Members</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1,250</Text>
            <Text style={styles.statLabel}>Total Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>#3</Text>
            <Text style={styles.statLabel}>Global Rank</Text>
          </View>
        </View>

        {/* Members List */}
        <View style={styles.membersSection}>
          <Text style={styles.sectionTitle}>Clan Members</Text>
          <View style={styles.membersContainer}>
            {clanMembers.map((member) => renderClanMember(member))}
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
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  clanHeader: {
    alignItems: "center",
    paddingVertical: 32,
  },
  clanImage: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  clanName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  clanDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 24,
    marginBottom: 24,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  membersSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
  },
  membersContainer: {
    gap: 8,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
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
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  currentUserText: {
    color: colors.white,
  },
  memberRank: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  currentUserRank: {
    color: colors.text.light,
  },
  bottomSpacing: {
    height: 120, // Account for tab bar
  },
});

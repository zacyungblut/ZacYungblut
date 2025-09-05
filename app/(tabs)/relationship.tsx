import {
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useMemo } from "react";
import { router } from "expo-router";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import InviteButton from "@/components/InviteButton";
import PendingInviteCard from "@/components/PendingInviteCard";
import ReceivedInviteCard from "@/components/ReceivedInviteCard";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RelationshipScreen() {
  const {
    user,
    relationships,
    invites,
    pendingInvites,
    cancelUserInvite,
    respondToUserInvite,
  } = useUserRedux();

  // Calculate relationship status based on actual data
  const relationshipData = useMemo(() => {
    // Check if user has any active relationships
    const activeRelationship = relationships.find((rel) => !rel.endDate);

    if (activeRelationship) {
      return {
        status: "dating" as const,
        relationship: activeRelationship,
        partner: activeRelationship.users.find((u) => u.phone !== user?.phone),
      };
    }

    // Check for pending received invites (priority over sent invites)
    const pendingReceivedInvites = pendingInvites.filter(
      (invite) => invite.status === "PENDING"
    );

    if (pendingReceivedInvites.length > 0) {
      return {
        status: "invited" as const,
        relationship: null,
        partner: null,
        receivedInvites: pendingReceivedInvites,
      };
    }

    // Check for pending sent invites
    const pendingSentInvites = invites.sent.filter(
      (invite) => invite.status === "PENDING"
    );

    return {
      status: "single" as const,
      relationship: null,
      partner: null,
      pendingInvites: pendingSentInvites,
    };
  }, [relationships, invites, pendingInvites, user?.phone]);

  // Calculate relationship duration
  const relationshipDuration = useMemo(() => {
    if (!relationshipData.relationship) return null;

    const startDate = new Date(relationshipData.relationship.startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - startDate.getTime());

    const years = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30)
    );
    const days = Math.floor(
      (diffTime % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24)
    );

    return { years, months, days };
  }, [relationshipData.relationship]);

  const handlePremiumPress = () => {
    console.log("Premium pressed");
  };

  const handleEditProfile = () => {
    router.push("/settings");
  };

  const handleMessagePartner = () => {
    console.log("Message partner pressed");
  };

  const handleViewMemories = () => {
    console.log("View memories pressed");
  };

  const handleInvite = () => {
    console.log("Invite pressed");
    router.push("/invite");
  };

  const handleSearchedYou = () => {
    router.push("/searched-you");
  };

  const handleWatchlist = () => {
    router.push("/watchlist");
  };

  const handleManage = () => {
    router.push("/manage");
  };

  const handleAlerts = () => {
    router.push("/alerts");
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await cancelUserInvite(inviteId);
      console.log("Invite cancelled successfully");
    } catch (error) {
      console.error("Failed to cancel invite:", error);
      Alert.alert("Error", "Failed to cancel invite. Please try again.");
    }
  };

  const handleAcceptInvite = async (inviteId: string) => {
    try {
      await respondToUserInvite(inviteId, "ACCEPTED");
      console.log("Invite accepted successfully");
      Alert.alert(
        "Success",
        "Relationship confirmed! You are now officially connected."
      );
    } catch (error) {
      console.error("Failed to accept invite:", error);
      Alert.alert("Error", "Failed to accept invite. Please try again.");
    }
  };

  const handleDeclineInvite = async (inviteId: string) => {
    try {
      await respondToUserInvite(inviteId, "DECLINED");
      console.log("Invite declined successfully");
    } catch (error) {
      console.error("Failed to decline invite:", error);
      Alert.alert("Error", "Failed to decline invite. Please try again.");
    }
  };

  // Invited state render (new)
  if (relationshipData.status === "invited") {
    return (
      <View style={styles.container}>
        <TopBar title="Relationship" />

        <View style={styles.content}>
          {/* Single Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.singleImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={require("@/assets/images/official.png")}
                  style={styles.singleImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.relationshipInfo}>
              <Text style={styles.statusText}>You've Been Invited!</Text>
              <Text style={styles.partnerText}>
                Someone wants to make it official
              </Text>
            </View>
          </View>

          {/* Received Invites */}
          <View style={styles.inviteContainer}>
            <View style={styles.pendingInvitesContainer}>
              <ReceivedInviteCard
                invite={relationshipData.receivedInvites![0]}
                onAccept={handleAcceptInvite}
                onDecline={handleDeclineInvite}
              />
              {relationshipData.receivedInvites!.length > 1 && (
                <Text style={styles.moreInvitesText}>
                  +{relationshipData.receivedInvites!.length - 1} more invites
                </Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleWatchlist}
              activeOpacity={0.8}>
              <Ionicons
                name="bookmark"
                size={20}
                color={colors.heroSecondary}
              />
              <Text style={styles.primaryButtonText}>Watchlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleSearchedYou}
              activeOpacity={0.8}>
              <Ionicons name="search" size={20} color={colors.heroSecondary} />
              <Text style={styles.secondaryButtonText}>Searched You</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleManage}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="construct"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Manage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleAlerts}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleEditProfile}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="settings"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Single state render
  if (relationshipData.status === "single") {
    const hasPendingInvites =
      relationshipData.pendingInvites &&
      relationshipData.pendingInvites.length > 0;

    return (
      <View style={styles.container}>
        <TopBar title="Relationship" />

        <View style={styles.content}>
          {/* Single Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.singleImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={require("@/assets/images/official.png")}
                  style={styles.singleImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.relationshipInfo}>
              <Text style={styles.statusText}>Single</Text>
              <Text style={styles.partnerText}>
                {hasPendingInvites ? "Invite pending..." : "Ready to connect"}
              </Text>
            </View>
          </View>

          {/* Invite Button or Pending Invites */}
          <View style={styles.inviteContainer}>
            {hasPendingInvites ? (
              <View style={styles.pendingInvitesContainer}>
                <PendingInviteCard
                  invite={relationshipData.pendingInvites![0]}
                  onCancel={handleCancelInvite}
                />
                {relationshipData.pendingInvites!.length > 1 && (
                  <Text style={styles.moreInvitesText}>
                    +{relationshipData.pendingInvites!.length - 1} more invites
                  </Text>
                )}
              </View>
            ) : (
              <InviteButton onPress={handleInvite} />
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.primaryButton]}
              onPress={handleWatchlist}
              activeOpacity={0.8}>
              <Ionicons
                name="bookmark"
                size={20}
                color={colors.heroSecondary}
              />
              <Text style={styles.primaryButtonText}>Watchlist</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleSearchedYou}
              activeOpacity={0.8}>
              <Ionicons name="search" size={20} color={colors.heroSecondary} />
              <Text style={styles.secondaryButtonText}>Searched You</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleManage}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="construct"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Manage</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleAlerts}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="notifications"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Alerts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleEditProfile}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="settings"
                  size={24}
                  color={colors.text.secondary}
                />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Dating state render (existing functionality with actual data)
  return (
    <View style={styles.container}>
      <TopBar title="Relationship" />

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.datingImageContainer}>
            <View style={styles.imagePlaceholder}>
              <Image
                source={require("@/assets/images/dating.png")}
                style={styles.datingImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.relationshipInfo}>
            <Text style={styles.statusText}>
              {relationshipData.relationship?.status === "DATING"
                ? "Dating"
                : relationshipData.relationship?.status === "MARRIED"
                ? "Married"
                : relationshipData.relationship?.status || "In Relationship"}
            </Text>
            <Text style={styles.partnerText}>
              {relationshipData.partner?.name ||
                relationshipData.partner?.phone ||
                "Partner"}
            </Text>
          </View>
        </View>

        {/* Stats Section with actual duration */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.years || 0}
            </Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.months || 0}
            </Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {relationshipDuration?.days || 0}
            </Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleWatchlist}
            activeOpacity={0.8}>
            <Ionicons name="bookmark" size={20} color={colors.heroSecondary} />
            <Text style={styles.primaryButtonText}>Watchlist</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleSearchedYou}
            activeOpacity={0.8}>
            <Ionicons name="search" size={20} color={colors.heroSecondary} />
            <Text style={styles.secondaryButtonText}>Searched You</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleManage}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="construct"
                size={24}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Manage</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleAlerts}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="notifications"
                size={24}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Alerts</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={handleEditProfile}
            activeOpacity={0.7}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="settings"
                size={24}
                color={colors.text.secondary}
              />
            </View>
            <Text style={styles.quickActionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: 40,
  },

  // Image placeholder styles
  imagePlaceholder: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.medium,
    alignItems: "center",
    justifyContent: "center",
  },

  // Single state styles
  singleImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  singleImage: {
    width: 120,
    height: 120,
  },
  inviteContainer: {
    marginBottom: 32,
  },

  // Pending invite styles
  pendingInvitesContainer: {
    gap: 12,
  },
  moreInvitesText: {
    textAlign: "center",
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: "italic",
    marginTop: 8,
  },

  // Dating state styles
  datingImageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  datingImage: {
    width: 140,
    height: 100,
  },
  relationshipInfo: {
    alignItems: "center",
  },
  statusText: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  partnerText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: colors.background.primary,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 32,
    alignItems: "center",
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: colors.primary,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.text.tertiary,
    marginHorizontal: 16,
    opacity: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.hero,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  quickActionItem: {
    alignItems: "center",
    flex: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: colors.border.dark,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "500",
    textAlign: "center",
  },
});

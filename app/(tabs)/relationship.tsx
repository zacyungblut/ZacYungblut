import { StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function RelationshipScreen() {
  // State to determine if user is dating or single
  const [relationshipStatus, setRelationshipStatus] = useState<
    "single" | "dating"
  >("dating");

  const { user } = useUserRedux();

  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handleEditProfile = () => {
    console.log("Edit profile pressed");
  };

  const handleMessagePartner = () => {
    console.log("Message partner pressed");
  };

  const handleViewMemories = () => {
    console.log("View memories pressed");
  };

  const handleInvite = () => {
    console.log("Invite pressed");
    // This would open invite flow
  };

  const handleSearchedYou = () => {
    console.log("Searched You pressed");
  };

  const handleWatchlist = () => {
    console.log("Watchlist pressed");
  };

  const handleManage = () => {
    console.log("Manage pressed");
  };

  const handleAlerts = () => {
    console.log("Alerts pressed");
  };

  // Single state render
  if (relationshipStatus === "single") {
    return (
      <View style={styles.container}>
        <TopBar title="Relationship" onPremiumPress={handlePremiumPress} />

        <View style={styles.content}>
          {/* Single Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.singleImageContainer}>
              <View style={styles.imagePlaceholder}>
                <Image
                  source={require("@/assets/images/icon.png")} // Placeholder - replace with hand with naked finger image
                  style={styles.singleImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.relationshipInfo}>
              <Text style={styles.singleStatusText}>Single</Text>
              <Text style={styles.singleSubText}>Ready to connect</Text>
            </View>
          </View>

          {/* Invite Button */}
          <View style={styles.inviteContainer}>
            <TouchableOpacity
              style={styles.inviteButton}
              onPress={handleInvite}
              activeOpacity={0.8}>
              <LinearGradient
                colors={[colors.primary, colors.hero]}
                style={styles.inviteButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}>
                <Ionicons
                  name="add-circle"
                  size={24}
                  color={colors.heroSecondary}
                />
                <Text style={styles.inviteButtonText}>Tap to invite</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Single Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionItem}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="share-social"
                  size={24}
                  color={colors.heroSecondary}
                />
              </View>
              <Text style={styles.quickActionText}>Share Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleEditProfile}
              activeOpacity={0.7}>
              <View style={styles.quickActionIcon}>
                <Ionicons
                  name="settings"
                  size={24}
                  color={colors.heroSecondary}
                />
              </View>
              <Text style={styles.quickActionText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Dating state render (existing functionality with dark theme)
  return (
    <View style={styles.container}>
      <TopBar title="Relationship" onPremiumPress={handlePremiumPress} />

      <View style={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.datingImageContainer}>
            <View style={styles.imagePlaceholder}>
              <Image
                source={require("@/assets/images/dating.png")} // Placeholder - replace with two rings image
                style={styles.datingImage}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.relationshipInfo}>
            <Text style={styles.statusText}>Dating</Text>
            <Text style={styles.partnerText}>{user?.phone}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Years</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Months</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>42</Text>
            <Text style={styles.statLabel}>Days</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleSearchedYou}
            activeOpacity={0.8}>
            <Ionicons name="search" size={20} color={colors.heroSecondary} />
            <Text style={styles.primaryButtonText}>Searched You</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleWatchlist}
            activeOpacity={0.8}>
            <Ionicons name="bookmark" size={20} color={colors.heroSecondary} />
            <Text style={styles.secondaryButtonText}>Watchlist</Text>
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
                color={colors.heroSecondary}
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
                color={colors.heroSecondary}
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
                color={colors.heroSecondary}
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
    backgroundColor: colors.background.secondary,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: "dashed",
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
  singleStatusText: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 8,
  },
  singleSubText: {
    fontSize: 16,
    color: colors.text.tertiary,
    fontWeight: "400",
  },
  inviteContainer: {
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  inviteButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  inviteButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    gap: 12,
  },
  inviteButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.heroSecondary,
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
    backgroundColor: colors.hero,
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
    color: colors.heroSecondary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.heroSecondary,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "white",
    marginHorizontal: 16,
    opacity: 0.5,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 12,
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
    backgroundColor: colors.hero,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickActionText: {
    fontSize: 12,
    color: colors.text.primary,
    fontWeight: "500",
    textAlign: "center",
  },
});

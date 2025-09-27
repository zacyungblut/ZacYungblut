import React from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

export default function ClanScreen() {
  const handleJoinClan = () => {
    // TODO: Implement join clan functionality
    console.log("Join clan pressed");
  };

  const handleCreateClan = () => {
    // TODO: Implement create clan functionality
    console.log("Create clan pressed");
  };

  return (
    <View style={styles.container}>
      <TopBar title="Clan" />

      <View style={styles.content}>
        {/* Empty State Icon */}
        <View style={styles.emptyStateContainer}>
          <View style={styles.iconContainer}>
            <Image
              source={require("@/assets/images/clan.png")}
              style={styles.clanImage}
              resizeMode="contain"
            />
          </View>

          {/* Empty State Text */}
          <Text style={styles.emptyStateTitle}>No Clan Yet</Text>
          <Text style={styles.emptyStateSubtitle}>
            Join an existing clan or create your own to connect with others
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.joinButton]}
            onPress={handleJoinClan}
            activeOpacity={0.8}>
            <Ionicons name="enter-outline" size={24} color={colors.white} />
            <Text style={styles.buttonText}>Tap to join a clan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.createButton]}
            onPress={handleCreateClan}
            activeOpacity={0.8}>
            <Ionicons
              name="add-circle-outline"
              size={24}
              color={colors.text.primary}
            />
            <Text style={[styles.buttonText, styles.createButtonText]}>
              Tap to create a clan
            </Text>
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
    paddingTop: 60,
    alignItems: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  clanImage: {
    width: 80,
    height: 80,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  buttonsContainer: {
    width: "100%",
    gap: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 12,
    minHeight: 56,
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  createButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 2,
    borderColor: colors.border.medium,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  createButtonText: {
    color: colors.text.primary,
  },
});

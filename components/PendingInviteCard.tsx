import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import PendingInviteMenu from "./PendingInviteMenu";

interface PendingInviteCardProps {
  invite: {
    id: string;
    relationshipType: string;
    createdAt: string;
  };
  onCancel: (inviteId: string) => void;
  onShare: (inviteId: string) => void;
}

export default function PendingInviteCard({
  invite,
  onCancel,
  onShare,
}: PendingInviteCardProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  const handleCancelPress = () => {
    Alert.alert(
      "Cancel Invite",
      `Are you sure you want to cancel this invite?`,
      [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => onCancel(invite.id),
        },
      ]
    );
  };

  const handleSharePress = () => {
    onShare(invite.id);
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  return (
    <>
      <View style={styles.pendingInviteContainer}>
        <View style={styles.pendingInviteContent}>
          <View style={styles.pendingInviteHeader}>
            <Text style={styles.pendingInviteType}>Invite Pending</Text>
            <TouchableOpacity
              onPress={handleMenuPress}
              style={styles.menuButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons
                name="ellipsis-horizontal"
                size={16}
                color={colors.text.light}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.pendingInviteFooter}>
            <Text style={styles.pendingInviteStatus}>
              Waiting for confirmation
            </Text>
            <TouchableOpacity
              onPress={handleSharePress}
              style={styles.shareButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons
                name="link"
                size={14}
                color={colors.white}
                style={styles.shareIcon}
              />
              <Text style={styles.shareButtonText}>Share link</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <PendingInviteMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCancel={handleCancelPress}
        onShare={handleSharePress}
        relationshipType={invite.relationshipType}
      />
    </>
  );
}

const styles = StyleSheet.create({
  pendingInviteContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  pendingInviteContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
  },
  pendingInviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  pendingInviteType: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.white,
    flex: 1,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
  },
  pendingInviteStatus: {
    fontSize: 14,
    color: colors.text.light,
    flex: 1,
  },
  pendingInviteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  shareIcon: {
    marginRight: 4,
  },
  shareButtonText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: "500",
  },
});

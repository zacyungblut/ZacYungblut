import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface PendingInviteCardProps {
  invite: {
    id: string;
    relationshipType: string;
    createdAt: string;
  };
  onCancel: (inviteId: string) => void;
}

export default function PendingInviteCard({
  invite,
  onCancel,
}: PendingInviteCardProps) {
  const handleCancelPress = () => {
    Alert.alert(
      "Cancel Invite",
      `Are you sure you want to cancel this ${invite.relationshipType.toLowerCase()} invite?`,
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

  return (
    <View style={styles.pendingInviteContainer}>
      <View style={styles.pendingInviteContent}>
        <View style={styles.pendingInviteHeader}>
          <Text style={styles.pendingInviteType}>
            {invite.relationshipType}
          </Text>
          <TouchableOpacity
            onPress={handleCancelPress}
            style={styles.cancelButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.pendingInviteStatus}>
          Waiting for someone to accept...
        </Text>

        <View style={styles.pendingInviteFooter}>
          <View style={styles.pendingInviteBadge}>
            <Text style={styles.pendingInviteBadgeText}>PENDING</Text>
          </View>
          <Text style={styles.pendingInviteDate}>
            {new Date(invite.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pendingInviteContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background.primary,
  },
  pendingInviteContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    minHeight: 68,
  },
  pendingInviteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  pendingInviteType: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
    flex: 1,
  },
  cancelButton: {
    padding: 4,
    marginLeft: 8,
  },
  pendingInviteStatus: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  pendingInviteFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingInviteBadge: {
    backgroundColor: colors.primary + "20",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  pendingInviteBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.primary,
    letterSpacing: 0.5,
  },
  pendingInviteDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

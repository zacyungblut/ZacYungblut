import React from "react";
import { StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface ReceivedInviteCardProps {
  invite: {
    id: string;
    senderPhone: string;
    createdAt: string;
    message?: string;
  };
  onAccept: (inviteId: string) => void;
  onDecline: (inviteId: string) => void;
}

export default function ReceivedInviteCard({
  invite,
  onAccept,
  onDecline,
}: ReceivedInviteCardProps) {
  const handleAccept = () => {
    Alert.alert(
      "Accept Invite",
      `Are you sure you want to accept the relationship invite from ${invite.senderPhone}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Accept",
          style: "default",
          onPress: () => onAccept(invite.id),
        },
      ]
    );
  };

  const handleDecline = () => {
    Alert.alert(
      "Decline Invite",
      `Are you sure you want to decline the relationship invite from ${invite.senderPhone}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Decline",
          style: "destructive",
          onPress: () => onDecline(invite.id),
        },
      ]
    );
  };

  return (
    <View style={styles.receivedInviteContainer}>
      <View style={styles.receivedInviteContent}>
        <View style={styles.receivedInviteHeader}>
          <Text style={styles.receivedInviteTitle}>Relationship Invite</Text>
          <Text style={styles.receivedInvitePhone}>{invite.senderPhone}</Text>
        </View>

        {invite.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageText}>"{invite.message}"</Text>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            onPress={handleAccept}
            style={[styles.responseButton, styles.acceptButton]}
            activeOpacity={0.8}>
            <Ionicons name="checkmark" size={18} color={colors.heroSecondary} />
            <Text style={styles.acceptButtonText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleDecline}
            style={[styles.responseButton, styles.declineButton]}
            activeOpacity={0.8}>
            <Ionicons name="close" size={18} color={colors.text.secondary} />
            <Text style={styles.declineButtonText}>Decline</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  receivedInviteContainer: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background.primary,
  },
  receivedInviteContent: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  receivedInviteHeader: {
    marginBottom: 12,
  },
  receivedInviteTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text.secondary,
    marginBottom: 4,
  },
  receivedInvitePhone: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.primary,
  },
  messageContainer: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: colors.text.primary,
    fontStyle: "italic",
  },
  receivedInviteStatus: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  responseButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: colors.primary,
  },
  declineButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.border.medium,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.heroSecondary,
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
  },
  receivedInviteFooter: {
    alignItems: "center",
  },
  receivedInviteDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
});

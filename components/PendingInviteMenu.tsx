import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Text } from "@/components/Themed";
import { colors } from "@/constants/Colors";

const { height } = Dimensions.get("window");

interface PendingInviteMenuProps {
  visible: boolean;
  onClose: () => void;
  onCancel: () => void;
  onShare: () => void;
  relationshipType: string;
}

export default function PendingInviteMenu({
  visible,
  onClose,
  onCancel,
  onShare,
  relationshipType,
}: PendingInviteMenuProps) {
  const slideAnim = useRef(new Animated.Value(height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle visibility changes with smooth animations
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: height,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleOptionPress = async (action: () => void) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    action();
    onClose();
  };

  const handleCancel = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.backdropTouch}
            onPress={onClose}
            activeOpacity={1}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invite Options</Text>
              {/* <Text style={styles.modalSubtitle}>
                Choose an action for your pending invite
              </Text> */}
            </View>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.menuOption}
                onPress={() => handleOptionPress(onShare)}>
                <View style={styles.optionIconContainer}>
                  <Ionicons name="link" size={20} color={colors.text.primary} />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.menuOptionText}>Share link again</Text>
                  <Text style={styles.menuOptionSubtext}>
                    Send the invite link to your partner
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuOption, styles.destructiveOption]}
                onPress={() => handleOptionPress(onCancel)}>
                <View
                  style={[
                    styles.optionIconContainer,
                    styles.destructiveIconContainer,
                  ]}>
                  <Ionicons name="trash-outline" size={20} color="#FF4444" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={[styles.menuOptionText, styles.destructiveText]}>
                    Cancel invite
                  </Text>
                  <Text
                    style={[
                      styles.menuOptionSubtext,
                      styles.destructiveSubtext,
                    ]}>
                    This will permanently delete the invite
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    zIndex: 1,
  },
  backdropTouch: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    maxHeight: height * 0.6,
    zIndex: 2,
    position: "relative",
  },
  modalContent: {
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 40 : 20,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: "center",
  },
  optionsContainer: {
    marginBottom: 20,
  },
  menuOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  destructiveOption: {
    backgroundColor: "#FF444410",
    borderColor: "#FF444420",
  },
  optionIconContainer: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  destructiveIconContainer: {
    // Remove background styling
  },
  optionTextContainer: {
    flex: 1,
  },
  menuOptionText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuOptionSubtext: {
    fontSize: 13,
    color: colors.text.secondary,
    opacity: 0.8,
  },
  destructiveText: {
    color: "#FF4444",
  },
  destructiveSubtext: {
    color: "#FF4444",
    opacity: 0.7,
  },
  cancelButton: {
    backgroundColor: colors.text.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});

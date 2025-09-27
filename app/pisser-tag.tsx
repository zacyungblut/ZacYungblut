import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
  View as RNView,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { useNotification } from "@/contexts/NotificationContext";
import { checkPisserTagAvailability } from "@/api";

interface PisserTagInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  isChecking?: boolean;
  isAvailable?: boolean | null;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PisserTagInput: React.FC<PisserTagInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  isChecking,
  isAvailable,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const getBorderColor = () => {
    if (error) return colors.status.error;
    if (isFocused) return colors.border.dark;
    if (isAvailable === true) return colors.status.success;
    if (isAvailable === false) return colors.status.error;
    return colors.border.medium;
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return (
        <Ionicons
          name="time-outline"
          size={20}
          color={colors.text.tertiary}
          style={styles.statusIcon}
        />
      );
    }
    if (isAvailable === true) {
      return (
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={colors.status.success}
          style={styles.statusIcon}
        />
      );
    }
    if (isAvailable === false) {
      return (
        <Ionicons
          name="close-circle"
          size={20}
          color={colors.status.error}
          style={styles.statusIcon}
        />
      );
    }
    return null;
  };

  const getStatusText = () => {
    if (isChecking && value.length >= 3) {
      return "Checking availability...";
    }
    if (isAvailable === true) {
      return "Pissername available!";
    }
    if (isAvailable === false) {
      return "Pissername not available";
    }
    return null;
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.textInputContainer, { borderColor: getBorderColor() }]}
        onPress={handleContainerPress}
        activeOpacity={1}>
        <Text style={styles.atSymbol}>@</Text>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.text.placeholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoCorrect={false}
          autoComplete="off"
          textContentType="none"
          autoCapitalize="none"
          maxLength={20}
          returnKeyType="done"
          onSubmitEditing={() => Keyboard.dismiss()}
        />
        {getStatusIcon()}
      </TouchableOpacity>

      {/* Status message */}
      {getStatusText() && (
        <Text
          style={[
            styles.statusText,
            isAvailable === true && styles.successText,
            isAvailable === false && styles.errorText,
            isChecking && styles.checkingText,
          ]}>
          {getStatusText()}
        </Text>
      )}

      {/* Error message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

export default function PisserTagScreen() {
  const { user, updateUserPisserTag, loading } = useUserRedux();
  const { addNotification } = useNotification();

  const [pisserTag, setPisserTag] = useState(user?.pisserTag || "");
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const checkTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const validatePisserTag = (tag: string): string | null => {
    if (tag.length === 0) {
      return null; // Allow empty for no validation
    }
    if (tag.length < 3) {
      return "Pissername must be at least 3 characters";
    }
    if (tag.length > 20) {
      return "Pissername must be less than 20 characters";
    }
    // Updated to allow letters, numbers, underscores, dashes, and dots (like Instagram)
    if (!/^[a-zA-Z0-9_.-]+$/.test(tag)) {
      return "Pissername can only contain letters, numbers, underscores, dashes, and dots";
    }
    return null;
  };

  const checkAvailability = async (tag: string) => {
    if (tag.length < 3) {
      setIsAvailable(null);
      return;
    }

    // If it's the user's current tag, mark as available
    if (tag === user?.pisserTag) {
      setIsAvailable(true);
      return;
    }

    setIsChecking(true);
    setIsAvailable(null);

    try {
      const response = await checkPisserTagAvailability(tag);
      setIsAvailable(response.data.available);
    } catch (error) {
      console.error("Error checking availability:", error);
      // If backend is down or there's an error, assume available for now
      setIsAvailable(true);
    } finally {
      setIsChecking(false);
    }
  };

  const handlePisserTagChange = (text: string) => {
    // Clean the input - remove @ symbol if user types it
    const cleanText = text.replace(/@/g, "");
    setPisserTag(cleanText);

    // Clear previous states
    setError("");
    setIsAvailable(null);

    // Validate the input
    const validationError = validatePisserTag(cleanText);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Clear any existing timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Start a new timeout for availability check
    if (cleanText.length >= 3) {
      checkTimeoutRef.current = setTimeout(() => {
        checkAvailability(cleanText);
      }, 2000);
    }
  };

  const handleSave = async () => {
    if (error) {
      Alert.alert("Invalid Pissername", error);
      return;
    }

    if (
      pisserTag.length > 0 &&
      isAvailable !== true &&
      pisserTag !== user?.pisserTag
    ) {
      Alert.alert(
        "Pissername Not Available",
        "Please choose a different pissername."
      );
      return;
    }

    try {
      await updateUserPisserTag(pisserTag);

      addNotification({
        title: "Pissername Updated",
        description: pisserTag
          ? `Your pissername has been set to @${pisserTag}`
          : "Your pissername has been removed",
        type: "success",
        duration: 3000,
        emoji: "✅",
      });

      router.back();
    } catch (error: any) {
      console.error("Error updating pissername:", error);
      Alert.alert(
        "Update Failed",
        error.message || "Failed to update pissername. Please try again."
      );
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  const canSave =
    !loading &&
    !isChecking &&
    !error &&
    (pisserTag === "" || isAvailable === true || pisserTag === user?.pisserTag);

  const hasChanges = pisserTag !== (user?.pisserTag || "");

  return (
    <View style={styles.container}>
      <TopBar title="" showBackButton={true} onBackPress={handleBackPress} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Choose Your Pissername</Text>
          <Text style={styles.headerDescription}>
            Your pissername will be displayed when others search for you. You
            can change it anytime.
          </Text>
        </View>

        <PisserTagInput
          label="Pissername"
          value={pisserTag}
          onChangeText={handlePisserTagChange}
          placeholder="piss.daddy_69"
          error={error}
          isChecking={isChecking}
          isAvailable={isAvailable}
        />

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>Pissername Rules:</Text>
          <Text style={styles.ruleText}>• 3-16 characters long</Text>
          <Text style={styles.ruleText}>
            • Letters, numbers, underscores, dashes, and dots only
          </Text>
          <Text style={styles.ruleText}>• Must be unique</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.saveButton,
            (!canSave || !hasChanges) && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!canSave || !hasChanges}
          activeOpacity={0.7}>
          <Text
            style={[
              styles.saveButtonText,
              (!canSave || !hasChanges) && styles.saveButtonTextDisabled,
            ]}>
            {loading ? "Saving..." : "Save Pissername"}
          </Text>
        </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 8,
  },
  headerDescription: {
    fontSize: 16,
    color: colors.text.secondary,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  textInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 16,
  },
  atSymbol: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginRight: 4,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
    paddingVertical: 14,
  },
  statusIcon: {
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "500",
  },
  successText: {
    color: colors.status.success,
  },
  errorText: {
    color: colors.status.error,
  },
  checkingText: {
    color: colors.text.tertiary,
  },
  rulesContainer: {
    marginBottom: 32,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
    lineHeight: 20,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
  },
  saveButtonDisabled: {
    backgroundColor: colors.text.tertiary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  saveButtonTextDisabled: {
    color: colors.text.placeholder,
  },
});

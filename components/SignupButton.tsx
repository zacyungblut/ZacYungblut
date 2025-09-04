import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from "react-native";
import { colors } from "@/constants/Colors";

interface SignupButtonProps {
  title: string;
  onPress: () => void;
  isLoading?: boolean;
  isEnabled?: boolean;
  containerStyle?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SignupButton({
  title,
  onPress,
  isLoading = false,
  isEnabled = true,
  containerStyle,
  textStyle,
}: SignupButtonProps) {
  const handlePress = () => {
    if (!isLoading && isEnabled) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        !isEnabled && styles.buttonDisabled,
        containerStyle,
      ]}
      onPress={handlePress}
      disabled={!isEnabled || isLoading}
      activeOpacity={0.8}>
      {isLoading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <Text
          style={[
            styles.buttonText,
            !isEnabled && styles.buttonTextDisabled,
            textStyle,
          ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.signup,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: colors.border.medium,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  buttonTextDisabled: {
    color: colors.text.quaternary,
  },
});

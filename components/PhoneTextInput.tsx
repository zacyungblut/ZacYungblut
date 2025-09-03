import React, { useState, useEffect, useRef } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/Colors";
import { CountryCode } from "@/constants/countryCodes";

interface PhoneTextInputProps {
  label: string;
  phoneNumber: string;
  onPhoneNumberChange: (text: string) => void;
  selectedCountry: CountryCode;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
  autoFocus?: boolean;
}

const PhoneTextInput: React.FC<PhoneTextInputProps> = ({
  label,
  phoneNumber,
  onPhoneNumberChange,
  selectedCountry,
  placeholder,
  containerStyle,
  inputStyle,
  labelStyle,
  error,
  autoFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hiddenInputRef = useRef<TextInput>(null);

  // Handle delayed auto focus on phone number input
  useEffect(() => {
    if (autoFocus === true) {
      const timer = setTimeout(() => {
        hiddenInputRef.current?.focus();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [autoFocus]);

  const handleFocus = () => {
    setIsFocused(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleContainerPress = () => {
    hiddenInputRef.current?.focus();
  };

  const getBorderColor = () => {
    if (error != null && error.length > 0) return colors.status.error;
    if (isFocused) return colors.border.dark;
    return colors.border.medium;
  };

  // Format phone number for display
  const formatPhoneNumber = (value: string, countryCode: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/[^0-9]/g, "");

    // Format based on country (defaulting to US format)
    if (countryCode === "+1") {
      // US/Canada format: (XXX) XXX-XXXX
      if (numbers.length >= 6) {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
          6,
          10
        )}`;
      } else if (numbers.length >= 3) {
        return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
      } else if (numbers.length > 0) {
        return `(${numbers}`;
      }
    } else {
      // Generic format for other countries: XXX XXX XXXX
      if (numbers.length >= 6) {
        return `${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(
          6
        )}`;
      } else if (numbers.length >= 3) {
        return `${numbers.slice(0, 3)} ${numbers.slice(3)}`;
      }
    }

    return numbers;
  };

  const handlePhoneNumberChange = (text: string) => {
    // Extract only numbers from the input
    const numbersOnly = text.replace(/[^0-9]/g, "");

    // Calculate expected length based on country
    const expectedLength = selectedCountry.numberLength ?? 10;

    // Limit to expected length
    const limitedValue = numbersOnly.slice(0, expectedLength);

    // Update the parent with raw numeric value
    onPhoneNumberChange(limitedValue);
  };

  // Get formatted display value
  const displayValue = formatPhoneNumber(phoneNumber, selectedCountry.dialCode);

  // Show placeholder when empty
  const showPlaceholder = phoneNumber.length === 0;

  return (
    <TouchableWithoutFeedback onPress={handleContainerPress}>
      <View style={[styles.container, containerStyle]}>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
        <View
          style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
          {/* Country Code Display */}
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCodeText}>
              {selectedCountry.dialCode}
            </Text>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Phone Number Display */}
          <View style={styles.phoneNumberContainer}>
            {showPlaceholder ? (
              <Text style={[styles.phoneNumberText, styles.placeholderText]}>
                {placeholder ?? "Phone number"}
              </Text>
            ) : (
              <Text style={[styles.phoneNumberText, inputStyle]}>
                {displayValue}
              </Text>
            )}
          </View>

          {/* Hidden TextInput for actual input handling */}
          <TextInput
            ref={hiddenInputRef}
            style={styles.hiddenInput}
            value={phoneNumber}
            onChangeText={handlePhoneNumberChange}
            keyboardType="number-pad"
            onFocus={handleFocus}
            onBlur={handleBlur}
            blurOnSubmit={false}
            autoCorrect={false}
            autoComplete="off"
            textContentType="none"
          />
        </View>
        {error != null && error.length > 0 && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 16,
    position: "relative",
  },
  countryCodeContainer: {
    paddingRight: 8,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
  },
  separator: {
    width: 1,
    height: 20,
    backgroundColor: colors.border.medium,
    marginHorizontal: 8,
  },
  phoneNumberContainer: {
    flex: 1,
    paddingVertical: 14,
    paddingLeft: 4,
    justifyContent: "center",
  },
  phoneNumberText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.placeholder,
  },
  hiddenInput: {
    position: "absolute",
    left: -9999,
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: 4,
  },
});

export default PhoneTextInput;

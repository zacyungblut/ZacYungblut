import React, { useState, useEffect, useRef } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableWithoutFeedback,
  TouchableOpacity,
  View,
  ViewStyle,
  Modal,
  FlatList,
  SafeAreaView,
} from "react-native";
import * as Haptics from "expo-haptics";
import { colors } from "@/constants/Colors";
import { CountryCode, COUNTRY_CODES } from "@/constants/countryCodes";

interface PhoneTextInputProps {
  label: string;
  phoneNumber: string;
  onPhoneNumberChange: (text: string) => void;
  selectedCountry: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  placeholder?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
  error?: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

const PhoneTextInput: React.FC<PhoneTextInputProps> = ({
  label,
  phoneNumber,
  onPhoneNumberChange,
  selectedCountry,
  onCountryChange,
  placeholder,
  containerStyle,
  inputStyle,
  labelStyle,
  error,
  autoFocus,
  onFocus,
  onBlur,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showCountryModal, setShowCountryModal] = useState(false);
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
    onFocus?.();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleContainerPress = () => {
    hiddenInputRef.current?.focus();
  };

  const handleCountryPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowCountryModal(true);
  };

  const handleCountrySelect = (country: CountryCode) => {
    onCountryChange(country);
    setShowCountryModal(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const handleClearPress = () => {
    onPhoneNumberChange("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Get formatted display value
  const displayValue = formatPhoneNumber(phoneNumber, selectedCountry.dialCode);

  // Show placeholder when empty
  const showPlaceholder = phoneNumber.length === 0;

  // Show clear button when there's content
  const showClearButton = phoneNumber.length > 0;

  return (
    <>
      <TouchableWithoutFeedback onPress={handleContainerPress}>
        <View style={[styles.container, containerStyle]}>
          <Text style={[styles.label, labelStyle]}>{label}</Text>
          <View
            style={[styles.inputContainer, { borderColor: getBorderColor() }]}>
            {/* Country Code Display - Now Touchable */}
            <TouchableOpacity
              style={styles.countryCodeContainer}
              onPress={handleCountryPress}
              activeOpacity={0.7}>
              <Text style={styles.flagText}>{selectedCountry.flag}</Text>
              <Text style={styles.countryCodeText}>
                {selectedCountry.dialCode}
              </Text>
              <Text style={styles.chevronText}>▼</Text>
            </TouchableOpacity>

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

            {/* Clear Button */}
            {showClearButton && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={handleClearPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}

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
              caretHidden={false}
            />
          </View>
          {error != null && error.length > 0 && (
            <Text style={styles.errorText}>{error}</Text>
          )}
        </View>
      </TouchableWithoutFeedback>

      {/* Country Selector Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCountryModal(false)}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCountryModal(false)}
              style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Country</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <FlatList
            data={COUNTRY_CODES}
            keyExtractor={(item) => item.code}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  item.code === selectedCountry.code &&
                    styles.selectedCountryItem,
                ]}
                onPress={() => handleCountrySelect(item)}>
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text style={styles.countryName}>{item.name}</Text>
                <Text style={styles.countryDialCode}>{item.dialCode}</Text>
              </TouchableOpacity>
            )}
            style={styles.countryList}
          />
        </SafeAreaView>
      </Modal>
    </>
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
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
    paddingVertical: 14,
  },
  flagText: {
    fontSize: 18,
    marginRight: 6,
  },
  countryCodeText: {
    fontSize: 16,
    fontWeight: "400",
    color: colors.text.primary,
    marginRight: 4,
  },
  chevronText: {
    fontSize: 10,
    color: colors.text.tertiary,
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
  clearButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text.tertiary,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.background.primary,
    lineHeight: 10,
  },
  hiddenInput: {
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    color: "transparent",
  },
  errorText: {
    fontSize: 12,
    color: colors.status.error,
    marginTop: 4,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalCloseButton: {
    minWidth: 60,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    textAlign: "center",
  },
  modalHeaderSpacer: {
    minWidth: 60,
  },
  countryList: {
    flex: 1,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  selectedCountryItem: {
    backgroundColor: colors.background.secondary,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  countryName: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  countryDialCode: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
});

export default PhoneTextInput;

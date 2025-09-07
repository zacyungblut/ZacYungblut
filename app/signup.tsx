import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import { colors } from "@/constants/Colors";
import {
  CountryCode,
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
} from "@/constants/countryCodes";
import PhoneTextInput from "@/components/PhoneTextInput";
import { usePostHog } from "posthog-react-native";
import { signup } from "@/api";

const { height } = Dimensions.get("window");

export default function SignupScreen() {
  const router = useRouter();

  const posthog = usePostHog();

  // Phone number state - store as raw numeric string
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(DEFAULT_COUNTRY);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handlePhoneNumberChange = (value: string) => {
    // Value is already numeric from PhoneTextInput
    setPhoneNumber(value);
  };

  const handleCountryChange = (country: CountryCode) => {
    setSelectedCountry(country);
    // Clear phone number when country changes since format/length may differ
    setPhoneNumber("");
  };

  const isValidNumber = (number: string) => {
    const expectedLength = selectedCountry.numberLength ?? 10;
    return number.length === expectedLength;
  };

  const handleContinue = async () => {
    if (isValidNumber(phoneNumber)) {
      setIsLoading(true);
      const fullNumberWithCountryCode = `${selectedCountry.dialCode}${phoneNumber}`;

      try {
        console.log("Phone number to signup:", fullNumberWithCountryCode);

        // Call signup API
        await signup(fullNumberWithCountryCode);
        posthog.capture("signup", {
          phone: fullNumberWithCountryCode,
        });

        // Navigate to verification screen with phone number
        router.push({
          pathname: "/verification",
          params: { phone: fullNumberWithCountryCode },
        });
      } catch (error: any) {
        console.error("Signup error:", error);
        Alert.alert(
          "Error",
          error.response?.data?.error ||
            "Failed to send verification code. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create Account</Text>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.subtitle}>Enter your phone number</Text>

          {/* Phone Number Input */}
          <PhoneTextInput
            label="Phone Number"
            phoneNumber={phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            onCountryChange={handleCountryChange}
            selectedCountry={selectedCountry}
            placeholder="Phone number"
            autoFocus={true}
            containerStyle={styles.phoneInputContainer}
          />

          <Text style={styles.helperText}>
            We'll send an SMS verification code.
          </Text>
        </View>
      </View>

      {/* Continue Button in KeyboardStickyView */}
      <KeyboardStickyView offset={{ closed: -32, opened: 16 }}>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!isValidNumber(phoneNumber) || isLoading) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValidNumber(phoneNumber) || isLoading}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.continueButtonText,
              (!isValidNumber(phoneNumber) || isLoading) &&
                styles.continueButtonTextDisabled,
            ]}>
            {isLoading ? "Sending..." : "Continue"}
          </Text>
        </TouchableOpacity>
      </KeyboardStickyView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 20,
    zIndex: 1,
  },
  backText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    flex: 1,
    textAlign: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    // Remove justifyContent: "space-between" since button is now in KeyboardStickyView
  },
  formContainer: {
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text.primary,
    marginBottom: 32,
  },
  phoneInputContainer: {
    marginBottom: 12,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 8,
  },
  continueButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 20, // Add horizontal margin since it's now outside content container
  },
  continueButtonDisabled: {
    backgroundColor: colors.border.medium,
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
  continueButtonTextDisabled: {
    color: colors.text.quaternary,
  },
});

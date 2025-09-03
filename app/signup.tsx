import { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { colors } from "@/constants/Colors";
import {
  CountryCode,
  COUNTRY_CODES,
  DEFAULT_COUNTRY,
} from "@/constants/countryCodes";
import PhoneTextInput from "@/components/PhoneTextInput";

const { height } = Dimensions.get("window");

export default function SignupScreen() {
  const router = useRouter();

  // Phone number state - store as raw numeric string
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] =
    useState<CountryCode>(DEFAULT_COUNTRY);

  const handleBack = () => {
    router.back();
  };

  const handlePhoneNumberChange = (value: string) => {
    // Value is already numeric from PhoneTextInput
    setPhoneNumber(value);
  };

  const isValidNumber = (number: string) => {
    const expectedLength = selectedCountry.numberLength ?? 10;
    return number.length === expectedLength;
  };

  const handleContinue = () => {
    if (isValidNumber(phoneNumber)) {
      const fullNumberWithCountryCode = `${selectedCountry.dialCode}${phoneNumber}`;
      console.log("Phone number to signup:", fullNumberWithCountryCode);
      // TODO: Add actual signup logic here
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
            selectedCountry={selectedCountry}
            placeholder="Phone number"
            autoFocus={true}
            containerStyle={styles.phoneInputContainer}
          />

          <Text style={styles.helperText}>
            We'll send an SMS verification code.
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValidNumber(phoneNumber) && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValidNumber(phoneNumber)}
          activeOpacity={0.8}>
          <Text
            style={[
              styles.continueButtonText,
              !isValidNumber(phoneNumber) && styles.continueButtonTextDisabled,
            ]}>
            Continue
          </Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: "space-between",
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
    backgroundColor: colors.signup,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 32,
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

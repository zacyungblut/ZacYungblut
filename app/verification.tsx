import React, { useRef, useState, useMemo, useCallback } from "react";
import {
  Alert,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  StyleSheet,
} from "react-native";

import { useLocalSearchParams, useRouter } from "expo-router";

import { verifyCode, resendVerification } from "@/api";
import SignupButton from "@/components/SignupButton";
import { colors } from "@/constants/Colors";
import { Dimensions } from "react-native";
import { AuthService } from "@/utils/authStorage";

// Extract all styles to constants
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface.white,
    height: "100%",
    minHeight: Dimensions.get("window").height,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border.medium,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: colors.surface.white,
    height: "100%",
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: "center",
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: 40,
    textAlign: "center",
  },
  phoneText: {
    fontWeight: "600",
    color: colors.text.primary,
  },
  codeInputContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 32,
    gap: 16,
  },
  hiddenInput: {
    position: "absolute",
    opacity: 0,
    height: 0,
    width: 0,
  },
  resendContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  resendText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  countdownText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
  errorMessage: {
    color: colors.status.error,
    fontSize: 14,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 0,
    fontWeight: "500",
    paddingHorizontal: 20,
  },
  keyboardStickyContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.surface.white,
  },
  submitButtonContainer: {
    marginBottom: 0,
  },
});

const codeInputStyles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderRadius: 12,
    width: 72,
    height: 72,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  text: {
    fontSize: 24,
    fontWeight: "600",
  },
});

// Memoized code input component to prevent recreation
const CodeInput = React.memo<{
  digit: string;
  hasError: boolean;
  isFocused: boolean;
}>(({ digit, hasError, isFocused }) => (
  <View
    style={[
      codeInputStyles.container,
      {
        borderColor: hasError
          ? colors.status.error
          : isFocused
          ? colors.border.dark
          : colors.border.medium,
      },
    ]}>
    <Text
      style={[
        codeInputStyles.text,
        {
          color: hasError ? colors.status.error : colors.text.primary,
        },
      ]}>
      {digit}
    </Text>
  </View>
));

function Verification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const phone =
    typeof params["phone"] === "string" ? params["phone"] : undefined;
  const [verificationCode, setVerificationCode] = useState("");
  const inputRef = useRef<TextInput>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Add these new state variables
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(30);
  const [isResending, setIsResending] = useState(false);

  // Memoize the handlers to prevent recreation
  const handleSubmit = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    if (!phone || phone.trim() === "") {
      setErrorMessage("No phone number provided");
      setIsLoading(false);
      return;
    }

    try {
      const response = await verifyCode(phone, verificationCode);

      // Save the token
      if (response.data.token) {
        AuthService.setAuthToken(response.data.token);
      }

      // Navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Invalid verification code";
      setErrorMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [phone, verificationCode, router]);

  const handleCodeChange = useCallback(
    (value: string) => {
      const numericValue = value.replace(/[^0-9]/g, "").slice(0, 4);

      // If code goes from empty to complete (likely auto-fill), submit automatically
      if (verificationCode.length === 0 && numericValue.length === 4) {
        setVerificationCode(numericValue);
        // Use setTimeout to ensure state is updated before submission
        setTimeout(() => {
          handleSubmit();
        }, 100);
      } else {
        setVerificationCode(numericValue);
      }
    },
    [verificationCode.length, handleSubmit]
  );

  const handleResendCode = useCallback(async () => {
    if (!canResend || isResending) return;

    if (!phone || phone.trim() === "") {
      throw new Error("No phone number provided");
    }

    setIsResending(true);
    try {
      await resendVerification(phone, "phone");

      // Start countdown
      setCanResend(false);
      setCountdown(30);

      // Set up countdown timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error: any) {
      console.error("Error resending code:", error);
      Alert.alert("Error", "Failed to resend verification code");
    } finally {
      setIsResending(false);
    }
  }, [canResend, isResending, phone]);

  const handleInputFocus = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  const setInputFocusedTrue = useCallback(() => {
    setIsInputFocused(true);
  }, []);

  const setInputFocusedFalse = useCallback(() => {
    setIsInputFocused(false);
  }, []);

  // Memoize code inputs with minimal dependencies
  const codeInputs = useMemo(() => {
    const codeArray = verificationCode
      .split("")
      .concat(Array(4 - verificationCode.length).fill(""));

    return codeArray.map((digit, index) => (
      <CodeInput
        key={index}
        digit={digit}
        hasError={errorMessage !== null}
        isFocused={isInputFocused && index === verificationCode.length}
      />
    ));
  }, [verificationCode, errorMessage, isInputFocused]);

  const isValidCode = verificationCode.length === 4;

  return (
    <View style={styles.container}>
      {/* Modal handle */}
      <View style={styles.modalHandle} />

      <SafeAreaView style={styles.contentContainer}>
        <TouchableWithoutFeedback>
          <View style={styles.mainContent}>
            <View style={styles.formContainer}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>Confirm your number</Text>
                <Text style={styles.subtitle}>
                  Enter the code sent to{" "}
                  <Text style={styles.phoneText}>{phone}</Text>
                </Text>
              </View>

              <TouchableOpacity onPress={handleInputFocus} activeOpacity={1}>
                <View style={styles.codeInputContainer}>{codeInputs}</View>
              </TouchableOpacity>

              {/* Hidden TextInput that captures the actual input */}
              <TextInput
                ref={inputRef}
                value={verificationCode}
                onChangeText={handleCodeChange}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus={true}
                onFocus={setInputFocusedTrue}
                onBlur={setInputFocusedFalse}
              />

              <View style={styles.resendContainer}>
                {canResend ? (
                  <TouchableOpacity
                    onPress={handleResendCode}
                    disabled={isResending}>
                    <Text style={styles.resendText}>
                      {isResending ? "Sending..." : "Re-send code"}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.countdownText}>
                    Re-send code in {countdown}s
                  </Text>
                )}
              </View>

              {errorMessage !== null && (
                <Text style={styles.errorMessage}>{errorMessage}</Text>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>

        <View style={styles.keyboardStickyContainer}>
          <SignupButton
            title="Submit"
            onPress={handleSubmit}
            isLoading={isLoading}
            isEnabled={isValidCode}
            containerStyle={styles.submitButtonContainer}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

// Memoize the entire component with no dependencies since we handle all state internally
export default React.memo(Verification);

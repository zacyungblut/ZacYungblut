import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { router } from "expo-router";
import { Provider } from "react-redux";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { useColorScheme } from "@/components/useColorScheme";
import { AuthService } from "@/utils/authStorage";
import { getCurrentUser } from "@/api";
import { AxiosError } from "axios";
import { store } from "@/store";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { PostHogProvider } from "posthog-react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Inner component that uses Redux
function AppContent() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [authCheckComplete, setAuthCheckComplete] = useState(false);

  // Use Redux for user state management
  const {
    user,
    saveUser,
    logoutUser,
    unlockTransactions,
    reviewRequests,
    saveUserReviewRequest,
  } = useUserRedux();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Function to fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      saveUser(response.data.user);
      return response.data.user;
    } catch (error) {
      console.error("Error fetching current user:", error);
      // If fetching user fails due to invalid token, clear auth
      if (
        error instanceof AxiosError &&
        (error.response?.status === 401 || error.response?.status === 403)
      ) {
        AuthService.removeAuthToken();
        logoutUser();
      }
      return null;
    }
  };

  // Function to handle review request logic - now with safe loading
  const handleReviewRequest = async () => {
    try {
      // Dynamically import ReviewService to avoid native module loading issues
      const { ReviewService } = await import("@/utils/reviewService");

      // Check if we should request a review
      if (
        !ReviewService.shouldRequestReview(unlockTransactions, reviewRequests)
      ) {
        return;
      }

      // Log metrics for debugging
      ReviewService.logReviewMetrics(unlockTransactions, reviewRequests);

      // Small delay to ensure the app has fully loaded
      setTimeout(async () => {
        console.log("Attempting to request review...");

        try {
          const reviewMetadata = await ReviewService.requestReview();

          // Save the review request to the backend
          try {
            await saveUserReviewRequest({
              platform: reviewMetadata.platform,
              appVersion: reviewMetadata.appVersion,
              buildVersion: reviewMetadata.buildVersion,
              unlockCount: unlockTransactions.length,
              wasDisplayed: reviewMetadata.wasDisplayed,
              userInteracted: false, // Will be updated later if user interacts
              deviceModel: reviewMetadata.deviceModel,
              osVersion: reviewMetadata.osVersion,
            });

            if (reviewMetadata.wasDisplayed) {
              console.log(
                "Review dialog was displayed to user and saved to backend"
              );
            } else {
              console.log(
                "Review request logged to backend (dialog not displayed)"
              );
            }
          } catch (saveError) {
            console.error(
              "Failed to save review request to backend:",
              saveError
            );
            // Still log success if the review was shown, even if save failed
            if (reviewMetadata.wasDisplayed) {
              console.log(
                "Review dialog was displayed but failed to save to backend"
              );
            }
          }
        } catch (reviewError) {
          console.log(
            "Review request failed (likely platform not supported):",
            reviewError
          );
        }
      }, 2000); // 2 second delay after app loads
    } catch (error) {
      console.error("Error in review request process:", error);
    }
  };

  // Check authentication and fetch user when fonts are loaded
  useEffect(() => {
    const checkAuthAndFetchUser = async () => {
      if (loaded) {
        const token = AuthService.getAuthToken();

        if (token) {
          // Token exists, try to fetch user
          const userData = await fetchCurrentUser();
        } else {
          logoutUser(); // Clear any existing user state
        }

        setAuthCheckComplete(true);
        SplashScreen.hideAsync();
      }
    };

    checkAuthAndFetchUser();
  }, [loaded]);

  // Navigate based on authentication status once check is complete
  useEffect(() => {
    if (authCheckComplete) {
      const token = AuthService.getAuthToken();

      if (token && user) {
        // Has valid token and user data
        router.replace("/(tabs)");

        // Check if we should request a review after successful login
        if (user.unlockTransactions && user.reviewRequests) {
          handleReviewRequest();
        }
      } else {
        // No token or no user data
        router.replace("/auth");
      }
    }
  }, [authCheckComplete]);

  if (!loaded || !authCheckComplete) {
    return null;
  }

  return <RootLayoutNav />;
}

// Default export for the main layout
export default function RootLayout() {
  return (
    <Provider store={store}>
      <KeyboardProvider>
        <PostHogProvider
          apiKey="phc_PslcpS6T5uuhlbXlk8N40CX8a9baZ9ZTr6mmjkJB0Wd"
          options={{
            host: "https://us.i.posthog.com",
            enableSessionReplay: true,
            sessionReplayConfig: {
              maskAllTextInputs: false,
              maskAllImages: true,
              maskAllSandboxedViews: false,
              captureLog: true,
              captureNetworkTelemetry: true,
              androidDebouncerDelayMs: 1000,
              iOSdebouncerDelayMs: 1000,
            },
          }}>
          <NotificationProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </NotificationProvider>
        </PostHogProvider>
      </KeyboardProvider>
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen
          name="verification"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="invite"
          options={{ headerShown: false, presentation: "modal" }}
        />
        <Stack.Screen
          name="date-modal"
          options={{
            headerShown: false,
            presentation: "formSheet",
            sheetAllowedDetents: [0.5],
            sheetGrabberVisible: true,
          }}
        />
        <Stack.Screen name="watchlist" options={{ headerShown: false }} />
        <Stack.Screen name="past-searches" options={{ headerShown: false }} />
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: "none",
            gestureEnabled: false,
          }}
        />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="alerts" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-alert"
          options={{ headerShown: false, presentation: "formSheet" }}
        />
        <Stack.Screen name="manage" options={{ headerShown: false }} />
        <Stack.Screen name="premium" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

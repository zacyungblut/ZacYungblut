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
import Purchases, { LOG_LEVEL } from "react-native-purchases";
import { Platform } from "react-native";
import * as Updates from "expo-updates";
import * as Linking from "expo-linking";

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

const APIKeys = {
  apple: "appl_amcQHdadsBIISeMxUtFqoqkLVuD",
  google: "replace_me",
};

// Initialize Purchases
const initializePurchases = async () => {
  try {
    if (Platform.OS === "ios") {
      // Replace with your actual Apple App Store API key
      await Purchases.configure({
        apiKey: APIKeys.apple,
      });
    } else if (Platform.OS === "android") {
      // Replace with your actual Google Play Store API key
      await Purchases.configure({
        apiKey: APIKeys.google,
      });
    }

    // Enable debug logs (disable in production)
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    console.log("Purchases configured successfully");
  } catch (error) {
    console.error("Error configuring Purchases:", error);
  }
};

// Check for updates when app starts
const checkForUpdates = async () => {
  if (__DEV__) {
    console.log("Skipping update check in development");
    return;
  }

  try {
    const update = await Updates.checkForUpdateAsync();

    if (update.isAvailable) {
      console.log("Update available, downloading...");
      await Updates.fetchUpdateAsync();
      console.log("Update downloaded, restarting app...");
      await Updates.reloadAsync();
    } else {
      console.log("No updates available");
    }
  } catch (error) {
    console.error("Error checking for updates:", error);
  }
};

// Inner component that uses Redux
function AppContent() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [authCheckComplete, setAuthCheckComplete] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Use Redux for user state management
  const {
    user: userRedux,
    saveUser,
    logoutUser,
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

      // Check if we should request a review based on search count instead of unlocks
      if (
        !ReviewService.shouldRequestReview([], reviewRequests) // Pass empty array for searches
      ) {
        return;
      }

      // Log metrics for debugging
      ReviewService.logReviewMetrics([], reviewRequests); // Pass empty array for searches

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
              searchCount: 0, // We'll track this differently now
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

  // Handle deep linking for referrals
  const handleDeepLink = (url: string) => {
    console.log("Deep link received:", url);

    // Parse the URL manually for custom schemes
    try {
      // Handle custom scheme URLs like "official://refer/test123"
      if (url.startsWith("official://")) {
        const urlWithoutScheme = url.replace("official://", "");
        console.log("URL without scheme:", urlWithoutScheme);

        if (urlWithoutScheme.startsWith("refer/")) {
          const referrerId = urlWithoutScheme.replace("refer/", "");
          if (referrerId) {
            console.log("Referral ID found:", referrerId);
            // Store the referral ID using MMKV
            AuthService.setReferralCode(referrerId);

            // If user is not authenticated, navigate to signup
            const token = AuthService.getAuthToken();
            if (!token) {
              router.replace("/signup");
            } else {
              // User is already logged in, navigate to tabs where modal will show
              console.log("User already authenticated, navigating to tabs");
              router.replace("/(tabs)");
            }
          }
        }
      } else {
        // Handle HTTP/HTTPS URLs with Linking.parse
        const { hostname, path } = Linking.parse(url);
        console.log("Parsed URL - hostname:", hostname, "path:", path);

        if (path && path.includes("/refer/")) {
          const referrerId = path.split("/refer/")[1];
          if (referrerId) {
            console.log("Referral ID found:", referrerId);
            // Store the referral ID using MMKV
            AuthService.setReferralCode(referrerId);

            // If user is not authenticated, navigate to signup
            const token = AuthService.getAuthToken();
            if (!token) {
              router.replace("/signup");
            } else {
              // User is already logged in, navigate to tabs where modal will show
              console.log("User already authenticated, navigating to tabs");
              router.replace("/(tabs)");
            }
          }
        }
      }
    } catch (error) {
      console.error("Error parsing deep link:", error);
    }
  };

  // Add this useEffect for deep link handling
  useEffect(() => {
    // Handle the initial URL when the app is opened via deep link
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink(initialUrl);
      }
    };

    getInitialURL();

    // Handle deep links when the app is already running
    const subscription = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Initialize purchases when app starts
    initializePurchases();

    // Check for updates when app starts
    checkForUpdates();

    // Check authentication and fetch user when fonts are loaded
    const checkAuthAndFetchUser = async () => {
      if (loaded) {
        const token = AuthService.getAuthToken();

        if (token) {
          // Token exists, try to fetch user
          const userData = await fetchCurrentUser();
          setUser(userData);
        } else {
          logoutUser(); // Clear any existing user state
        }

        setAuthCheckComplete(true);
        SplashScreen.hideAsync();
      }
    };

    checkAuthAndFetchUser();
  }, [loaded]);

  useEffect(() => {
    async function prepare() {
      try {
        const loggedIn = AuthService.isAuthenticated();
        if (loggedIn) {
          try {
            const userData = await getCurrentUser();
            setUser(userData);
          } catch (error) {
            const axiosError = error as AxiosError;
            if (axiosError.response?.status === 401) {
              AuthService.removeAuthToken();
            }
          }
        }
      } catch (e) {
        console.warn(e);
      } finally {
        setIsReady(true);
        SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  // Navigate based on authentication status once check is complete
  useEffect(() => {
    if (authCheckComplete) {
      const token = AuthService.getAuthToken();

      if (token && user) {
        // Has valid token and user data
        router.replace("/(tabs)");

        // Check if we should request a review after successful login
        if (user.reviewRequests) {
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
        <Stack.Screen name="past-searches" options={{ headerShown: false }} />
        <Stack.Screen name="trust-center" options={{ headerShown: false }} />
        <Stack.Screen
          name="why-limit-searches"
          options={{ headerShown: false }}
        />
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
        <Stack.Screen
          name="premium"
          options={{ headerShown: false, animation: "fade_from_bottom" }}
        />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

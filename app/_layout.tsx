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

import { useColorScheme } from "@/components/useColorScheme";
import { AuthService } from "@/utils/authStorage";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Check authentication status when fonts are loaded
  useEffect(() => {
    if (loaded) {
      // Get auth token and log it
      const token = AuthService.getAuthToken();
      console.log(
        "Auth token check:",
        token ? `Token: ${token}` : "No token found"
      );

      const authenticated = AuthService.isAuthenticated();
      console.log("User authentication status:", authenticated);

      setIsAuthenticated(authenticated);
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Navigate based on authentication status once determined
  useEffect(() => {
    if (isAuthenticated !== null) {
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/auth");
      }
    }
  }, [isAuthenticated]);

  if (!loaded || isAuthenticated === null) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="auth" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}

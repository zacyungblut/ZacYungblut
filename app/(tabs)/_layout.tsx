import React, { useCallback, useRef, useState, useEffect } from "react";
import { Dimensions, StyleSheet, View, Keyboard, Alert } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  runOnJS,
} from "react-native-reanimated";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";

import { colors } from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import TabBar from "@/components/TabBar";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { useNotification } from "@/contexts/NotificationContext";

// Import your tab screens directly
import FeedScreen from "./feed";
import LeaderboardScreen from "./leaderboard";
import RankScreen from "./rank";
import ProfileScreen from "./profile";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Configure how notifications should be handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function TabLayout() {
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const currentPage = useSharedValue(0);
  const { user, updateUserExpoPushToken } = useUserRedux();
  const { addNotification } = useNotification();

  // Push notification setup
  useEffect(() => {
    let isMounted = true;

    const setupPushNotifications = async () => {
      try {
        // Only proceed if we have a user and this is a real device
        if (!user) {
          console.log(
            "Skipping push notification setup: no user or not a real device"
          );
          return;
        }

        // Check if we already have a token and it matches what's stored
        const existingToken = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        if (existingToken.data === user.expoPushToken) {
          console.log("Push token already up to date");
          return;
        }

        // Request permissions
        const { status: existingStatus } =
          await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== "granted") {
          console.log("Push notification permissions not granted");

          return;
        }

        // Get the token that uniquely identifies this device
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });

        console.log("Got Expo push token:", token.data);

        // Save the token to the user's profile
        if (isMounted && token.data !== user.expoPushToken) {
          try {
            await updateUserExpoPushToken(token.data);
            console.log("Push token saved successfully");
          } catch (error) {
            console.error("Failed to save push token:", error);
          }
        }

        // Set up notification listeners
        const notificationListener =
          Notifications.addNotificationReceivedListener((notification) => {
            console.log("Notification received:", notification);

            // Show in-app notification
            addNotification({
              title: notification.request.content.title || "New Notification",
              description: notification.request.content.body || "",
              type: "info",
              duration: 5000,
            });
          });

        const responseListener =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("Notification response:", response);
            // Handle notification tap - you can add navigation logic here
          });

        // Cleanup function
        return () => {
          notificationListener.remove();
          responseListener.remove();
        };
      } catch (error) {
        console.error("Error setting up push notifications:", error);
      }
    };

    // Only set up notifications if user is logged in
    if (user) {
      setupPushNotifications();
    }

    return () => {
      isMounted = false;
    };
  }, [user, updateUserExpoPushToken, addNotification]);

  // Create a safe keyboard dismiss function
  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleTabPress = useCallback((index: number) => {
    // Dismiss keyboard when tab is pressed
    Keyboard.dismiss();

    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      y: 0,
      animated: false,
    });
  }, []);

  const handlePlusPress = useCallback(() => {
    // Continue with normal post flow
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const newScrollOffset = event.contentOffset.x / SCREEN_WIDTH;
      currentPage.value = newScrollOffset;

      // Dismiss keyboard when scrolling
      runOnJS(dismissKeyboard)();
    },
  });

  return (
    <View style={styles.container}>
      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        keyboardShouldPersistTaps="never"
        bounces={true}
        onScroll={scrollHandler}
        style={[
          styles.scrollView,
          {
            backgroundColor: colors.background.primary,
          },
        ]}
        decelerationRate="fast">
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <FeedScreen />
        </View>
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <LeaderboardScreen />
        </View>
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <RankScreen />
        </View>
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <ProfileScreen />
        </View>
      </Animated.ScrollView>

      <TabBar
        currentPage={currentPage}
        onTabPress={handleTabPress}
        onPlusPress={handlePlusPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
});

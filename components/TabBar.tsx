import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Keyboard,
  Dimensions,
  Alert,
  Image,
} from "react-native";
import Animated, {
  SharedValue,
  useAnimatedStyle,
  interpolate,
  withSpring,
  useAnimatedReaction,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import HomeIcon from "./HomeIcon";
import UserIcon from "./UserIcon";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { router } from "expo-router";
import { selectMediaFromLibrary } from "@/utils/helpers";

const TAB_BAR_HEIGHT = 75;

interface TabBarProps {
  currentPage: SharedValue<number>;
  onTabPress: (index: number) => void;
  onPlusPress?: () => void;
}

const TabBar: React.FC<TabBarProps> = ({
  currentPage,
  onTabPress,
  onPlusPress,
}) => {
  const { user } = useUserRedux();
  const [currentPageState, setCurrentPageState] = useState(0);

  // Listen to changes in currentPage shared value and update local state
  useAnimatedReaction(
    () => currentPage.value,
    (currentValue) => {
      runOnJS(setCurrentPageState)(Math.round(currentValue));
    },
    [currentPage]
  );

  // Animated styles for the tab bar background
  const animatedTabBarStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: "rgba(0, 0, 0, 0.95)",
    };
  });

  // Tab icon component
  const TabIcon = ({
    iconType,
    index,
    label,
  }: {
    iconType: "home" | "leaderboard" | "rank" | "user";
    index: number;
    label: string;
  }) => {
    const animatedIconStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        currentPage.value,
        [index - 0.5, index, index + 0.5],
        [0.5, 1, 0.5],
        "clamp"
      );

      return {
        opacity: withSpring(opacity, { damping: 15, stiffness: 150 }),
      };
    });

    const animatedTextStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        currentPage.value,
        [index - 0.5, index, index + 0.5],
        [0.5, 1, 0.5],
        "clamp"
      );

      return {
        opacity: withSpring(opacity, { damping: 15, stiffness: 150 }),
      };
    });

    const handlePress = () => {
      // Dismiss keyboard before tab navigation
      Keyboard.dismiss();
      onTabPress(index);
    };

    // Use the state value instead of the shared value directly
    const isSelected = currentPageState === index;

    const renderIcon = () => {
      if (iconType === "home") {
        return (
          <View style={styles.iconWrapper}>
            <HomeIcon isFocused={isSelected} color="#FFFFFF" />
          </View>
        );
      } else if (iconType === "leaderboard") {
        return (
          <View style={styles.iconWrapper}>
            <Ionicons
              name={isSelected ? "trophy" : "trophy-outline"}
              size={24}
              color="#FFFFFF"
            />
          </View>
        );
      } else if (iconType === "rank") {
        return (
          <View style={styles.iconWrapper}>
            <Ionicons
              name={isSelected ? "shield" : "shield-outline"}
              size={24}
              color="#FFFFFF"
              style={{ opacity: isSelected ? 1 : 0.7 }}
            />
          </View>
        );
      } else if (iconType === "user") {
        return (
          <View style={styles.iconWrapper}>
            <UserIcon isFocused={isSelected} color="#FFFFFF" />
          </View>
        );
      }
      return null;
    };

    return (
      <TouchableOpacity
        style={styles.tabButton}
        onPress={handlePress}
        activeOpacity={0.7}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          {renderIcon()}
        </Animated.View>
        <Animated.Text
          style={[
            styles.tabLabel,
            {
              color: "#FFFFFF",
            },
            animatedTextStyle,
          ]}>
          {label}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  // Enhanced Plus button component
  const PlusButton = () => {
    const handlePress = async () => {
      Keyboard.dismiss();

      // Check if user has pisser tag before proceeding
      if (!user?.pisserTag) {
        // Trigger the pisser tag modal via the parent callback
        if (onPlusPress) {
          onPlusPress();
        }
        return;
      }

      try {
        // Open camera roll immediately
        const selectedMedia = await selectMediaFromLibrary();

        if (selectedMedia) {
          // Navigate to create post with the selected media
          router.push({
            pathname: "/create-post",
            params: {
              selectedMediaUri: selectedMedia.uri,
              selectedMediaType: selectedMedia.type,
            },
          });
        }
        // If user cancels media selection, do nothing (stay on current screen)
      } catch (error) {
        console.error("Error selecting media:", error);
        Alert.alert("Error", "Failed to select media. Please try again.");
      }

      // Call the callback if provided
      if (onPlusPress) {
        onPlusPress();
      }
    };

    return (
      <TouchableOpacity
        style={styles.plusButton}
        onPress={handlePress}
        activeOpacity={0.8}>
        <View style={styles.plusButtonContainer}>
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.tabBar, animatedTabBarStyle]}>
        <BlurView
          intensity={100}
          tint="dark"
          style={StyleSheet.absoluteFillObject}
        />

        {/* Tab buttons with perfect spacing and alignment */}
        <View style={styles.tabContainer}>
          <TabIcon iconType="home" index={0} label="Feed" />
          <TabIcon iconType="leaderboard" index={1} label="Leaderboard" />

          {/* Plus button in center */}
          <PlusButton />

          <TabIcon iconType="rank" index={2} label="Rank" />
          <TabIcon iconType="user" index={3} label="Profile" />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
  },
  tabBar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 20, // Increased bottom padding to push content up
    paddingTop: 4, // Reduced top padding
    borderTopWidth: 0.5,
    borderTopColor: "rgba(40, 40, 40, 0.8)",
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: -4, // Move the entire container up
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 2, // Reduced padding
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3, // Reduced margin between icon and label
    height: 32, // Fixed height for consistent alignment
  },
  iconWrapper: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 13,
  },
  clanIcon: {
    width: 24,
    height: 24,
    tintColor: "#FFFFFF",
  },
  plusButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginTop: -4, // Move the plus button up to align with other icons
  },
  plusButtonContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
});

export default TabBar;

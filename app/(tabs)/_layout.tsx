import React, { useCallback, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import TabBar from "@/components/TabBar";

// Import your tab screens directly
import TabOneScreen from "./index";
import TabTwoScreen from "./two";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const currentPage = useSharedValue(0);

  const handleTabPress = useCallback((index: number) => {
    scrollViewRef.current?.scrollTo({
      x: index * SCREEN_WIDTH,
      y: 0,
      animated: true,
    });
  }, []);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const newScrollOffset = event.contentOffset.x / SCREEN_WIDTH;
      currentPage.value = newScrollOffset;
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
        onScroll={scrollHandler}
        style={[
          styles.scrollView,
          {
            backgroundColor: Colors[colorScheme ?? "light"].background,
          },
        ]}
        bounces={false}
        decelerationRate="fast">
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <TabOneScreen />
        </View>
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <TabTwoScreen />
        </View>
      </Animated.ScrollView>

      <TabBar currentPage={currentPage} onTabPress={handleTabPress} />
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

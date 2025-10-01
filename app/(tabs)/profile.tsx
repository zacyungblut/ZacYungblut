import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as VideoThumbnails from "expo-video-thumbnails";
import { LinearGradient } from "expo-linear-gradient";

import { Text, View } from "@/components/Themed";
import ProfileBar from "@/components/ProfileBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { getCurrentUserPosts } from "@/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 16; // Left and right padding for content sections (not posts)
const GRID_GAP = 1; // Small gap between items
const POST_WIDTH = (SCREEN_WIDTH - GRID_GAP * 2) / 3; // 3 posts per row, account for gaps
const POST_HEIGHT = POST_WIDTH * 1.5; // Make posts vertical (1.5:1 aspect ratio)

interface Post {
  id: string;
  caption?: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  blurHash?: string;
  songTitle?: string;
  songArtist?: string;
  songUrl?: string;
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  dislikesCount: number;
  reportsCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  isReported: boolean;
  createdAt: string;
  user: {
    id: string;
    name?: string;
    pisserTag?: string;
  };
}

export default function ProfileScreen() {
  const { user } = useUserRedux();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoThumbnails, setVideoThumbnails] = useState<
    Record<string, string>
  >({});
  const [thumbnailsLoading, setThumbnailsLoading] = useState<Set<string>>(
    new Set()
  );
  const [selectedFilter, setSelectedFilter] = useState<
    "grid" | "list" | "bookmark" | "tagged"
  >("grid");

  // Generate video thumbnail
  const generateVideoThumbnail = useCallback(
    async (post: Post) => {
      if (
        post.mediaType !== "video" ||
        videoThumbnails[post.id] ||
        thumbnailsLoading.has(post.id)
      ) {
        return;
      }

      try {
        setThumbnailsLoading((prev) => new Set(prev).add(post.id));

        const { uri } = await VideoThumbnails.getThumbnailAsync(post.mediaUrl, {
          time: 1000, // Get thumbnail at 1 second
          quality: 0.7, // Good quality but not too large
        });

        setVideoThumbnails((prev) => ({
          ...prev,
          [post.id]: uri,
        }));
      } catch (error) {
        console.error(
          "Error generating video thumbnail for post",
          post.id,
          error
        );
      } finally {
        setThumbnailsLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(post.id);
          return newSet;
        });
      }
    },
    [videoThumbnails, thumbnailsLoading]
  );

  // Load user's posts
  const loadPosts = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) {
          setRefreshing(true);
          setError(null);
        } else {
          setLoading(true);
        }

        const response = await getCurrentUserPosts(1, 50); // Load first 50 posts
        const { posts: userPosts } = response.data;

        setPosts(userPosts);

        // Generate thumbnails for video posts
        userPosts.forEach((post: Post) => {
          if (post.mediaType === "video") {
            generateVideoThumbnail(post);
          }
        });
      } catch (err: any) {
        console.error("Error loading user posts:", err);
        const errorMessage =
          err.response?.data?.error ||
          "Failed to load posts. Please try again.";
        setError(errorMessage);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [generateVideoThumbnail]
  );

  // Initial load
  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    // Clear thumbnails on refresh
    setVideoThumbnails({});
    setThumbnailsLoading(new Set());
    loadPosts(true);
  }, [loadPosts]);

  // Handle post press - navigate to full screen view or details
  const handlePostPress = useCallback((post: Post) => {
    // You can implement navigation to a detailed post view here
    console.log("Post pressed:", post.id);
  }, []);

  // Handle filter selection
  const handleFilterSelect = useCallback(
    (filter: "grid" | "list" | "bookmark" | "tagged") => {
      setSelectedFilter(filter);
      // You can add logic here to filter posts based on the selected type
    },
    []
  );

  // Get the appropriate image source for a post
  const getPostImageSource = useCallback(
    (post: Post) => {
      if (post.mediaType === "video") {
        // Use thumbnail if available, otherwise show loading or fallback
        const thumbnailUri = videoThumbnails[post.id];
        if (thumbnailUri) {
          return { uri: thumbnailUri };
        }
        // Return null to show loading state for videos without thumbnails yet
        return null;
      }
      // For images, use the original media URL
      return { uri: post.mediaUrl };
    },
    [videoThumbnails]
  );

  // Render posts in rows of 3, but align left when less than 3
  const renderPostsGrid = () => {
    const rows = [];
    for (let i = 0; i < posts.length; i += 3) {
      const rowPosts = posts.slice(i, i + 3);
      rows.push(
        <View key={`row-${i}`} style={styles.postRow}>
          {rowPosts.map((post, index) => {
            const imageSource = getPostImageSource(post);
            const isLoadingThumbnail = thumbnailsLoading.has(post.id);

            return (
              <TouchableOpacity
                key={post.id}
                style={[
                  styles.postItem,
                  // Add right margin to all items except the last in each row
                  index < rowPosts.length - 1 && styles.postItemWithMargin,
                ]}
                onPress={() => handlePostPress(post)}
                activeOpacity={0.8}>
                {/* Image/Video Thumbnail */}
                {imageSource ? (
                  <Image
                    source={imageSource}
                    style={styles.postImage}
                    resizeMode="cover"
                  />
                ) : (
                  // Loading state for video thumbnails
                  <View style={styles.thumbnailLoading}>
                    {isLoadingThumbnail ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.text.secondary}
                      />
                    ) : (
                      <Ionicons
                        name="videocam"
                        size={24}
                        color={colors.text.secondary}
                      />
                    )}
                  </View>
                )}

                {/* Linear Gradient Overlay */}
                <LinearGradient
                  colors={["transparent", "rgba(0,0,0,0.4)"]}
                  style={styles.gradientOverlay}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 0, y: 1 }}
                  pointerEvents="none"
                />

                {/* Loading indicator for thumbnail generation */}
                {isLoadingThumbnail && (
                  <View style={styles.thumbnailGeneratingOverlay}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                )}

                {/* MMR Badge */}
                <View style={styles.mmrBadge}>
                  <Image
                    source={require("@/assets/images/mmr.png")}
                    style={styles.mmrIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.mmrText}>200</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      );
    }
    return rows;
  };

  return (
    <View style={styles.container}>
      <ProfileBar
        username={user?.pisserTag ? user.pisserTag : "No Pissername"}
        onUsernamePress={() => {
          // Could implement account switcher or username editing
          console.log("Username pressed");
        }}
      />

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text.secondary}
            colors={[colors.text.secondary]}
          />
        }>
        {/* User Info Section */}
        <View style={styles.userSection}>
          <View style={styles.userColumn}>
            <View style={styles.avatarContainer}>
              <Image
                source={require("@/assets/images/DefaultProfile.jpg")}
                style={styles.profilePhoto}
                resizeMode="cover"
              />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.pisserTag ? `@${user.pisserTag}` : "No Pissername"}
              </Text>

              {/* Action Buttons */}
              <View style={styles.actionButtonsContainer}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Navigate to edit profile or show edit profile modal
                    router.push("/edit-profile");
                  }}
                  activeOpacity={0.8}>
                  <Text style={styles.actionButtonText}>Edit profile</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Navigate to invite friends or show invite modal
                    console.log("Invite friends pressed");
                  }}
                  activeOpacity={0.8}>
                  <Text style={styles.actionButtonText}>Invite friends</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Upsell Banner */}
        <View style={styles.premiumBannerContainer}>
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => router.push("/premium")}
            activeOpacity={0.8}>
            <View style={styles.premiumIconContainer}>
              <Image
                source={require("@/assets/images/premium.png")}
                style={styles.premiumIcon}
                resizeMode="contain"
              />
            </View>
            <View style={styles.premiumContent}>
              <Text style={styles.premiumTitle}>Become a Premium Pisser</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <View style={styles.filterTabsContainer}>
            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "grid" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterSelect("grid")}
              activeOpacity={0.7}>
              <Ionicons
                name="grid-outline"
                size={24}
                color={
                  selectedFilter === "grid"
                    ? colors.text.primary
                    : colors.text.secondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "list" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterSelect("list")}
              activeOpacity={0.7}>
              <Ionicons
                name="list-outline"
                size={24}
                color={
                  selectedFilter === "list"
                    ? colors.text.primary
                    : colors.text.secondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "bookmark" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterSelect("bookmark")}
              activeOpacity={0.7}>
              <Ionicons
                name="bookmark-outline"
                size={24}
                color={
                  selectedFilter === "bookmark"
                    ? colors.text.primary
                    : colors.text.secondary
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.filterTab,
                selectedFilter === "tagged" && styles.filterTabActive,
              ]}
              onPress={() => handleFilterSelect("tagged")}
              activeOpacity={0.7}>
              <Ionicons
                name="person-outline"
                size={24}
                color={
                  selectedFilter === "tagged"
                    ? colors.text.primary
                    : colors.text.secondary
                }
              />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.text.secondary} />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={colors.text.secondary}
              />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => loadPosts()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : posts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Ionicons
                name="images-outline"
                size={48}
                color={colors.text.secondary}
                style={styles.noPostsIcon}
              />
              <Text style={styles.noPostsText}>No Posts yet</Text>
              <Text style={styles.noPostsSubtext}>
                Your posts will appear here when you start sharing
              </Text>
            </View>
          ) : (
            <View style={styles.postsGrid}>{renderPostsGrid()}</View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    // Removed paddingHorizontal: GRID_PADDING,
  },
  userSection: {
    paddingVertical: 32,
    paddingHorizontal: GRID_PADDING,
    marginBottom: 0,
    alignItems: "center",
  },
  userColumn: {
    alignItems: "center",
    justifyContent: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 3,
    borderColor: colors.border.light,
    overflow: "hidden",
  },
  profilePhoto: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  userInfo: {
    alignItems: "center",
    paddingTop: 0,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: "center",
  },
  actionButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border.light,
    minWidth: 120,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  premiumBannerContainer: {
    paddingHorizontal: GRID_PADDING, // Added container with horizontal padding
    marginBottom: 16,
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 8,
    // Removed marginBottom: 16, (now handled by container)
    shadowColor: colors.text.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3.84,
    elevation: 4,
  },
  premiumIconContainer: {
    marginRight: 16,
  },
  premiumIcon: {
    width: 40,
    height: 40,
  },
  premiumContent: {
    flex: 1,
    marginRight: 16,
  },
  premiumTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 4,
  },
  premiumButton: {
    backgroundColor: colors.offBlack,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  premiumButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.white,
  },
  postsSection: {
    marginBottom: 32,
    // No horizontal padding - posts will stretch edge to edge
  },
  filterTabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: GRID_PADDING,
    paddingVertical: 0,
    marginBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterTab: {
    padding: 12,
    borderRadius: 0,
    minWidth: 48,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  filterTabActive: {
    borderBottomColor: colors.text.primary,
    backgroundColor: "transparent",
  },
  postsSectionHeader: {
    paddingHorizontal: GRID_PADDING, // Added horizontal padding just for the header
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    // Removed marginBottom: 16, (now handled by header container)
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: GRID_PADDING, // Added horizontal padding for loading state
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: GRID_PADDING, // Added horizontal padding for error state
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.offBlack,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  noPostsContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: GRID_PADDING, // Added horizontal padding for no posts state
  },
  noPostsIcon: {
    marginBottom: 16,
  },
  noPostsText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 8,
  },
  noPostsSubtext: {
    fontSize: 14,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 20,
  },
  postsGrid: {
    flex: 1,
    // Removed paddingHorizontal - posts stretch edge to edge
  },
  postRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: GRID_GAP, // Add gap between rows
  },
  postItem: {
    width: POST_WIDTH,
    height: POST_HEIGHT,
    position: "relative",
    borderRadius: 0, // Remove border radius for edge-to-edge look
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
  },
  postItemWithMargin: {
    marginRight: GRID_GAP, // Add gap between posts in the same row
  },
  postImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailLoading: {
    width: "100%",
    height: "100%",
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbnailGeneratingOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mmrBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0,0,0,0)",
    borderRadius: 12,
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  mmrIcon: {
    width: 24,
    height: 24,
    marginRight: 4,
  },
  mmrText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.white,
  },
});

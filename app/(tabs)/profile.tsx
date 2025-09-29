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

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";
import { getCurrentUserPosts } from "@/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 16; // Left and right padding
const GRID_GAP = 4; // Gap between items
const POST_SIZE = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP * 2) / 3; // 3 posts per row

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

                {/* Video indicator overlay */}
                {post.mediaType === "video" && (
                  <View style={styles.videoIndicator}>
                    <Ionicons name="play" size={20} color={colors.white} />
                  </View>
                )}

                {/* Post stats overlay */}
                <View style={styles.postOverlay}>
                  <View style={styles.postStats}>
                    <View style={styles.statItem}>
                      <Ionicons name="heart" size={14} color={colors.white} />
                      <Text style={styles.statText}>{post.likesCount}</Text>
                    </View>
                    {post.commentsCount > 0 && (
                      <View style={styles.statItem}>
                        <Ionicons
                          name="chatbubble"
                          size={14}
                          color={colors.white}
                        />
                        <Text style={styles.statText}>
                          {post.commentsCount}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Loading indicator for thumbnail generation */}
                {isLoadingThumbnail && (
                  <View style={styles.thumbnailGeneratingOverlay}>
                    <ActivityIndicator size="small" color={colors.white} />
                  </View>
                )}
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
      <TopBar title="Profile" showSettingsButton={true} />

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
          <View style={styles.userRow}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={48} color={colors.text.secondary} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.pisserTag ? `@${user.pisserTag}` : "No Pissername"}
              </Text>
              <Text style={styles.postCount}>
                {posts.length} {posts.length === 1 ? "post" : "posts"}
              </Text>
            </View>
          </View>
        </View>

        {/* Premium Upsell Banner */}
        <View style={styles.premiumBanner}>
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
          <TouchableOpacity
            style={styles.premiumButton}
            onPress={() => router.push("/premium")}
            activeOpacity={0.8}>
            <Text style={styles.premiumButtonText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Grid */}
        <View style={styles.postsSection}>
          <Text style={styles.sectionTitle}>Posts</Text>

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
    paddingHorizontal: GRID_PADDING,
  },
  userSection: {
    paddingVertical: 24,
    marginBottom: 0,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 2,
    borderColor: colors.border.light,
  },
  userInfo: {
    flex: 1,
    paddingTop: 16,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.text.primary,
    marginBottom: 8,
  },
  postCount: {
    fontSize: 16,
    color: colors.text.secondary,
    fontWeight: "500",
  },
  premiumBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    padding: 20,
    marginBottom: 16,

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
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.text.primary,
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
    marginTop: 16,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
  },
  postRow: {
    flexDirection: "row",
    justifyContent: "flex-start", // This ensures items align to the left
    marginBottom: GRID_GAP,
  },
  postItem: {
    width: POST_SIZE,
    height: POST_SIZE,
    position: "relative",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.background.secondary,
  },
  postItemWithMargin: {
    marginRight: GRID_GAP,
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
  videoIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -15 }, { translateY: -15 }],
    backgroundColor: "rgba(0,0,0,0.7)",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  postOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 8,
  },
  postStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  statText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  thumbnailGeneratingOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
});

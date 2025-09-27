import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  Dimensions,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ViewToken,
  Alert,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useVideoPlayer, VideoView, VideoSource } from "expo-video";
import { useEvent } from "expo";
import { Ionicons } from "@expo/vector-icons";
import {
  getFeed,
  likePost,
  unlikePost,
  dislikePost,
  undislikePost,
  reportPost,
} from "@/api";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Post type based on your backend schema
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

interface VideoItemProps {
  item: Post;
  isVisible: boolean;
  onUpdatePost: (postId: string, updates: Partial<Post>) => void;
}

const VideoItem: React.FC<VideoItemProps> = ({
  item,
  isVisible,
  onUpdatePost,
}) => {
  const [isLiked, setIsLiked] = useState(item.isLiked);
  const [isDisliked, setIsDisliked] = useState(item.isDisliked);
  const [localLikesCount, setLocalLikesCount] = useState(item.likesCount);
  const [localDislikesCount, setLocalDislikesCount] = useState(
    item.dislikesCount
  );
  const [isLoading, setIsLoading] = useState(false);

  // Update local state when item prop changes (for refresh scenarios)
  useEffect(() => {
    setIsLiked(item.isLiked);
    setIsDisliked(item.isDisliked);
    setLocalLikesCount(item.likesCount);
    setLocalDislikesCount(item.dislikesCount);
  }, [item.isLiked, item.isDisliked, item.likesCount, item.dislikesCount]);

  // Only create video player for video posts
  const player = useVideoPlayer(
    item.mediaType === "video" ? ({ uri: item.mediaUrl } as VideoSource) : null,
    (player) => {
      if (player) {
        player.loop = true;
        player.muted = false;
      }
    }
  );

  // Use useEvent hook to listen to playing state changes (only for videos)
  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player?.playing || false,
  });

  // Handle play/pause on tap (only for videos)
  const handleVideoPress = useCallback(() => {
    if (item.mediaType === "video" && player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [isPlaying, player, item.mediaType]);

  // Auto play/pause based on visibility (only for videos)
  useEffect(() => {
    if (item.mediaType === "video" && player) {
      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isVisible, player, item.mediaType]);

  // Handle like button press with optimistic updates
  const handleLike = useCallback(async () => {
    if (isLoading) return;

    const wasLiked = isLiked;
    const wasDisliked = isDisliked;
    const originalLikesCount = localLikesCount;
    const originalDislikesCount = localDislikesCount;

    try {
      // OPTIMISTIC UPDATE - Update UI immediately
      const newLikedState = !isLiked;

      if (newLikedState) {
        // Liking the post
        setIsLiked(true);
        setIsDisliked(false); // Remove dislike if exists
        setLocalLikesCount((prev) => prev + 1);
        if (wasDisliked) {
          setLocalDislikesCount((prev) => Math.max(0, prev - 1));
        }

        // Update parent component optimistically
        onUpdatePost(item.id, {
          isLiked: true,
          isDisliked: false,
          likesCount: originalLikesCount + 1,
          dislikesCount: wasDisliked
            ? Math.max(0, originalDislikesCount - 1)
            : originalDislikesCount,
        });
      } else {
        // Unliking the post
        setIsLiked(false);
        setLocalLikesCount((prev) => Math.max(0, prev - 1));

        // Update parent component optimistically
        onUpdatePost(item.id, {
          isLiked: false,
          likesCount: Math.max(0, originalLikesCount - 1),
        });
      }

      // Now make the API call in the background
      setIsLoading(true);
      if (newLikedState) {
        await likePost(item.id);
      } else {
        await unlikePost(item.id);
      }

      // API call succeeded - optimistic update was correct, no need to change UI
    } catch (error) {
      console.error("Error handling like:", error);

      // REVERT optimistic updates on error
      setIsLiked(wasLiked);
      setIsDisliked(wasDisliked);
      setLocalLikesCount(originalLikesCount);
      setLocalDislikesCount(originalDislikesCount);

      // Revert parent component state
      onUpdatePost(item.id, {
        isLiked: wasLiked,
        isDisliked: wasDisliked,
        likesCount: originalLikesCount,
        dislikesCount: originalDislikesCount,
      });

      Alert.alert("Error", "Failed to update like status. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [
    isLiked,
    isDisliked,
    localLikesCount,
    localDislikesCount,
    isLoading,
    item.id,
    onUpdatePost,
  ]);

  // Handle dislike button press with optimistic updates
  const handleDislike = useCallback(async () => {
    if (isLoading) return;

    const wasLiked = isLiked;
    const wasDisliked = isDisliked;
    const originalLikesCount = localLikesCount;
    const originalDislikesCount = localDislikesCount;

    try {
      // OPTIMISTIC UPDATE - Update UI immediately
      const newDislikedState = !isDisliked;

      if (newDislikedState) {
        // Disliking the post
        setIsDisliked(true);
        setIsLiked(false); // Remove like if exists
        setLocalDislikesCount((prev) => prev + 1);
        if (wasLiked) {
          setLocalLikesCount((prev) => Math.max(0, prev - 1));
        }

        // Update parent component optimistically
        onUpdatePost(item.id, {
          isDisliked: true,
          isLiked: false,
          dislikesCount: originalDislikesCount + 1,
          likesCount: wasLiked
            ? Math.max(0, originalLikesCount - 1)
            : originalLikesCount,
        });
      } else {
        // Removing dislike
        setIsDisliked(false);
        setLocalDislikesCount((prev) => Math.max(0, prev - 1));

        // Update parent component optimistically
        onUpdatePost(item.id, {
          isDisliked: false,
          dislikesCount: Math.max(0, originalDislikesCount - 1),
        });
      }

      // Now make the API call in the background
      setIsLoading(true);
      if (newDislikedState) {
        await dislikePost(item.id);
      } else {
        await undislikePost(item.id);
      }

      // API call succeeded - optimistic update was correct, no need to change UI
    } catch (error) {
      console.error("Error handling dislike:", error);

      // REVERT optimistic updates on error
      setIsLiked(wasLiked);
      setIsDisliked(wasDisliked);
      setLocalLikesCount(originalLikesCount);
      setLocalDislikesCount(originalDislikesCount);

      // Revert parent component state
      onUpdatePost(item.id, {
        isLiked: wasLiked,
        isDisliked: wasDisliked,
        likesCount: originalLikesCount,
        dislikesCount: originalDislikesCount,
      });

      Alert.alert(
        "Error",
        "Failed to update dislike status. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isDisliked,
    isLiked,
    localLikesCount,
    localDislikesCount,
    isLoading,
    item.id,
    onUpdatePost,
  ]);

  // Handle report button press with optimistic updates
  const handleReport = useCallback(() => {
    if (item.isReported) {
      Alert.alert(
        "Already Reported",
        "You have already reported this content."
      );
      return;
    }

    Alert.alert(
      "Report Content",
      "Choose a reason for reporting this content:",
      [
        {
          text: "Inappropriate Content",
          onPress: () => submitReport("inappropriate"),
        },
        { text: "Spam", onPress: () => submitReport("spam") },
        {
          text: "Harassment",
          onPress: () => submitReport("harassment"),
        },
        { text: "Other", onPress: () => submitReport("other") },
        { text: "Cancel", style: "cancel" },
      ]
    );
  }, [item.isReported]);

  const submitReport = useCallback(
    async (reason: string) => {
      const originalReportedState = item.isReported;
      const originalReportsCount = item.reportsCount;

      try {
        // OPTIMISTIC UPDATE - Update UI immediately
        onUpdatePost(item.id, {
          isReported: true,
          reportsCount: originalReportsCount + 1,
        });

        // Show success message immediately
        Alert.alert(
          "Thank you",
          "Your report has been submitted successfully."
        );

        // Now make the API call in the background
        setIsLoading(true);
        await reportPost(item.id, reason);

        // API call succeeded - optimistic update was correct
      } catch (error) {
        console.error("Error reporting post:", error);

        // REVERT optimistic updates on error
        onUpdatePost(item.id, {
          isReported: originalReportedState,
          reportsCount: originalReportsCount,
        });

        Alert.alert("Error", "Failed to submit report. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [item.id, item.reportsCount, item.isReported, onUpdatePost]
  );

  // Get display name for user
  const displayName =
    item.user.pisserTag || item.user.name || `User ${item.user.id.slice(0, 8)}`;

  return (
    <View style={styles.videoContainer}>
      {/* Media component */}
      <TouchableOpacity
        style={styles.videoWrapper}
        onPress={handleVideoPress}
        activeOpacity={1}>
        {item.mediaType === "video" && player ? (
          <VideoView
            style={styles.video}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            nativeControls={false}
            contentFit="cover"
          />
        ) : (
          <Image
            source={{ uri: item.mediaUrl }}
            style={styles.video}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* Content overlay */}
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* User info section */}
          <View style={styles.userInfo}>
            <View style={styles.profilePicturePlaceholder}>
              <Ionicons name="person" size={20} color="#666" />
            </View>
            <Text style={styles.username}>@{displayName}</Text>
          </View>

          {/* Caption */}
          {item.caption && (
            <Text style={styles.description}>{item.caption}</Text>
          )}

          {/* Song info */}
          {item.songTitle && (
            <View style={styles.songInfo}>
              <Ionicons name="musical-notes" size={14} color="#fff" />
              <Text style={styles.songText}>
                {item.songTitle} {item.songArtist && `• ${item.songArtist}`}
              </Text>
            </View>
          )}
        </View>

        {/* Right side actions */}
        <View style={styles.actions}>
          {/* Like button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              // Remove disabled state for optimistic updates
            ]}
            onPress={handleLike}>
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={28}
              color={isLiked ? "#ff3040" : "#ffffff"}
              style={styles.actionIcon}
            />
          </TouchableOpacity>

          {/* Dislike button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              // Remove disabled state for optimistic updates
            ]}
            onPress={handleDislike}>
            <Ionicons
              name={isDisliked ? "thumbs-down" : "thumbs-down-outline"}
              size={28}
              color={isDisliked ? "#ff3040" : "#ffffff"}
              style={styles.actionIcon}
            />
          </TouchableOpacity>

          {/* Report menu button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              // Remove disabled state for optimistic updates
            ]}
            onPress={handleReport}>
            <Ionicons
              name="ellipsis-horizontal"
              size={28}
              color={item.isReported ? "#ff3040" : "#ffffff"}
              style={styles.actionIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Subtle loading indicator - only shows during API calls */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}
    </View>
  );
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);

  // Update post in local state
  const handleUpdatePost = useCallback(
    (postId: string, updates: Partial<Post>) => {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updates } : post
        )
      );
    },
    []
  );

  // Load initial feed
  const loadFeed = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
        setError(null);
      } else {
        setLoading(true);
      }

      const response = await getFeed(undefined, 10); // Start with 10 posts
      const { posts: newPosts, pagination } = response.data;

      setPosts(newPosts);
      setNextCursor(pagination.nextCursor);
      setHasMore(pagination.hasMore);
    } catch (err: any) {
      console.error("Error loading feed:", err);
      const errorMessage =
        err.response?.data?.error || "Failed to load feed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load more posts (pagination)
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !nextCursor) return;

    try {
      setLoadingMore(true);
      const response = await getFeed(nextCursor, 10);
      const { posts: newPosts, pagination } = response.data;

      setPosts((prev) => [...prev, ...newPosts]);
      setNextCursor(pagination.nextCursor);
      setHasMore(pagination.hasMore);
    } catch (err: any) {
      console.error("Error loading more posts:", err);
      // Don't show error for pagination failures, just log them
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, nextCursor]);

  // Initial load
  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    loadFeed(true);
  }, [loadFeed]);

  // Handle viewability change to auto-play videos
  const handleViewabilityChange = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        const visibleIndex = viewableItems[0].index;
        if (visibleIndex !== null) {
          setCurrentVideoIndex(visibleIndex);
        }
      }
    },
    []
  );

  const renderVideoItem = ({ item, index }: { item: Post; index: number }) => (
    <VideoItem
      item={item}
      isVisible={index === currentVideoIndex}
      onUpdatePost={handleUpdatePost}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  };

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );

  // Show loading state
  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>Loading feed...</Text>
      </View>
    );
  }

  // Show error state
  if (error && posts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="alert-circle-outline" size={48} color="#fff" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => loadFeed()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show empty state
  if (posts.length === 0) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Ionicons name="images-outline" size={48} color="#666" />
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>
          Be the first to share something!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onViewableItemsChanged={handleViewabilityChange}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={3}
        windowSize={5}
        initialNumToRender={2}
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: "relative",
  },
  videoWrapper: {
    width: "100%",
    height: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    marginRight: 20,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  profilePicturePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ffffff40",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  description: {
    fontSize: 14,
    color: "#fff",
    lineHeight: 20,
    marginBottom: 8,
  },
  songInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  songText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    opacity: 0.8,
  },
  actions: {
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionIcon: {
    textAlign: "center",
  },
  actionCount: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
    textAlign: "center",
  },
  loadingFooter: {
    height: SCREEN_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingOverlay: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  loadingText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: "#fff",
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#007AFF",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    color: "#666",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
});

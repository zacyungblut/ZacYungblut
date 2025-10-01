import React, { useCallback, useEffect } from "react";
import { StyleSheet, TouchableOpacity, Image } from "react-native";
import { useVideoPlayer, VideoView, VideoSource } from "expo-video";
import { useEvent } from "expo";

interface MediaViewerProps {
  mediaUrl: string;
  mediaType: "image" | "video";
  isVisible: boolean;
  style?: any;
}

const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaUrl,
  mediaType,
  isVisible,
  style,
}) => {
  // Only create video player for video posts
  const player = useVideoPlayer(
    mediaType === "video" ? ({ uri: mediaUrl } as VideoSource) : null,
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
    if (mediaType === "video" && player) {
      if (isPlaying) {
        player.pause();
      } else {
        player.play();
      }
    }
  }, [isPlaying, player, mediaType]);

  // Auto play/pause based on visibility (only for videos)
  useEffect(() => {
    if (mediaType === "video" && player) {
      if (isVisible) {
        player.play();
      } else {
        player.pause();
      }
    }
  }, [isVisible, player, mediaType]);

  return (
    <TouchableOpacity
      style={[styles.mediaWrapper, style]}
      onPress={handleVideoPress}
      activeOpacity={1}>
      {mediaType === "video" && player ? (
        <VideoView
          style={styles.media}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          nativeControls={false}
          contentFit="cover"
        />
      ) : (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.media}
          resizeMode="cover"
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  mediaWrapper: {
    width: "100%",
    height: "100%",
  },
  media: {
    width: "100%",
    height: "100%",
  },
});

export default MediaViewer;

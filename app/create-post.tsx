import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  TextInput,
  Text,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { createPost } from "@/api";
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { useNotification } from "@/contexts/NotificationContext";

// Define Song interface locally to match the backend
interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  artworkUrl?: string;
  appleMusicUrl?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export interface SelectedMedia {
  uri: string;
  type: "image" | "video";
}

export const selectMediaFromLibrary =
  async (): Promise<SelectedMedia | null> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.6,
        allowsEditing: false,
        base64: true, // Enable base64 for S3 upload
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];

        if (!selectedAsset.uri) {
          throw new Error("Selected media is invalid");
        }

        console.log("Selected media:", selectedAsset.uri);
        console.log("Media type:", selectedAsset.type);
        console.log("File size:", selectedAsset.fileSize);

        // For videos, we need to handle the URI differently
        let mediaUri = selectedAsset.uri;

        // If it's a video and we have base64, use that; otherwise use the file URI
        if (selectedAsset.type === "video") {
          if (selectedAsset.base64) {
            mediaUri = `data:video/mp4;base64,${selectedAsset.base64}`;
          }
          // If no base64, the backend will handle the file URI
        } else {
          // For images, always use base64
          if (selectedAsset.base64) {
            mediaUri = `data:image/jpeg;base64,${selectedAsset.base64}`;
          }
        }

        return {
          uri: mediaUri,
          type: selectedAsset.type === "video" ? "video" : "image",
        };
      }

      return null;
    } catch (error) {
      console.error("Error selecting media:", error);
      throw error;
    }
  };

const CreatePostPage: React.FC = () => {
  const params = useLocalSearchParams();

  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [postText, setPostText] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [isPlaying, setIsPlaying] = useState(false);
  const { addNotification } = useNotification();

  // Create video player for selected video
  const player = useVideoPlayer(
    selectedMedia && mediaType === "video" ? selectedMedia : "",
    (player) => {
      player.loop = false;
      player.muted = isMuted;
    }
  );

  // Auto-play video when media is selected
  useEffect(() => {
    if (selectedMedia && mediaType === "video" && player) {
      player.play();
      setIsPlaying(true);
    }
  }, [selectedMedia, mediaType, player]);

  // Update player mute state when isMuted changes
  useEffect(() => {
    if (player) {
      player.muted = isMuted;
    }
  }, [isMuted, player]);

  // Handle pre-selected media from navigation params
  useEffect(() => {
    if (params.selectedMediaUri && params.selectedMediaType) {
      setSelectedMedia(params.selectedMediaUri as string);
      setMediaType(params.selectedMediaType as "image" | "video");
      setShowMediaSelector(false);

      // Clear the parameters to avoid re-setting on subsequent renders
      router.setParams({
        selectedMediaUri: undefined,
        selectedMediaType: undefined,
      });
    }
  }, [params.selectedMediaUri, params.selectedMediaType]);

  // Handle selected song from navigation params
  useFocusEffect(
    React.useCallback(() => {
      if (params.selectedSong && typeof params.selectedSong === "string") {
        try {
          const song = JSON.parse(params.selectedSong as string);
          setSelectedSong(song);

          // Clear the parameter to avoid re-setting on subsequent focuses
          router.setParams({ selectedSong: undefined });
        } catch (error) {
          console.error("Error parsing selected song:", error);
        }
      }
    }, [params.selectedSong])
  );

  const handleAddMedia = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.6,
        allowsEditing: false,
        base64: true, // Enable base64 for S3 upload
        exif: false,
      });

      if (!result.canceled && result.assets[0]) {
        const selectedAsset = result.assets[0];

        if (!selectedAsset.uri) {
          throw new Error("Selected media is invalid");
        }

        console.log("Selected media:", selectedAsset.uri);
        console.log("Media type:", selectedAsset.type);
        console.log("File size:", selectedAsset.fileSize);

        // For videos, we need to handle the URI differently
        let mediaUri = selectedAsset.uri;

        // If it's a video and we have base64, use that; otherwise use the file URI
        if (selectedAsset.type === "video") {
          if (selectedAsset.base64) {
            mediaUri = `data:video/mp4;base64,${selectedAsset.base64}`;
          }
          // If no base64, the backend will handle the file URI
        } else {
          // For images, always use base64
          if (selectedAsset.base64) {
            mediaUri = `data:image/jpeg;base64,${selectedAsset.base64}`;
          }
        }

        setSelectedMedia(mediaUri);
        setMediaType(selectedAsset.type === "video" ? "video" : "image");
        setShowMediaSelector(false);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Error", "Failed to select media");
    }
  };

  const handleRemoveSong = () => {
    setSelectedSong(null);
  };

  const handlePostSubmit = async () => {
    if (!selectedMedia || !mediaType) {
      Alert.alert("Error", "Please select a photo or video first.");
      return;
    }

    if (!postText.trim()) {
      Alert.alert("Error", "Please enter a caption for your post.");
      return;
    }

    setIsSubmitting(true);

    try {
      const postData = {
        caption: postText.trim(),
        mediaUrl: selectedMedia, // This will be processed and uploaded to S3 by the backend
        mediaType,
        songTitle: selectedSong?.title,
        songArtist: selectedSong?.artist,
        songUrl: selectedSong?.previewUrl || selectedSong?.appleMusicUrl,
      };

      console.log("Submitting post:", postData);
      const response = await createPost(postData);

      addNotification({
        title: "Post created successfully!",
        description: "Your post has been created successfully!",
        type: "success",
        duration: 5000,
      });
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create post. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
      router.back();
    }
  };

  const handleClose = () => {
    router.back();
  };

  const handleBackToMediaSelection = () => {
    setSelectedMedia(null);
    setMediaType(null);
    setShowMediaSelector(true);
  };

  const handleVideoPress = () => {
    if (player) {
      if (isPlaying) {
        player.pause();
        setIsPlaying(false);
      } else {
        player.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    if (mediaType === "video") {
      return (
        <View style={styles.videoContainer}>
          <VideoView
            style={styles.mediaPreview}
            player={player}
            allowsFullscreen={false}
            allowsPictureInPicture={false}
            showsTimecodes={false}
          />

          {/* Transparent overlay to intercept touches */}
          <TouchableOpacity
            style={styles.videoOverlay}
            onPress={handleVideoPress}
            activeOpacity={1}
          />

          {/* Mute/Unmute Button */}
          <TouchableOpacity
            style={styles.muteButton}
            onPress={toggleMute}
            activeOpacity={0.7}>
            <View style={styles.muteButtonBackground}>
              <Ionicons
                name={isMuted ? "volume-mute" : "volume-high"}
                size={20}
                color="#FFFFFF"
              />
            </View>
          </TouchableOpacity>

          {/* Play/Pause Indicator */}
          {!isPlaying && (
            <View style={styles.playPauseIndicator}>
              <View style={styles.playPauseBackground}>
                <Ionicons name="play" size={32} color="#FFFFFF" />
              </View>
            </View>
          )}
        </View>
      );
    } else {
      return (
        <Image
          source={{ uri: selectedMedia }}
          style={styles.mediaPreview}
          resizeMode="cover"
        />
      );
    }
  };

  const renderSelectedSong = () => {
    if (!selectedSong) return null;

    return (
      <View style={styles.selectedSongContainer}>
        <View style={styles.selectedSongInfo}>
          {selectedSong.artworkUrl ? (
            <Image
              source={{ uri: selectedSong.artworkUrl }}
              style={styles.selectedSongArtwork}
            />
          ) : (
            <View
              style={[styles.selectedSongArtwork, styles.placeholderArtwork]}>
              <Ionicons name="musical-notes" size={20} color="#999" />
            </View>
          )}

          <View style={styles.selectedSongDetails}>
            <Text style={styles.selectedSongTitle} numberOfLines={1}>
              {selectedSong.title}
            </Text>
            <Text style={styles.selectedSongArtist} numberOfLines={1}>
              {selectedSong.artist}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleRemoveSong}
          style={styles.removeSongButton}>
          <Ionicons name="close-circle" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {showMediaSelector ? (
          // Media Selection Screen
          <>
            <View style={styles.header}>
              <TouchableOpacity onPress={handleClose}>
                <Text style={styles.button}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Select Media</Text>
              <View style={{ width: 60 }} />
            </View>

            <View style={styles.mediaSelectorContent}>
              <TouchableOpacity
                style={styles.mediaPickerButton}
                onPress={handleAddMedia}
                activeOpacity={0.7}>
                <Ionicons name="camera" size={48} color="#007AFF" />
                <Text style={styles.mediaPickerText}>Select Photo/Video</Text>
                <Text style={styles.mediaPickerSubtext}>
                  Choose from your camera roll
                </Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Post Creation Screen
          <>
            <View style={styles.header}>
              <TouchableOpacity
                onPress={handleBackToMediaSelection}
                disabled={isSubmitting}>
                <Text
                  style={[
                    styles.button,
                    isSubmitting && styles.disabledButton,
                  ]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={styles.title}>Create Piss</Text>
              <TouchableOpacity
                onPress={handlePostSubmit}
                disabled={isSubmitting}>
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Text style={[styles.button, styles.postButton]}>Post</Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.content}
              showsVerticalScrollIndicator={false}>
              {/* Media Preview */}
              {selectedMedia && (
                <View style={styles.mediaPreviewContainer}>
                  {renderMediaPreview()}
                </View>
              )}

              {/* Caption Input */}
              <View style={styles.inputSection}>
                {/* <Text style={styles.inputLabel}>Caption</Text> */}
                <TextInput
                  style={styles.postInput}
                  placeholder="Write a caption..."
                  multiline
                  value={postText}
                  onChangeText={setPostText}
                  textAlignVertical="top"
                  editable={!isSubmitting}
                />
              </View>

              {/* Song Section */}
              <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>Song</Text>

                {selectedSong ? (
                  renderSelectedSong()
                ) : (
                  <TouchableOpacity
                    style={styles.addSongButton}
                    onPress={() =>
                      router.push({
                        pathname: "/song-search",
                        params: { returnTo: "/create-post" },
                      })
                    }
                    disabled={isSubmitting}>
                    <Ionicons name="musical-notes" size={24} color="#007AFF" />
                    <Text style={styles.addSongText}>Add Song</Text>
                    <Text style={styles.addSongSubtext}>
                      Search and add a song to your post
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  button: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  postButton: {
    color: "#007AFF",
    fontWeight: "600",
  },
  disabledButton: {
    color: "#999999",
  },
  mediaSelectorContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  mediaPickerButton: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "#F8F8F8",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed",
  },
  mediaPickerText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 16,
  },
  mediaPickerSubtext: {
    fontSize: 14,
    color: "#666666",
    marginTop: 8,
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  mediaPreviewContainer: {
    height: 300,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#000000",
  },
  mediaPreview: {
    width: "100%",
    height: "100%",
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666666",
    marginBottom: 4,
  },
  postInput: {
    minHeight: 40,
    fontSize: 16,
    color: "#000000",
    lineHeight: 20,
    textAlignVertical: "top",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  addSongButton: {
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  addSongText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginTop: 8,
  },
  addSongSubtext: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
    textAlign: "center",
  },
  selectedSongContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  selectedSongInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedSongArtwork: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderArtwork: {
    backgroundColor: "#E5E5E5",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedSongDetails: {
    flex: 1,
  },
  selectedSongTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  selectedSongArtist: {
    fontSize: 14,
    color: "#666666",
  },
  removeSongButton: {
    marginLeft: 12,
  },
  videoContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  videoOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
    backgroundColor: "transparent",
  },
  muteButton: {
    position: "absolute",
    bottom: 12,
    right: 12,
    zIndex: 10,
  },
  muteButtonBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 20,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  playPauseIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    zIndex: 6,
  },
  playPauseBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 25,
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CreatePostPage;

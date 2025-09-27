import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  Modal,
  TextInput,
  Text,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { VideoView, useVideoPlayer } from "expo-video";
import { createPost } from "@/api";
import SongSearchModal from "./SongSearchModal";
import { Song } from "@/utils/musicService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  onPostCreated?: () => void; // Callback for when post is successfully created
}

const PostModal: React.FC<PostModalProps> = ({
  visible,
  onClose,
  onPostCreated,
}) => {
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [postText, setPostText] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [showMediaSelector, setShowMediaSelector] = useState(true);
  const [showSongSearch, setShowSongSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create video player for selected video
  const player = useVideoPlayer(
    selectedMedia && mediaType === "video" ? selectedMedia : "",
    (player) => {
      player.loop = false;
    }
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

        setSelectedMedia(selectedAsset.uri);
        setMediaType(selectedAsset.type === "video" ? "video" : "image");
        setShowMediaSelector(false);
      }
    } catch (error) {
      console.error("Error selecting media:", error);
      Alert.alert("Error", "Failed to select media");
    }
  };

  const handleSongSelect = (song: Song) => {
    setSelectedSong(song);
    setShowSongSearch(false);
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

      Alert.alert("Success", "Post created successfully!", [
        {
          text: "OK",
          onPress: () => {
            handleModalClose();
            onPostCreated?.();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Error creating post:", error);
      const errorMessage =
        error.response?.data?.error ||
        "Failed to create post. Please try again.";
      Alert.alert("Error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setSelectedMedia(null);
    setMediaType(null);
    setPostText("");
    setSelectedSong(null);
    setShowMediaSelector(true);
    setShowSongSearch(false);
    setIsSubmitting(false);
    onClose();
  };

  const handleBackToMediaSelection = () => {
    setSelectedMedia(null);
    setMediaType(null);
    setShowMediaSelector(true);
  };

  const renderMediaPreview = () => {
    if (!selectedMedia) return null;

    if (mediaType === "video") {
      return (
        <VideoView
          style={styles.mediaPreview}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
        />
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
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleModalClose}>
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}>
          {showMediaSelector ? (
            // Media Selection Screen
            <>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={handleModalClose}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Select Media</Text>
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
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={handleBackToMediaSelection}
                  disabled={isSubmitting}>
                  <Text
                    style={[
                      styles.modalButton,
                      isSubmitting && styles.disabledButton,
                    ]}>
                    Back
                  </Text>
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Create Post</Text>
                <TouchableOpacity
                  onPress={handlePostSubmit}
                  disabled={isSubmitting}>
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                  ) : (
                    <Text style={[styles.modalButton, styles.postButton]}>
                      Post
                    </Text>
                  )}
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalContent}
                showsVerticalScrollIndicator={false}>
                {/* Media Preview */}
                {selectedMedia && (
                  <View style={styles.mediaPreviewContainer}>
                    {renderMediaPreview()}
                  </View>
                )}

                {/* Caption Input */}
                <View style={styles.inputSection}>
                  <Text style={styles.inputLabel}>Caption</Text>
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
                  <Text style={styles.inputLabel}>Song (Optional)</Text>

                  {selectedSong ? (
                    renderSelectedSong()
                  ) : (
                    <TouchableOpacity
                      style={styles.addSongButton}
                      onPress={() => setShowSongSearch(true)}
                      disabled={isSubmitting}>
                      <Ionicons
                        name="musical-notes"
                        size={24}
                        color="#007AFF"
                      />
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
      </Modal>

      {/* Song Search Modal */}
      <Modal
        visible={showSongSearch}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSongSearch(false)}>
        <SongSearchModal
          visible={showSongSearch}
          onClose={() => setShowSongSearch(false)}
          onSongSelect={handleSongSelect}
          selectedSong={selectedSong}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingTop: 60,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  modalButton: {
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
  modalContent: {
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
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 8,
  },
  postInput: {
    minHeight: 100,
    fontSize: 16,
    color: "#000000",
    lineHeight: 24,
    textAlignVertical: "top",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    padding: 16,
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
});

export default PostModal;

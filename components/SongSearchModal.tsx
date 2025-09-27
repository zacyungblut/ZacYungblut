import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { musicService, Song } from "@/utils/musicService";

interface SongSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onSongSelect: (song: Song) => void;
  selectedSong?: Song | null;
}

const SongSearchModal: React.FC<SongSearchModalProps> = ({
  visible,
  onClose,
  onSongSelect,
  selectedSong,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<Song | null>(
    null
  );
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);

  // Create audio player for preview playback
  const player = useAudioPlayer(currentlyPlayingSong?.previewUrl || "");
  const playerStatus = useAudioPlayerStatus(player);

  useEffect(() => {
    // Reset currently playing when player finishes
    if (
      playerStatus.isLoaded &&
      !playerStatus.playing &&
      playerStatus.currentTime > 0
    ) {
      setCurrentlyPlayingSong(null);
    }
  }, [playerStatus.playing, playerStatus.currentTime, playerStatus.isLoaded]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSongs([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await musicService.searchSongs(searchQuery, 20);
      setSongs(results);
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert("Error", "Failed to search songs. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlayPreview = async (song: Song) => {
    try {
      if (!song.previewUrl) {
        Alert.alert(
          "No Preview",
          "This song does not have a preview available."
        );
        return;
      }

      // If this song is already playing, pause it
      if (currentlyPlayingSong?.id === song.id && playerStatus.playing) {
        player.pause();
        return;
      }

      // If a different song is playing, stop it and play the new one
      if (currentlyPlayingSong?.id !== song.id) {
        setIsLoadingAudio(song.id);
        setCurrentlyPlayingSong(song);

        // The player will automatically load the new source from the useAudioPlayer hook
        // Wait a moment for the player to load the new source
        setTimeout(() => {
          setIsLoadingAudio(null);
          player.play();
        }, 500);
      } else {
        // Same song, just resume playback
        player.play();
      }
    } catch (error) {
      console.error("Error playing preview:", error);
      setIsLoadingAudio(null);
      Alert.alert("Error", "Failed to play song preview.");
    }
  };

  const handleStopPreview = () => {
    player.pause();
  };

  const handleSongSelect = (song: Song) => {
    // Stop any playing audio when selecting a song
    if (playerStatus.playing) {
      player.pause();
    }
    setCurrentlyPlayingSong(null);

    onSongSelect(song);
    onClose();
  };

  const renderSongItem = ({ item: song }: { item: Song }) => {
    const isPlaying =
      currentlyPlayingSong?.id === song.id && playerStatus.playing;
    const isLoading = isLoadingAudio === song.id;
    const isSelected = selectedSong?.id === song.id;
    const isPaused =
      currentlyPlayingSong?.id === song.id &&
      !playerStatus.playing &&
      playerStatus.currentTime > 0;

    return (
      <TouchableOpacity
        style={[styles.songItem, isSelected && styles.selectedSongItem]}
        onPress={() => handleSongSelect(song)}
        activeOpacity={0.7}>
        <View style={styles.songInfo}>
          {song.artworkUrl ? (
            <Image source={{ uri: song.artworkUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.placeholderArtwork]}>
              <Ionicons name="musical-notes" size={24} color="#999" />
            </View>
          )}

          <View style={styles.songDetails}>
            <Text style={styles.songTitle} numberOfLines={1}>
              {song.title}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1}>
              {song.artist}
            </Text>
            <Text style={styles.songDuration}>
              {musicService.formatDuration(song.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.songActions}>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
          )}

          {song.previewUrl && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={() =>
                isPlaying ? handleStopPreview() : handlePlayPreview(song)
              }
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons
                  name={isPlaying ? "pause" : "play"}
                  size={20}
                  color="#007AFF"
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Search Songs</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#999"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for songs..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery("");
                setSongs([]);
              }}
              style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.searchButton}
          onPress={handleSearch}
          disabled={isSearching || !searchQuery.trim()}>
          {isSearching ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.searchButtonText}>Search</Text>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>Searching songs...</Text>
          </View>
        ) : songs.length > 0 ? (
          <FlatList
            data={songs}
            renderItem={renderSongItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.songsList}
          />
        ) : searchQuery.trim() ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-notes-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No songs found</Text>
            <Text style={styles.emptySubtext}>Try a different search term</Text>
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>Search for songs</Text>
            <Text style={styles.emptySubtext}>
              Find the perfect song for your post
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingTop: 60,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  cancelButton: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: "#000000",
  },
  clearButton: {
    marginLeft: 8,
  },
  searchButton: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 80,
  },
  searchButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666666",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999999",
    marginTop: 8,
    textAlign: "center",
  },
  songsList: {
    paddingHorizontal: 20,
  },
  songItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  selectedSongItem: {
    backgroundColor: "#F0F8FF",
  },
  songInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  artwork: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  placeholderArtwork: {
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
  },
  songDetails: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 2,
  },
  songArtist: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 2,
  },
  songDuration: {
    fontSize: 12,
    color: "#999999",
  },
  songActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default SongSearchModal;

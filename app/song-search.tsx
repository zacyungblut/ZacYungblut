import React, { useState, useEffect, useRef } from "react";
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
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createAudioPlayer, AudioPlayer } from "expo-audio";
import { searchSongs } from "@/api";
import { router, useLocalSearchParams } from "expo-router";
import { SUGGESTED_SONGS, Song } from "@/constants/SuggestedSongs";

const SongSearchPage: React.FC = () => {
  const params = useLocalSearchParams();
  const returnTo = params.returnTo as string;

  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentlyPlayingSong, setCurrentlyPlayingSong] = useState<Song | null>(
    null
  );
  const [isLoadingAudio, setIsLoadingAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Use ref to maintain a single audio player instance
  const playerRef = useRef<AudioPlayer | null>(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch (error) {
          console.log("Error cleaning up audio:", error);
        }
        playerRef.current = null;
      }
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSongs([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await searchSongs(searchQuery, 20);
      const results = response.data.songs || [];
      setSongs(results);

      if (results.length === 0) {
        console.log("No songs found for query:", searchQuery);
      }
    } catch (error) {
      console.error("Search error:", error);
      Alert.alert(
        "Search Unavailable",
        "Song search is currently unavailable. Please try again later or skip adding a song to your post."
      );
      setSongs([]);
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
      if (currentlyPlayingSong?.id === song.id && isPlaying) {
        try {
          if (playerRef.current) {
            playerRef.current.pause();
            setIsPlaying(false);
          }
        } catch (error) {
          console.log("Error pausing audio:", error);
          setCurrentlyPlayingSong(null);
          setIsPlaying(false);
        }
        return;
      }

      setIsLoadingAudio(song.id);

      // Stop and release current player if it exists
      if (playerRef.current) {
        try {
          playerRef.current.pause();
          playerRef.current.release();
        } catch (error) {
          console.log("Error stopping current audio:", error);
        }
        playerRef.current = null;
      }

      // Create new player with the song's preview URL
      try {
        playerRef.current = createAudioPlayer(song.previewUrl);
        setCurrentlyPlayingSong(song);

        // Wait a moment for the player to initialize
        setTimeout(async () => {
          try {
            if (playerRef.current) {
              await playerRef.current.play();
              setIsPlaying(true);
              setIsLoadingAudio(null);
            }
          } catch (error) {
            console.log("Error playing audio:", error);
            setCurrentlyPlayingSong(null);
            setIsPlaying(false);
            setIsLoadingAudio(null);
            Alert.alert("Playback Error", "Unable to play this preview.");
          }
        }, 500);
      } catch (error) {
        console.log("Error creating audio player:", error);
        setCurrentlyPlayingSong(null);
        setIsPlaying(false);
        setIsLoadingAudio(null);
        Alert.alert("Playback Error", "Unable to create audio player.");
      }
    } catch (error) {
      console.error("Error playing preview:", error);
      setIsLoadingAudio(null);
      setCurrentlyPlayingSong(null);
      setIsPlaying(false);
      Alert.alert("Error", "Failed to play song preview.");
    }
  };

  const handleStopPreview = () => {
    try {
      if (playerRef.current) {
        playerRef.current.pause();
        setIsPlaying(false);
      }
    } catch (error) {
      console.log("Error stopping preview:", error);
      setCurrentlyPlayingSong(null);
      setIsPlaying(false);
    }
  };

  const handleSongSelect = (song: Song) => {
    // Stop any playing audio when selecting a song
    if (playerRef.current && isPlaying) {
      try {
        playerRef.current.pause();
      } catch (error) {
        console.log("Error stopping audio on select:", error);
      }
    }
    setCurrentlyPlayingSong(null);
    setIsPlaying(false);

    // Pass the selected song back to the create post page
    router.back();

    // Use a timeout to ensure navigation completes before setting the song
    setTimeout(() => {
      router.setParams({
        selectedSong: JSON.stringify({
          id: song.id,
          title: song.title,
          artist: song.artist,
          album: song.album,
          duration: song.duration,
          previewUrl: song.previewUrl,
          artworkUrl: song.artworkUrl,
          appleMusicUrl: song.appleMusicUrl,
        }),
      });
    }, 100);
  };

  const handleClose = () => {
    // Stop any playing audio when closing
    if (playerRef.current && isPlaying) {
      try {
        playerRef.current.pause();
      } catch (error) {
        console.log("Error stopping audio on close:", error);
      }
    }
    setCurrentlyPlayingSong(null);
    setIsPlaying(false);
    router.back();
  };

  const formatDuration = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const renderSongItem = ({ item: song }: { item: Song }) => {
    const songIsPlaying = currentlyPlayingSong?.id === song.id && isPlaying;
    const songIsLoading = isLoadingAudio === song.id;

    return (
      <TouchableOpacity
        style={styles.songItem}
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
              {formatDuration(song.duration)}
            </Text>
          </View>
        </View>

        <View style={styles.songActions}>
          {song.previewUrl && (
            <TouchableOpacity
              style={styles.playButton}
              onPress={(e) => {
                e.stopPropagation(); // Prevent song selection when tapping play
                songIsPlaying ? handleStopPreview() : handlePlayPreview(song);
              }}
              disabled={songIsLoading}>
              {songIsLoading ? (
                <ActivityIndicator size="small" color="#007AFF" />
              ) : (
                <Ionicons
                  name={songIsPlaying ? "pause" : "play"}
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose}>
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
            <Text style={styles.emptySubtext}>
              Try a different search term or check back later
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.suggestedHeader}>
              <Text style={styles.suggestedTitle}>Suggested Songs</Text>
              <Text style={styles.suggestedSubtext}>
                Popular picks to get you started
              </Text>
            </View>
            <FlatList
              data={SUGGESTED_SONGS}
              renderItem={renderSongItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.songsList}
            />
          </>
        )}
      </View>
    </SafeAreaView>
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
  suggestedHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestedTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  suggestedSubtext: {
    fontSize: 14,
    color: "#666666",
  },
});

export default SongSearchPage;

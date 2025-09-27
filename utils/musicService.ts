import axios from "axios";

// Apple Music API configuration
const APPLE_MUSIC_API_BASE = "https://api.music.apple.com/v1";

// You'll need to get this from Apple Developer Console
// For development, you can use MusicKit JS which handles token generation
const DEVELOPER_TOKEN = process.env.EXPO_PUBLIC_APPLE_MUSIC_TOKEN || "";

interface AppleMusicSong {
  id: string;
  type: string;
  attributes: {
    name: string;
    artistName: string;
    albumName: string;
    durationInMillis: number;
    previews?: Array<{
      url: string;
    }>;
    artwork?: {
      url: string;
      width: number;
      height: number;
    };
    url?: string; // Apple Music deep link
  };
}

interface AppleMusicSearchResponse {
  results: {
    songs?: {
      data: AppleMusicSong[];
    };
  };
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  previewUrl?: string;
  artworkUrl?: string;
  appleMusicUrl?: string;
}

class MusicService {
  private apiClient = axios.create({
    baseURL: APPLE_MUSIC_API_BASE,
    headers: {
      Authorization: `Bearer ${DEVELOPER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  async searchSongs(query: string, limit: number = 10): Promise<Song[]> {
    try {
      if (!query.trim()) {
        return [];
      }

      const response = await this.apiClient.get<AppleMusicSearchResponse>(
        `/catalog/us/search`,
        {
          params: {
            term: query,
            types: "songs",
            limit,
          },
        }
      );

      const songs = response.data.results.songs?.data || [];

      return songs.map(this.mapAppleMusicSongToSong);
    } catch (error) {
      console.error("Error searching songs:", error);

      // Fallback to mock data for development/testing
      if (__DEV__) {
        return this.getMockSongs(query);
      }

      throw new Error("Failed to search songs");
    }
  }

  private mapAppleMusicSongToSong(appleSong: AppleMusicSong): Song {
    const artworkUrl = appleSong.attributes.artwork?.url
      ? appleSong.attributes.artwork.url
          .replace("{w}", "300")
          .replace("{h}", "300")
      : undefined;

    return {
      id: appleSong.id,
      title: appleSong.attributes.name,
      artist: appleSong.attributes.artistName,
      album: appleSong.attributes.albumName,
      duration: appleSong.attributes.durationInMillis,
      previewUrl: appleSong.attributes.previews?.[0]?.url,
      artworkUrl,
      appleMusicUrl: appleSong.attributes.url,
    };
  }

  // Mock data for development/testing when Apple Music API is not available
  private getMockSongs(query: string): Song[] {
    const mockSongs: Song[] = [
      {
        id: "mock-1",
        title: `${query} - Song 1`,
        artist: "Mock Artist 1",
        album: "Mock Album 1",
        duration: 180000,
        previewUrl:
          "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/62/0c/c1/620cc15f-74dc-5d9b-9a71-8cc1b6ac9b5e/mzaf_18151178205273265836.plus.aac.ep.m4a",
        artworkUrl:
          "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/62/0c/c1/620cc15f-74dc-5d9b-9a71-8cc1b6ac9b5e/886448735861.jpg/300x300bb.jpg",
      },
      {
        id: "mock-2",
        title: `${query} - Song 2`,
        artist: "Mock Artist 2",
        album: "Mock Album 2",
        duration: 210000,
        previewUrl:
          "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/62/0c/c1/620cc15f-74dc-5d9b-9a71-8cc1b6ac9b5e/mzaf_18151178205273265836.plus.aac.ep.m4a",
        artworkUrl:
          "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/62/0c/c1/620cc15f-74dc-5d9b-9a71-8cc1b6ac9b5e/886448735861.jpg/300x300bb.jpg",
      },
    ];

    return mockSongs;
  }

  formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

export const musicService = new MusicService();

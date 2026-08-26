import { google, youtube_v3 } from "googleapis";

export interface YouTubeSearchResult {
  videoId: string;
  title: string;
  thumbnail: string;
  duration: number;
  channelTitle: string;
}

export class Youtube {
  private readonly client: youtube_v3.Youtube;

  constructor() {
    this.client = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });
  }

  async search(query: string): Promise<YouTubeSearchResult[]> {
    const response = await this.client.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: 10,
    });

    const videoIds = response.data.items
      ?.map((item) => item.id?.videoId)
      .filter(Boolean) as string[];

    if (videoIds.length === 0) {
      return [];
    }

    const detailsResponse = await this.client.videos.list({
      part: ["contentDetails", "snippet"],
      id: videoIds,
    });

    return (
      detailsResponse.data.items?.map((item) => ({
        videoId: item.id!,
        title: item.snippet?.title || "Unknown",
        thumbnail: item.snippet?.thumbnails?.medium?.url || "",
        duration: this.parseDuration(item.contentDetails?.duration || "PT0S"),
        channelTitle: item.snippet?.channelTitle || "Unknown",
      })) || []
    );
  }

  private parseDuration(isoDuration: string): number {
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    return hours * 3600 + minutes * 60 + seconds;
  }
}

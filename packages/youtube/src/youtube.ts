import { google, youtube_v3 } from "googleapis";
import { YouTubeSearchResult } from "./type";

export class Youtube {
  private readonly client: youtube_v3.Youtube;

  constructor(public apiKey: string) {
    this.client = google.youtube({
      version: "v3",
      auth: this.apiKey,
    });
  }

  async search(query: string): Promise<YouTubeSearchResult[]> {
    const response = await this.client.search.list({
      part: ["snippet"],
      q: query,
      type: ["video"],
      maxResults: 10,
    });

    return this.getVideoDetails(
      response.data.items
        ?.map((item) => item.id?.videoId)
        .filter(Boolean) as string[],
    );
  }

  async categories() {
    const response = await this.client.videoCategories.list({
      part: ["snippet"],
      regionCode: "VN",
    });

    return (
      response.data.items?.map((item) => ({
        id: item.id!,
        title: item.snippet?.title || "Unknown",
      })) || []
    );
  }

  async trending() {
    const response = await this.client.videos.list({
      part: ["snippet", "contentDetails"],
      chart: "mostPopular",
      regionCode: "VN",
      maxResults: 10,
    });

    return (
      response.data.items?.map((item) => ({
        videoId: item.id!,
        title: item.snippet?.title || "Unknown",
        thumbnail: item.snippet?.thumbnails?.medium?.url || "",
        duration: this.parseDuration(item.contentDetails?.duration || "PT0S"),
        channelTitle: item.snippet?.channelTitle || "Unknown",
      })) || []
    );
  }

  private async getVideoDetails(videoIds: string[]) {
    if (!videoIds.length) return [];

    const response = await this.client.videos.list({
      part: ["contentDetails", "snippet"],
      id: videoIds,
    });

    return (
      response.data.items?.map((item) => ({
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

    return (
      Number(match[1] || 0) * 3600 +
      Number(match[2] || 0) * 60 +
      Number(match[3] || 0)
    );
  }
}

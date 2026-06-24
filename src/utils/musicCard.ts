import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

const CANVAS_W = 1200;
const CANVAS_H = 300;
const ART_SIZE = 200;
const ART_RADIUS = 15;
const ART_X = 50;
const ART_Y = 50;
const INFO_X = ART_X + ART_SIZE + 40;
const BAR_H = 12;
const BAR_RADIUS = 6;
const BAR_Y = 160;

function tryExtractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com")) return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch (_) {
    if (/^[\w-]{11}$/.test(url)) return url;
  }
  return null;
}

async function fetchImageBuffer(url: string, timeout = 2500): Promise<Buffer | null> {
  try {
    const resp = await axios.get(url, {
      responseType: "arraybuffer",
      timeout,
      maxContentLength: 5 * 1024 * 1024,
      headers: { "User-Agent": "Mozilla/5.0" },
      validateStatus: (s) => s >= 200 && s < 400,
    });
    return Buffer.from(resp.data);
  } catch {
    return null;
  }
}

async function getYouTubeThumbnail(videoId: string): Promise<Buffer | null> {
  if (!videoId) return null;
  const candidates = [
    `https://i.ytimg.com/vi_webp/${videoId}/maxresdefault.webp`,
    `https://i.ytimg.com/vi_webp/${videoId}/hqdefault.webp`,
    `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${videoId}/sddefault.jpg`,
  ];
  for (const url of candidates) {
    const buf = await fetchImageBuffer(url);
    if (buf && buf.length > 5000) return buf;
  }
  return null;
}

function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const THUMBNAIL_WHITELIST = new Set([
  "i.ytimg.com", "ytimg.com", "yt3.ggpht.com", "img.youtube.com",
]);

function isAllowedThumbnailUrl(url: string): boolean {
  if (typeof url !== "string" || !url) return false;
  try {
    const parsed = new URL(url);
    return THUMBNAIL_WHITELIST.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

interface CardOptions {
  thumbnailURL?: string;
  trackURI?: string;
  songTitle?: string;
  songArtist?: string;
  trackRequester?: string;
  isPlaying?: boolean;
  showVisualizer?: boolean;
  currentPositionMs?: number;
  totalDurationMs?: number;
  thumbnailBuffer?: Buffer | null;
}

export async function fetchTrackThumbnailBuffer(
  trackURI: string,
  thumbnailURL: string,
): Promise<Buffer | null> {
  let buffer: Buffer | null = null;
  const ytId = tryExtractYouTubeId(trackURI) || tryExtractYouTubeId(thumbnailURL);
  if (ytId) buffer = await getYouTubeThumbnail(ytId);
  if (!buffer && typeof thumbnailURL === "string" && thumbnailURL.startsWith("http") && isAllowedThumbnailUrl(thumbnailURL)) {
    buffer = await fetchImageBuffer(thumbnailURL);
  }
  return buffer;
}

function fitText(ctx: any, text: string, font: string, maxWidth: number): string {
  if (!text) return "Unknown";
  ctx.font = font;
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 1) {
    const test = truncated.slice(0, -1) + "...";
    if (ctx.measureText(test).width <= maxWidth) return test;
    truncated = truncated.slice(0, -1);
  }
  return truncated + "...";
}

export class EnhancedMusicCard {
  async generateCard(options: CardOptions): Promise<Buffer> {
    const cfg = {
      width: CANVAS_W,
      height: CANVAS_H,
      thumbnailURL: typeof options.thumbnailURL === "string" ? options.thumbnailURL : "",
      trackURI: typeof options.trackURI === "string" ? options.trackURI : "",
      songTitle: options.songTitle || "Unknown Track",
      songArtist: options.songArtist || "Unknown Artist",
      currentPositionMs: Number.isFinite(options.currentPositionMs) ? options.currentPositionMs! : 0,
      totalDurationMs: Number.isFinite(options.totalDurationMs) ? options.totalDurationMs! : 0,
    };

    try {
      const thumbnailBuffer = options.thumbnailBuffer ?? (await fetchTrackThumbnailBuffer(cfg.trackURI, cfg.thumbnailURL));

      const canvas = createCanvas(cfg.width, cfg.height);
      const ctx = canvas.getContext("2d");

      let bgImage: any = null;
      if (thumbnailBuffer && thumbnailBuffer.length > 5000) {
        try {
          bgImage = await loadImage(thumbnailBuffer);
        } catch {
          bgImage = null;
        }
      }

      if (bgImage) {
        ctx.save();
        ctx.filter = "blur(25px)";
        ctx.drawImage(bgImage, 0, 0, cfg.width, cfg.height);
        ctx.restore();
      } else {
        ctx.fillStyle = "#0a0a0a";
        ctx.fillRect(0, 0, cfg.width, cfg.height);
      }

      ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
      ctx.fillRect(0, 0, cfg.width, cfg.height);

      await this.drawThumbnail(ctx, cfg, thumbnailBuffer!);
      this.drawOverlayText(ctx, cfg);

      return canvas.toBuffer("image/png");
    } catch (error) {
      return generateErrorCard("Failed to render music card");
    }
  }

  private async drawThumbnail(ctx: any, cfg: any, thumbnailBuffer: Buffer | null): Promise<void> {
    const size = ART_SIZE;
    const x = ART_X;
    const y = ART_Y;
    const radius = ART_RADIUS;

    if (!thumbnailBuffer || thumbnailBuffer.length <= 5000) return;

    try {
      const img = await loadImage(thumbnailBuffer);
      const srcW = img.width;
      const srcH = img.height;
      const scale = Math.max(size / srcW, size / srcH);
      const sw = Math.min(srcW, size / scale);
      const sh = Math.min(srcH, size / scale);
      const sx = Math.max(0, (srcW - sw) / 2);
      const sy = Math.max(0, (srcH - sh) / 2);

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.clip();
      ctx.drawImage(img, sx, sy, sw, sh, x, y, size, size);
      ctx.restore();
    } catch {
      // silently skip if thumbnail fails to load
    }
  }

  private drawOverlayText(ctx: any, cfg: any): void {
    const infoX = INFO_X;
    const barY = BAR_Y;
    const maxTextWidth = cfg.width - infoX - 50;

    const title = fitText(ctx, cfg.songTitle, "bold 36px 'Inter', 'Segoe UI', system-ui, sans-serif", maxTextWidth);
    ctx.save();
    ctx.font = "bold 36px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(title, infoX, 60);
    ctx.restore();

    const artist = fitText(ctx, cfg.songArtist, "24px 'Inter', 'Segoe UI', system-ui, sans-serif", maxTextWidth);
    ctx.save();
    ctx.font = "24px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.fillStyle = "rgba(180, 180, 180, 1)";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.fillText(artist, infoX, 110);
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(infoX, barY, maxTextWidth, BAR_H, BAR_RADIUS);
    ctx.fillStyle = "rgba(255, 255, 255, 0.16)";
    ctx.fill();
    ctx.restore();

    if (cfg.totalDurationMs > 0) {
      const progressRatio = clamp(cfg.currentPositionMs / cfg.totalDurationMs, 0, 1);
      const progressWidth = Math.round(maxTextWidth * progressRatio);
      if (progressWidth > 0) {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(infoX, barY, progressWidth, BAR_H, BAR_RADIUS);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
      }

      ctx.save();
      ctx.font = "20px 'Inter', 'Segoe UI', system-ui, sans-serif";
      ctx.fillStyle = "rgba(200, 200, 200, 1)";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillText(formatDuration(cfg.currentPositionMs), infoX, barY + BAR_H + 8);
      ctx.textAlign = "right";
      ctx.fillText(formatDuration(cfg.totalDurationMs), infoX + maxTextWidth, barY + BAR_H + 8);
      ctx.restore();
    }
  }
}

function generateErrorCard(message: string): Buffer {
  const W = 600;
  const H = 200;
  try {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.roundRect(10, 10, W - 20, H - 20, 16);
    ctx.fill();
    ctx.fillStyle = "#e11d2e";
    ctx.font = "bold 24px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✖ " + message, W / 2, H / 2);
    return canvas.toBuffer("image/png");
  } catch {
    return Buffer.alloc(0);
  }
}

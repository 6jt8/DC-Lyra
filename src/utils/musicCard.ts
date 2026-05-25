import { createCanvas, loadImage } from "@napi-rs/canvas";
import axios from "axios";

const THEME = {
  cardA: "#f6f4ef",
  cardB: "#ece8e3",
  cardBorder: "rgba(255, 255, 255, 0.70)",
  cardInnerBorder: "rgba(0, 0, 0, 0.06)",
  cardEdge: "rgba(0, 0, 0, 0.20)",
  title: "#161616",
  artist: "#2e2e2e",
  requester: "#5f5f5f",
  rail: "rgba(0, 0, 0, 0.14)",
  fill: "#111111",
  knob: "#111111",
};

function tryExtractYouTubeId(url: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com"))
      return u.searchParams.get("v");
    if (u.hostname === "youtu.be") return u.pathname.slice(1);
  } catch (_) {
    if (/^[\w-]{11}$/.test(url)) return url;
  }
  return null;
}

async function fetchImageBuffer(
  url: string,
  timeout = 2500
): Promise<Buffer | null> {
  try {
    const resp = await axios.get(url, {
      responseType: "arraybuffer",
      timeout,
      maxContentLength: 5 * 1024 * 1024,
      headers: { "User-Agent": "Mozilla/5.0" },
      validateStatus: (status) => status >= 200 && status < 400,
    });
    return Buffer.from(resp.data);
  } catch (_) {
    return null;
  }
}

async function getYouTubeThumbnail(
  videoId: string
): Promise<Buffer | null> {
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
    const buffer = await fetchImageBuffer(url);
    if (buffer && buffer.length > 5000) return buffer;
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
  if (h > 0)
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
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
}

export class EnhancedMusicCard {
  async generateCard(options: CardOptions): Promise<Buffer> {
    const cfg = {
      width: 900,
      height: 300,
      thumbnailURL: typeof options.thumbnailURL === "string" ? options.thumbnailURL : "",
      trackURI: typeof options.trackURI === "string" ? options.trackURI : (typeof options.thumbnailURL === "string" ? options.thumbnailURL : "") || "",
      songTitle: options.songTitle || "Unknown Track",
      songArtist: options.songArtist || "Unknown Artist",
      trackRequester: options.trackRequester || "Unknown",
      currentPositionMs: Number.isFinite(options.currentPositionMs)
        ? options.currentPositionMs!
        : 0,
      totalDurationMs: Number.isFinite(options.totalDurationMs)
        ? options.totalDurationMs!
        : 0,
    };

    try {
      const canvas = createCanvas(cfg.width, cfg.height);
      const ctx = canvas.getContext("2d");

      const card = this.drawMainCard(ctx, cfg);
      const thumb = await this.drawThumbnail(ctx, cfg, card);
      this.drawTrackMeta(ctx, cfg, card, thumb);

      return canvas.toBuffer("image/png");
    } catch (error) {
      return generateErrorCard("Failed to render music card");
    }
  }

  drawMainCard(ctx: any, cfg: any): { x: number; y: number; w: number; h: number } {
    const W = cfg.width;
    const H = cfg.height;
    const M = 10;
    const R = 20;

    ctx.save();

    const cardX = M;
    const cardY = M;
    const cardW = W - M * 2;
    const cardH = H - M * 2;

    ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 4;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, R);
    const grad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    grad.addColorStop(0, THEME.cardA);
    grad.addColorStop(1, THEME.cardB);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.shadowColor = "transparent";

    ctx.strokeStyle = THEME.cardBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, R);
    ctx.stroke();

    ctx.strokeStyle = THEME.cardInnerBorder;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cardX + 1, cardY + 1, cardW - 2, cardH - 2, R - 1);
    ctx.stroke();

    ctx.restore();
    return { x: cardX, y: cardY, w: cardW, h: cardH };
  }

  async drawThumbnail(ctx: any, cfg: any, card: any): Promise<{ x: number; y: number; size: number }> {
    const size = 200;
    const x = card.x + 24;
    const y = card.y + 50;
    const radius = 16;

    const THUMBNAIL_WHITELIST = new Set([
      "i.ytimg.com",
      "ytimg.com",
      "yt3.ggpht.com",
      "img.youtube.com",
    ]);

    function isAllowedThumbnailUrl(url: string): boolean {
      if (typeof url !== "string" || !url) return false;
      try {
        const parsed = new URL(url);
        return THUMBNAIL_WHITELIST.has(parsed.hostname.toLowerCase());
      } catch (_) {
        return false;
      }
    }

    let buffer: Buffer | null = null;
    const ytId =
      tryExtractYouTubeId(cfg.trackURI) ||
      tryExtractYouTubeId(cfg.thumbnailURL);
    if (ytId) buffer = await getYouTubeThumbnail(ytId);

    if (
      !buffer &&
      typeof cfg.thumbnailURL === "string" &&
      cfg.thumbnailURL.startsWith("http") &&
      isAllowedThumbnailUrl(cfg.thumbnailURL)
    ) {
      const candidates = [cfg.thumbnailURL];
      if (ytId) {
        candidates.push(
          `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`
        );
        candidates.push(
          `https://i.ytimg.com/vi/${ytId}/mqdefault.jpg`
        );
      }
      for (const url of candidates) {
        buffer = await fetchImageBuffer(url);
        if (buffer && buffer.length > 5000) break;
      }
    }

    if (buffer && buffer.length > 5000) {
      try {
        const img = await loadImage(buffer);
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

        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.stroke();

        return { x, y, size };
      } catch (_) {}
    }

    if (
      typeof cfg.thumbnailURL === "string" &&
      cfg.thumbnailURL.startsWith("http") &&
      isAllowedThumbnailUrl(cfg.thumbnailURL)
    ) {
      try {
        const img = await loadImage(cfg.thumbnailURL);
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

        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y, size, size, radius);
        ctx.stroke();

        return { x, y, size };
      } catch (_) {}
    }

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    ctx.fill();
    ctx.strokeStyle = "rgba(0, 0, 0, 0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, size, size, radius);
    ctx.stroke();

    const cx = x + size / 2;
    const cy = y + size / 2;
    const triSize = 32;
    ctx.fillStyle = "rgba(0, 0, 0, 0.20)";
    ctx.beginPath();
    ctx.moveTo(cx - triSize * 0.4, cy - triSize * 0.5);
    ctx.lineTo(cx - triSize * 0.4, cy + triSize * 0.5);
    ctx.lineTo(cx + triSize * 0.5, cy);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    return { x, y, size };
  }

  drawTrackMeta(ctx: any, cfg: any, card: any, thumb: any): void {
    const leftEdge = thumb.x + thumb.size + 20;
    const topY = card.y + 50;
    const cardRight = card.x + card.w - 24;

    ctx.save();

    const badgeX = leftEdge;
    const badgeY = topY;
    const badgeW = 116;
    const badgeH = 24;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 12);
    ctx.fillStyle = "#111111";
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("NOW PLAYING", badgeX + badgeW / 2, badgeY + badgeH / 2);

    const titleY = topY + 38;
    ctx.fillStyle = THEME.title;
    ctx.font = "bold 18px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    const title = truncateText(cfg.songTitle, 34);
    ctx.fillText(title, leftEdge, titleY);

    const artistY = titleY + 26;
    ctx.fillStyle = THEME.artist;
    ctx.font = "13px 'Inter', 'Segoe UI', system-ui, sans-serif";
    const artist = truncateText(cfg.songArtist, 40);
    ctx.fillText(artist, leftEdge, artistY);

    const badgeArtistX = leftEdge + ctx.measureText(artist).width + 8;
    const badgeArtistY = artistY + 1;
    const badgeArtistW = 56;
    const badgeArtistH = 18;
    ctx.beginPath();
    ctx.roundRect(badgeArtistX, badgeArtistY, badgeArtistW, badgeArtistH, 9);
    ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
    ctx.fill();
    ctx.fillStyle = "#5f5f5f";
    ctx.font = "bold 9px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.fillText("ARTIST", badgeArtistX + badgeArtistW / 2, badgeArtistY + badgeArtistH / 2);

    const requesterY = artistY + 24;
    const requesterText = truncateText(
      cfg.trackRequester ? `Requested by ${cfg.trackRequester}` : "",
      48
    );
    if (requesterText) {
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = THEME.requester;
      ctx.font = "11px 'Inter', 'Segoe UI', system-ui, sans-serif";
      const textWidth = ctx.measureText(requesterText).width;
      const centerX = thumb.x + thumb.size + 20 + textWidth / 2;
      ctx.fillText(requesterText, centerX, requesterY);
    }

    const dur = formatDuration(cfg.totalDurationMs);
    ctx.textAlign = "right";
    ctx.textBaseline = "bottom";
    ctx.fillStyle = "#8f8f8f";
    ctx.font = "bold 12px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.fillText(dur, cardRight, card.y + card.h - 36);

    if (cfg.showVisualizer !== false) {
      const vizY = requesterY + 24;
      const vizX = leftEdge;
      const vizW = Math.min(cardRight - leftEdge, 300);
      const vizH = 28;
      const barCount = 32;
      const barW = Math.max(3, (vizW - (barCount - 1) * 2) / barCount);
      const gap = 2;

      for (let i = 0; i < barCount; i++) {
        const barH = clamp(Math.random() * vizH, 4, vizH);
        const bx = vizX + i * (barW + gap);
        const by = vizY + vizH - barH;
        ctx.beginPath();
        ctx.roundRect(bx, by, barW, barH, 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${0.06 + 0.02 * i})`;
        ctx.fill();
      }
    }

    const progressY = card.y + card.h - 14;
    const progressX = leftEdge;
    const progressW = cardRight - leftEdge;
    ctx.beginPath();
    ctx.roundRect(progressX, progressY, progressW, 4, 2);
    ctx.fillStyle = THEME.rail;
    ctx.fill();

    ctx.restore();
  }
}

function truncateText(text: string, maxLen: number): string {
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "�";
}

function generateErrorCard(message: string): Buffer {
  const W = 600;
  const H = 200;
  try {
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f6f4ef";
    ctx.beginPath();
    ctx.roundRect(10, 10, W - 20, H - 20, 16);
    ctx.fill();
    ctx.fillStyle = "#e11d2e";
    ctx.font = "bold 24px 'Inter', 'Segoe UI', system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?? " + message, W / 2, H / 2);
    return canvas.toBuffer("image/png");
  } catch {
    return Buffer.alloc(0);
  }
}

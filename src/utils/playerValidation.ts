import { MessageFlags } from "discord.js";
import { getLang, getLangSync } from "./language.js";
import { cardFromMessage } from "../ui/responseHandler.js";

export async function checkQueue(
  player: any,
  customMessage: string | null = null,
  guildId: string | null = null
): Promise<{ valid: boolean; response?: any }> {
  if (!player || !player.queue || player.queue.length === 0) {
    let lang: any;
    try {
      lang = guildId ? await getLang(guildId) : getLangSync();
    } catch {
      lang = getLangSync();
    }

    const utils = lang?.utils || {};
    const validation = utils?.playerValidation || {
      queueEmpty: {
        title: "## ❌ Queue Empty",
        message:
          "The queue is empty. There are no songs available.",
        note: "Add some songs to the queue first using `/play`.",
      },
    };

    const message =
      customMessage ||
      `${validation.queueEmpty?.title || "## ❌ Queue Empty"}\n\n` +
        `${validation.queueEmpty?.message ||
          "The queue is empty. There are no songs available."}\n` +
        `${validation.queueEmpty?.note ||
          'Add some songs to the queue first using `/play`.'}`;

    return {
      valid: false,
      response: {
        components: [cardFromMessage(message, "Queue Empty")],
        flags: MessageFlags.IsComponentsV2,
      },
    };
  }

  return { valid: true };
}

export async function checkCurrentTrack(
  player: any,
  customMessage: string | null = null,
  guildId: string | null = null
): Promise<{ valid: boolean; response?: any }> {
  if (!player || !player.current) {
    let lang: any;
    try {
      lang = guildId ? await getLang(guildId) : getLangSync();
    } catch {
      lang = getLangSync();
    }

    const utils = lang?.utils || {};
    const validation = utils?.playerValidation || {
      noSongPlaying: {
        title: "## ❌ No Song Playing",
        message: "No song is currently playing.",
        note: "Use `/play` to start playing music.",
      },
    };

    const message =
      customMessage ||
      `${validation.noSongPlaying?.title ||
        "## ❌ No Song Playing"}\n\n` +
        `${validation.noSongPlaying?.message ||
          "No song is currently playing."}\n` +
        `${validation.noSongPlaying?.note ||
          "Use `/play` to start playing music."}`;

    return {
      valid: false,
      response: {
        components: [cardFromMessage(message, "No Song Playing")],
        flags: MessageFlags.IsComponentsV2,
      },
    };
  }

  return { valid: true };
}

export async function checkQueueOrTrack(
  player: any,
  customMessage: string | null = null,
  guildId: string | null = null
): Promise<{ valid: boolean; response?: any }> {
  if (
    !player ||
    (!player.current &&
      (!player.queue || player.queue.length === 0))
  ) {
    let lang: any;
    try {
      lang = guildId ? await getLang(guildId) : getLangSync();
    } catch {
      lang = getLangSync();
    }

    const utils = lang?.utils || {};
    const validation = utils?.playerValidation || {
      noMusicPlaying: {
        title: "## ❌ No Music Playing",
        message:
          "There is no music currently playing and the queue is empty.",
        note: "Use `/play` to start playing music.",
      },
    };

    const message =
      customMessage ||
      `${validation.noMusicPlaying?.title ||
        "## ❌ No Music Playing"}\n\n` +
        `${validation.noMusicPlaying?.message ||
          "There is no music currently playing and the queue is empty."}\n` +
        `${validation.noMusicPlaying?.note ||
          "Use `/play` to start playing music."}`;

    return {
      valid: false,
      response: {
        components: [
          cardFromMessage(message, "No Music Playing"),
        ],
        flags: MessageFlags.IsComponentsV2,
      },
    };
  }

  return { valid: true };
}

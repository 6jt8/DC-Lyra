import path from "path";
import { config } from "../config.js";

export const LOCAL_EMOJI_PATH = path.resolve(process.cwd(), config.applicationEmojis.emojiDir || "./icoms");

interface EmojiEntry {
  name: string;
  id: string;
  localFile: string;
}

interface EmojiDefinition {
  default: string;
  custom?: {
    redwhite?: EmojiEntry | string;
  };
}

const REDWHITE_CUSTOMS: Record<string, EmojiEntry> = {
  home: { name: "shome", id: "1496071469850165318", localFile: "shome.png" },
  help: { name: "sinfo", id: "1496071473767518349", localFile: "sinfo.png" },
  music: { name: "smusic", id: "1496071492570447984", localFile: "smusic.png" },
  playlist: { name: "sfolder2", id: "1496071456109367306", localFile: "sfolder2.png" },
  basic: { name: "ssetting", id: "1496071456109367306", localFile: "ssetting.png" },
  utility: { name: "stools", id: "1496071456109367306", localFile: "stools.png" },
  commands: { name: "sjs", id: "1496071475889836112", localFile: "sjs.png" },
  servers: { name: "sworld", id: "1496071456109367306", localFile: "sworld.png" },
  users: { name: "smembers", id: "1496071486463541249", localFile: "smembers.png" },
  uptime: { name: "stime", id: "1496071456109367306", localFile: "stime.png" },
  ping: { name: "sping", id: "1496071505736368250", localFile: "sping.png" },
  info: { name: "sinfo", id: "1496071473767518349", localFile: "sinfo.png" },
  support: { name: "spartner", id: "1496071499457630288", localFile: "spartner.png" },
  github: { name: "sgithub", id: "1496071462392696912", localFile: "sgithub.png" },
  play: { name: "splay", id: "1496071503861776394", localFile: "splay.png" },
  pause: { name: "spause", id: "1496071501827276810", localFile: "spause.png" },
  stop: { name: "sdelete", id: "1496071456109367306", localFile: "sdelete.png" },
  next: { name: "sright", id: "1496071456109367306", localFile: "sright.png" },
  back: { name: "sleft", id: "1496071477785530398", localFile: "sleft.png" },
  settings: { name: "ssetting", id: "1496071456109367306", localFile: "ssetting.png" },
  tools: { name: "stools", id: "1496071456109367306", localFile: "stools.png" },
  success: { name: "stick", id: "1496071456109367306", localFile: "stick.png" },
  error: { name: "scross", id: "1496071456109367306", localFile: "scross.png" },
  warning: { name: "sannc", id: "1496071456109367306", localFile: "sannc.png" },
  queue: { name: "shomes", id: "1496071471926087771", localFile: "shomes.png" },
  search: { name: "sreplit", id: "1496071456109367306", localFile: "sreplit.png" },
  volume: { name: "sspeak", id: "1496071456109367306", localFile: "sspeak.png" },
  voice: { name: "smic", id: "1496071488460165160", localFile: "smic.png" },
  ticket: { name: "smail", id: "1496071481673912410", localFile: "smail.png" },
  link: { name: "sgithub", id: "1496071462392696912", localFile: "sgithub.png" },
  mod: { name: "smod", id: "1496071490632941748", localFile: "smod.png" },
  security: { name: "sautomod", id: "1496071456109367306", localFile: "sautomod.png" },
  welcome: { name: "sheart", id: "1496071467631116350", localFile: "sheart.png" },
  owner: { name: "sowner", id: "1496071496865677414", localFile: "sowner.png" },
  shuffle: { name: "sworld", id: "1496071456109367306", localFile: "sworld.png" },
  folder: { name: "sfolder1", id: "1496071456109367306", localFile: "sfolder1.png" },
  cloud: { name: "scloud", id: "1496071456109367306", localFile: "scloud.png" },
  mute: { name: "smute", id: "1496071494994890812", localFile: "smute.png" },
  member: { name: "smember", id: "1496071483905282198", localFile: "smember.png" },
  lol: { name: "slol", id: "1496071479693938759", localFile: "slol.png" },
  headphone: { name: "sheadpone", id: "1496071465534099488", localFile: "sheadpone.png" },
  giveaway: { name: "sgiveawaya", id: "1496071464129138788", localFile: "sgiveawaya.png" },
  gift: { name: "sgift", id: "1496071460140355736", localFile: "sgift.png" },
  games: { name: "sgames", id: "1496071458198261760", localFile: "sgames.png" },
  galaxy: { name: "sgalaxy", id: "1496071456109367306", localFile: "sgalaxy.png" },
};

const EMOJIS: Record<string, EmojiDefinition> = {
  home: { default: "🏠", custom: { redwhite: REDWHITE_CUSTOMS.home } },
  help: { default: "❓", custom: { redwhite: REDWHITE_CUSTOMS.help } },
  music: { default: "🎵", custom: { redwhite: REDWHITE_CUSTOMS.music } },
  playlist: { default: "📚", custom: { redwhite: REDWHITE_CUSTOMS.playlist } },
  basic: { default: "⚙️", custom: { redwhite: REDWHITE_CUSTOMS.basic } },
  utility: { default: "🧰", custom: { redwhite: REDWHITE_CUSTOMS.utility } },
  commands: { default: "🧩", custom: { redwhite: REDWHITE_CUSTOMS.commands } },
  servers: { default: "🌐", custom: { redwhite: REDWHITE_CUSTOMS.servers } },
  users: { default: "👥", custom: { redwhite: REDWHITE_CUSTOMS.users } },
  uptime: { default: "⏱️", custom: { redwhite: REDWHITE_CUSTOMS.uptime } },
  ping: { default: "📶", custom: { redwhite: REDWHITE_CUSTOMS.ping } },
  info: { default: "ℹ️", custom: { redwhite: REDWHITE_CUSTOMS.info } },
  support: { default: "🛟", custom: { redwhite: REDWHITE_CUSTOMS.support } },
  github: { default: "💻", custom: { redwhite: REDWHITE_CUSTOMS.github } },
  play: { default: "▶️", custom: { redwhite: REDWHITE_CUSTOMS.play } },
  pause: { default: "⏸️", custom: { redwhite: REDWHITE_CUSTOMS.pause } },
  stop: { default: "⏹️", custom: { redwhite: REDWHITE_CUSTOMS.stop } },
  next: { default: "⏭️", custom: { redwhite: REDWHITE_CUSTOMS.next } },
  back: { default: "⏮️", custom: { redwhite: REDWHITE_CUSTOMS.back } },
  settings: { default: "⚙️", custom: { redwhite: REDWHITE_CUSTOMS.settings } },
  tools: { default: "🛠️", custom: { redwhite: REDWHITE_CUSTOMS.tools } },
  success: { default: "✅", custom: { redwhite: REDWHITE_CUSTOMS.success } },
  error: { default: "❌", custom: { redwhite: REDWHITE_CUSTOMS.error } },
  warning: { default: "⚠️", custom: { redwhite: REDWHITE_CUSTOMS.warning } },
  queue: { default: "📋", custom: { redwhite: REDWHITE_CUSTOMS.queue } },
  search: { default: "🔎", custom: { redwhite: REDWHITE_CUSTOMS.search } },
  volume: { default: "🔊", custom: { redwhite: REDWHITE_CUSTOMS.volume } },
  voice: { default: "🔈", custom: { redwhite: REDWHITE_CUSTOMS.voice } },
  ticket: { default: "🎫", custom: { redwhite: REDWHITE_CUSTOMS.ticket } },
  link: { default: "🔗", custom: { redwhite: REDWHITE_CUSTOMS.link } },
  mod: { default: "🛡️", custom: { redwhite: REDWHITE_CUSTOMS.mod } },
  security: { default: "🔒", custom: { redwhite: REDWHITE_CUSTOMS.security } },
  welcome: { default: "👋", custom: { redwhite: REDWHITE_CUSTOMS.welcome } },
  owner: { default: "👑", custom: { redwhite: REDWHITE_CUSTOMS.owner } },
  shuffle: { default: "🔀", custom: { redwhite: REDWHITE_CUSTOMS.shuffle } },
  folder: { default: "📁", custom: { redwhite: REDWHITE_CUSTOMS.folder } },
  cloud: { default: "☁️", custom: { redwhite: REDWHITE_CUSTOMS.cloud } },
};

export { EMOJIS, REDWHITE_CUSTOMS, EmojiEntry, EmojiDefinition };

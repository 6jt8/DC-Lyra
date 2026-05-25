<p align="center">
  <img src="https://img.shields.io/github/stars/sayrox106/Lyra-MC?style=flat&logo=github" alt="Stars">
  <img src="https://img.shields.io/github/forks/sayrox106/Lyra-MC?style=flat&logo=github" alt="Forks">
  <img src="https://img.shields.io/github/issues/sayrox106/Lyra-MC?style=flat&logo=github" alt="Issues">
  <img src="https://img.shields.io/github/last-commit/sayrox106/Lyra-MC?logo=git&logoColor=fff" alt="Last Commit">
  <img src="https://img.shields.io/badge/AGPL_3.0-FF4500?logo=gnu&logoColor=fff" alt="License">
</p>

<br>

<h1 align="center">
  <pre>
██╗  ██╗   ██╗██████╗  █████╗ 
██║  ╚██╗ ██╔╝██╔══██╗██╔══██╗
██║   ╚████╔╝ ██████╔╝███████║
██║    ╚██╔╝  ██╔══██╗██╔══██║
███████╗██║   ██║  ██║██║  ██║
╚══════╝╚═╝   ╚═╝  ╚═╝╚═╝  ╚═╝
  </pre>
  <sub>Your Discord Music Bot</sub>
</h1>

<p align="center">
  <b>Modern · Modular · Type-Safe</b><br>
  A high-performance Discord music bot built with <a href="https://discord.js.org">discord.js v14</a>,
  <a href="https://riffy.js.org">Riffy</a> &amp; <a href="https://lavalink.dev">Lavalink</a>.
  Written in TypeScript with a clean, modular architecture.
</p>

<br>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff" alt="TypeScript">
  <img src="https://img.shields.io/badge/discord.js-v14-5865F2?logo=discord&logoColor=fff" alt="discord.js">
  <img src="https://img.shields.io/badge/Riffy-4A90D9" alt="Riffy">
  <img src="https://img.shields.io/badge/Lavalink-4A90D9?logo=cloudbees&logoColor=fff" alt="Lavalink">
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?logo=postgresql&logoColor=fff" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=fff" alt="Node.js">
  <img src="https://img.shields.io/badge/Bun-000000?logo=bun&logoColor=fff" alt="Bun">
  <img src="https://img.shields.io/badge/Express-000000?logo=express&logoColor=fff" alt="Express">
  <img src="https://img.shields.io/badge/Canvas-FF6C37?logo=html5&logoColor=fff" alt="Canvas">
  <img src="https://img.shields.io/badge/Vitest-6E9F18?logo=vitest&logoColor=fff" alt="Vitest">
</p>

<p align="center">
  <a href="https://top.gg/bot/1507725067025645668">
    <img src="https://img.shields.io/badge/INVITE_LYRA-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Invite Lyra">
  </a>
</p>

<p align="center">
  <a href="https://top.gg/bot/1507725067025645668">
    <img src="https://img.shields.io/badge/Servers-2-5a0f1a?style=for-the-badge&labelColor=1a1a1a" alt="Lyra Servers">
  </a>
  <a href="https://top.gg/bot/1507725067025645668">
    <img src="https://img.shields.io/badge/Votes-0-5a0f1a?style=for-the-badge&labelColor=1a1a1a" alt="Lyra Votes">
  </a>
</p>

<br>

<h2 align="center">✨ Features</h2>

<div align="center">
<table>
<tr>
<td width="50%">

### 🎵 **Music Playback**
- High-quality audio via Lavalink (multiple public nodes included)
- YouTube, Spotify, SoundCloud support (Spotify metadata via API)
- Queue management (add, remove, skip, jump, move, clear)
- 24/7 mode in voice channels
- Autoplay — automatic track recommendations
- Vote-skip system
- Volume control, seek
- Shuffle &amp; advanced audio filters (bassboost, nightcore, 3D, etc.)

</td>
<td width="50%">

### 🎨 **Player Experience**
- Live now‑playing panel with interactive buttons
- Synced lyrics display
- Rich audio filters
- Generated song cards with track art (Canvas)
- Progress bar &amp; visualizer
- Multilingual UI (7 languages)
- Responsive status &amp; custom activity

</td>
</tr>
<tr>
<td width="50%">

### 📋 **Playlists**
- Create &amp; manage custom playlists (public/private)
- Add/remove songs by name or URL
- Save entire queue as a playlist
- Browse all public playlists
- Play playlists directly

</td>
<td width="50%">

### ⚙️ **System**
- Fully TypeScript — type‑safe
- PostgreSQL persistence with **SQLite fallback** (`./data/lyra.db`)
  - Bun: uses built-in `bun:sqlite`
  - Node: uses optional `better-sqlite3`
- Custom emoji system (auto‑upload to app)
- Slash commands with autocomplete
- Express status page (port 3000)
- Modular command &amp; event architecture
- Comprehensive test suite (Vitest)

</td>
</tr>
</table>
</div>

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 20 **or** **Bun** ≥ 1.0
- **Lavalink** node (public nodes included by default)
- **PostgreSQL** instance (optional — Neon, Supabase, or local; bot works without DB for basic use)

### Installation

Choose your runtime:

<details>
<summary><b>Option A: Node.js</b> (recommended for production)</summary>

```bash
# 1. Clone the repository
git clone https://github.com/sayrox106/Lyra-MC.git
cd Lyra-MC

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env — at minimum set TOKEN, CLIENT_ID
# DATABASE_URL is optional (see Configuration)

# 4. Build the project
npm run build

# 5. Start the bot
npm start
```
</details>

<details>
<summary><b>Option B: Bun</b> (fast direct TS, no build step)</summary>

```bash
git clone https://github.com/sayrox106/Lyra-MC.git
cd Lyra-MC

bun install

cp .env.example .env
# Edit .env

# 🚨 Use start:bun — NOT "bun start" (that runs node dist/ which needs build)
bun run start:bun
```
</details>

<details>
<summary><b>Development Mode</b></summary>

```bash
# Node.js with hot reload
npm run dev

# Type checking
npm run typecheck
```
</details>

<details>
<summary><b>Testing</b></summary>

```bash
npm test          # run all tests once
npm run test:watch # watch mode
```

- Framework: [Vitest](https://vitest.dev)
- Tests located in `tests/`
- Covers config loading, player store, and more
- Always run tests before submitting PRs

Add a test badge in CI (GitHub Actions recommended).
</details>

<h2 align="center">🎮 Commands</h2>

<div align="center">
<table>
<tr>
<td width="50%" valign="top">
<h3>🎵 Music</h3>
<table width="100%">
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>/play</code></td><td>Play a song by name or URL (YouTube/Spotify/SoundCloud)</td></tr>
<tr><td><code>/search</code></td><td>Search YouTube and pick from results</td></tr>
<tr><td><code>/skip</code></td><td>Skip the current track</td></tr>
<tr><td><code>/voteskip</code></td><td>Start a vote to skip the current track</td></tr>
<tr><td><code>/stop</code></td><td>Stop playback and clear the queue</td></tr>
<tr><td><code>/pause</code></td><td>Pause the current track</td></tr>
<tr><td><code>/resume</code></td><td>Resume the current track</td></tr>
<tr><td><code>/queue</code></td><td>View the upcoming queue</td></tr>
<tr><td><code>/np</code></td><td>Show the currently playing track with progress</td></tr>
<tr><td><code>/jump</code></td><td>Jump to a specific position in the queue</td></tr>
<tr><td><code>/move</code></td><td>Move a track to a different position</td></tr>
<tr><td><code>/remove</code></td><td>Remove a specific track from the queue</td></tr>
<tr><td><code>/clear</code></td><td>Clear the entire queue</td></tr>
<tr><td><code>/shuffle</code></td><td>Shuffle the queue randomly</td></tr>
<tr><td><code>/seek</code></td><td>Seek to a specific timestamp</td></tr>
<tr><td><code>/volume</code></td><td>Set the player volume (0–100)</td></tr>
<tr><td><code>/filters</code></td><td>Apply audio effects (bassboost, nightcore, karaoke, 3D, etc.)</td></tr>
<tr><td><code>/autoplay</code></td><td>Toggle automatic track recommendations</td></tr>
<tr><td><code>/trackinfo</code></td><td>Show detailed info about the current track</td></tr>
</table>
</td>
<td width="50%" valign="top">
<h3>📋 Playlist</h3>
<table width="100%">
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>/createplaylist</code></td><td>Create a new playlist (optionally private)</td></tr>
<tr><td><code>/deleteplaylist</code></td><td>Delete one of your playlists</td></tr>
<tr><td><code>/allplaylists</code></td><td>Browse all public playlists</td></tr>
<tr><td><code>/myplaylists</code></td><td>View your playlists</td></tr>
<tr><td><code>/showsongs</code></td><td>List all songs in a playlist</td></tr>
<tr><td><code>/addsong</code></td><td>Add a song to a playlist</td></tr>
<tr><td><code>/deletesong</code></td><td>Remove a song from a playlist</td></tr>
<tr><td><code>/savequeue</code></td><td>Save the current queue as a playlist</td></tr>
<tr><td><code>/playcustomplaylist</code></td><td>Play a playlist directly</td></tr>
</table>

<h3>🔧 Utility</h3>
<table width="100%">
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>/247</code></td><td>Toggle 24/7 mode (keep bot in voice channel)</td></tr>
<tr><td><code>/language</code></td><td>Change/view bot language (7 supported)</td></tr>
<tr><td><code>/history</code></td><td>View your recent listening history</td></tr>
</table>

<h3>💜 Basic</h3>
<table width="100%">
<tr><th>Command</th><th>Description</th></tr>
<tr><td><code>/help</code></td><td>Show the interactive help menu</td></tr>
<tr><td><code>/ping</code></td><td>Check the bot's latency</td></tr>
<tr><td><code>/stats</code></td><td>Display bot statistics and uptime</td></tr>
<tr><td><code>/invite</code></td><td>Get an invite link for the bot</td></tr>
<tr><td><code>/support</code></td><td>Join the support server</td></tr>
</table>

</td>
</tr>
</table>
</div>

<h2 align="center">🌐 Languages</h2>

<div align="center">

| Language | File |
|----------|------|
| 🇬🇧 English | `languages/en.ts` |
| 🇩🇪 German | `languages/de.ts` |
| 🇫🇷 French | `languages/fr.ts` |
| 🇪🇸 Spanish | `languages/es.ts` |
| 🇯🇵 Japanese | `languages/ja.ts` |
| 🇰🇷 Korean | `languages/ko.ts` |
| 🇷🇺 Russian | `languages/ru.ts` |

Change anytime with `/language`.

</div>

## 🏗️ Project Structure

```
Lyra-MC/
├── src/                    # TypeScript source
│   ├── index.ts            # Entry point
│   ├── bot.ts              # Bot bootstrap + Express status server
│   ├── config.ts           # Central configuration (env + defaults)
│   ├── client/
│   │   └── LyraClient.ts   # Extended discord.js Client + Riffy
│   ├── commands/
│   │   ├── basic/          # help, ping, stats, invite, support
│   │   ├── music/          # playback, queue, filters, autoplay...
│   │   ├── playlist/       # playlist CRUD + play/save
│   │   └── utility/        # language, history, 247
│   ├── events/
│   │   ├── clientReady.ts
│   │   └── interactionCreate.ts
│   ├── music/              # Core player logic
│   │   ├── lavalink.ts
│   │   ├── player.ts
│   │   ├── player-ui.ts
│   │   ├── player-interaction.ts
│   │   ├── player-lyrics.ts
│   │   ├── player-filters.ts
│   │   ├── player-store.ts
│   │   └── player-cleanup.ts
│   ├── database/
│   │   ├── database.ts     # PostgreSQL (pg) with Neon/Supabase + auto SQLite fallback
│   │   └── sqlite.ts       # SQLite fallback via bun:sqlite / better-sqlite3
│   ├── emoji/              # Custom emoji manager + uploader
│   ├── ui/                 # colors, icons, responseHandler
│   └── utils/              # language, musicCard, validation, statusManager...
├── languages/              # 7 translation files
├── icoms/                  # Custom emoji icon assets
├── tests/                  # Vitest test suite
├── dist/                   # Compiled output (Node)
├── .env.example
├── LICENSE
├── package.json
└── tsconfig.json
```

## 🛠️ Configuration

All settings via `.env` and `src/config.ts`.

### `.env` (see `.env.example` for full template)

Required:
- `TOKEN` — Discord bot token
- `CLIENT_ID` — Application ID

Optional but recommended:
- `DATABASE_URL` — PostgreSQL connection string (Neon/Supabase/local)
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` — for Spotify links & metadata
- `PORT` — web status page (default 3000)
- `OWNER_ID` — comma-separated Discord IDs for owner-only features
- `EMBED_COLOR` — default embed accent (default #e11d2e)
- `ACTIVITY_NAME` / `ACTIVITY_TYPE`
- `LAVALINK_NODES` — JSON array of custom Lavalink nodes (overrides defaults)
- `PROGRESS_UPDATE_INTERVAL`

### Key `config.ts` options
- `nodes` — Lavalink nodes
- `applicationEmojis` — auto-sync custom emojis
- `showProgressBar`, `showVisualizer`, `generateSongCard`
- `lowMemoryMode`

Database is optional — bot runs fully without it (playlists & some features limited).

> **SQLite fallback**: If PostgreSQL is unreachable or `DATABASE_URL` is not set, the bot automatically switches to SQLite (`./data/lyra.db`). On Bun the built-in `bun:sqlite` is used; on Node.js the optional `better-sqlite3` package is required. Bun users do NOT need `better-sqlite3`.

<h2 align="center">🤝 Contributing</h2>

<div align="center">

Want to help make Lyra even better? We'd love that!

Star the repo, open Issues, submit Pull Requests, join Discussions or share the bot — every contribution counts.

Thank you!

All contributors:

[![Contributors](https://contrib.rocks/image?repo=sayrox106/Lyra-MC)](https://github.com/sayrox106/Lyra-MC/graphs/contributors)

</div>

<h2 align="center">📄 License</h2>

<div align="center">

**GNU Affero General Public License v3.0** — see [LICENSE](LICENSE).

This project is free software. Any network service using modified versions must provide source code to users.

```
Copyright (c) 2026 sayrox106
Licensed under AGPL-3.0
```

</div>

<p align="center">
  <sub>Built with ❤️ by <a href="https://github.com/sayrox106">sayrox106</a></sub><br>
  <sub>Repo: <a href="https://github.com/sayrox106/Lyra-MC">Lyra-MC</a> — Bot: Lyra</sub>
</p>

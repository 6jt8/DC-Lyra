# Changelog

All notable changes to Lyra Music Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-07-17

### Added
- `/join` command — make the bot join your voice channel without starting playback
- `/grab` command — save the currently playing song to your DMs
- `/forceskip` command — force skip the current track (admin only, requires Manage Messages)
- `/rewind` command — rewind the current track by a specified amount (default 10s)
- `/forward` command — fast forward the current track by a specified amount (default 10s)
- `/skipto` command — skip to a specific track in the queue without removing others
- `/bassboost` command — dedicated bass boost levels (Off/Low/Medium/High/Extreme)
- `/summon` command — summon the bot to your voice channel
- `/lock` command — lock the queue so others cannot add songs (admin only)
- `/unlock` command — unlock the queue so others can add songs (admin only)
- `/disconnect` command — alias for `/leave` to disconnect the bot
- `/restart` command — restart the current track from the beginning
- `/equalizer` command — 11 audio equalizer presets (Flat, Bass, Treble, Rock, Pop, Jazz, Classical, Electronic, Full Bass, Full Treble, Headphones)
- `/speed` command — change playback speed (0.5x–3.0x) using Timescale filter
- `getAvailableNodeIds()` and `findBestAvailableNode()` methods in `LavalinkNodeManager`
- Queue lock system: `/lock` prevents non-admins from adding songs to the queue
- `MAX_QUEUE_SIZE`, `MAX_PLAYLIST_TRACKS`, `DEFAULT_VOLUME`, `DISCONNECT_TIMEOUT_MS` environment variables for configurable limits
- `safeCatch()` utility in `errorHandler.ts` — safe error wrapper that suppresses known harmless errors (Unknown Message, Missing Access, Unknown Interaction)
- `decomment` dependency for stripping comments from JSON config files
- Node error rate throttling: `nodeErrorCount` and `nodeDebugMode` Maps in `LavalinkNodeManager` — errors are throttled to debug-level after 3 in 60s to reduce log spam
- `getNodeConnectionStatus()` and `getBestConnectedNode()` helpers in `riffy-utils.ts`

### Removed
- `src/types/music.ts` — unused type definitions removed
- `src/ui/icons.ts` — unused icon utilities removed
- `src/music/player-lyrics.ts` — internal lyrics module removed

### Changed
- Bumped version to 1.2.0
- Help menu now includes all new commands in categorized sections (Playback, Queue, Other, Effects)
- Magic numbers (`MAX_QUEUE_SIZE`, `MAX_PLAYLIST_TRACKS`, `DEFAULT_VOLUME`, `DISCONNECT_TIMEOUT_MS`) are now configurable via environment variables
- Express downgraded from v5.x to v4.x (dependency resolution change)
- SlashStrategy: replaced bound event listener with direct handler; teardown now uses `removeAllListeners()` for clean removal
- `getCommandMentionMap` now accepts optional `interaction` parameter to fetch guild-specific command mentions alongside global ones
- Cleaned up unused imports (`EnhancedMusicCard`, `InteractionType`, `MessageFlags`) across multiple files

### Fixed
- **Node fallback**: When a node disconnects mid-playback, the bot now tries remaining healthy nodes before showing "No nodes available" (#1)
- `ensureNodeAvailable()` now iterates through nodes individually instead of failing after one cycle
- `createPlayerForGuild()` tries each node one-by-one instead of all-or-nothing
- `playWithRetries()` checks `getAvailableNodeIds()` before each retry attempt
- `hasConnectedNode()` now handles both Map and Array node formats
- `isNodeConnected()` safeguarded against non-Map iteration
- `queueEnd` handler attempts node reconnection before triggering maintenance mode
- `trackError` and `trackStuck` handlers reconnect nodes before playing next track
- `resolveWithRetry()` ensures a healthy node exists before each resolve attempt
- **`## ? Error` fallback strings**: Replaced `?` placeholders with `❌` emoji in 10 command files (resume, skip, leave, volume, search, shuffle, voteskip, seek, stop, trackinfo)
- **SQL injection**: Column name validation in database `toSnake()` function prevents unescaped identifier injection
- **Missing `/help` entries**: Added `join`, `leave`, `clear`, `loop`, `previous` to help category sections

### Refactored
- **Code deduplication**: `createProgressBar` (np.ts → player-ui.ts), `formatDuration` (search.ts, trackinfo.ts, grab.ts → player-ui.ts), `getCommandMentionMap` (help.ts → player-store.ts)
- **DJ role system**: Added `DJ_ROLE` environment variable; `/language` and `/247` now check for DJ role + Administrator instead of only server owner
- **SQL safety**: Column name validation in database layer prevents SQL injection
- **Dynamic imports resolved**: `restartCollector` moved from `player-store.ts` to `player-interaction.ts`, eliminating circular dependency
- **Riffy queue safety**: `/skipto` now uses `queue.remove()` + `queue.add()` instead of `Array.splice()`

---

## [1.1.0] - 2026-06-28

### Security
- **BREAKING**: Removed hardcoded Lavalink node credentials from `config.ts`. Users must now configure `LAVALINK_NODES` environment variable.
- Fixed ping injection vulnerability: `@everyone`/`@here` mentions in error messages are now sanitized before being sent to users.

### Fixed
- **Critical**: Prefix and Mention command strategies now properly execute commands (previously was a no-op with `// Execute command...` comment).
- Fixed memory leak: `requesters` Map in `player-store.ts` now has LRU eviction at 10,000 entries.
- Fixed dangling `setTimeout` references in `player.ts` error handlers — timeouts are now tracked and cleared on `trackEnd`/`queueEnd`.
- Removed dead code: `INTENT_GATED_EVENTS` constant in `bot.ts` (logic moved to `eventLoader.ts`).

### Refactored
- Extracted `bot.ts` into focused modules:
  - `src/utils/errorHandler.ts` — consolidated error suppression logic (`shouldSuppressError`, `getErrorLogMessage`)
  - `src/utils/commandLoader.ts` — command loading from filesystem
  - `src/utils/eventLoader.ts` — event registration with intent gating
  - `src/utils/healthServer.ts` — Express status server
  - `src/utils/shutdown.ts` — graceful shutdown logic
- Created `src/utils/commandDispatch.ts` — shared command execution for prefix/mention strategies.

### Tests
- Added `tests/rateLimit.test.ts` — 4 tests for rate limiting
- Added `tests/errorHandler.test.ts` — 5 tests for error suppression logic
- Added `tests/responseHandler.test.ts` — 8 tests for mention sanitization and title handling

### Added
- `evictRequester()` function for LRU eviction of requester cache
- `pendingRecoverTimeouts` Map and `clearPendingRecover()` for timeout cleanup

---

## [1.0.2] - 2026-05-29

### Fixed
- Enhanced error handling for Lavalink connection issues with retry logic
- Handle unhandled Lavalink node connection errors gracefully
- Await `player.play()` to catch connection rejections
- Enhanced ephemeral reply handling in `sendEphemeralReply`

---

## [1.0.1] - 2026-05-28

### Added
- `/previous` command to replay last played track
- `/leave` command to disconnect from voice channel
- `/loop` slash command with track/queue/off modes
- Rate-limit visibility, collector timeout reset, Lavalink connect backoff
- Queue size limit, per-user rate limiting, Spotify validation
- Connection robustness and voice state handling

### Fixed
- Prevent memory leaks and fix shuffle mutation
- Sanitize `@everyone`/`@here` mentions in track titles
- Replace stale `dbConnected` constant with live `isDbConnected()` function
- Extract inline events from `bot.ts` into dedicated event files
- Extract shared player connection logic into `player-connection.ts`
- Add timeouts to database queries (15s)

---

## [1.0.0] - 2026-05-27

### Added
- Initial release
- Discord music bot powered by Lavalink & TypeScript
- Slash, prefix, and mention command strategies
- Multi-node Lavalink support with health checks
- i18n support
- Components V2 UI
- Playlist management
- Autoplay and 24/7 mode

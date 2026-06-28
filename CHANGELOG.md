# Changelog

All notable changes to Lyra Music Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

import { colors } from "../ui/colors.js";
import { getLangSync } from "../utils/language.js";

const NOISY_TRACK_EVENT_COOLDOWN_MS = 20_000;
const notifiedTrackEventGuilds = new Map<string, number>();
const autoplayFailureCounts = new Map<string, number>();
const maintenanceGuilds = new Map<string, { since: number; reason: string }>();

export function isTrackEventNotificationAllowed(guildId: string): boolean {
  const now = Date.now();
  const last = notifiedTrackEventGuilds.get(guildId) || 0;
  if (now - last < NOISY_TRACK_EVENT_COOLDOWN_MS) return false;
  notifiedTrackEventGuilds.set(guildId, now);
  return true;
}

export function incrementAutoplayFailureCount(guildId: string): number {
  const next = (autoplayFailureCounts.get(guildId) || 0) + 1;
  autoplayFailureCounts.set(guildId, next);
  return next;
}

export function resetAutoplayFailureCount(guildId: string): void {
  autoplayFailureCounts.delete(guildId);
}

export function getAutoplayFailureCount(guildId: string): number {
  return autoplayFailureCounts.get(guildId) || 0;
}

export function activateMaintenanceMode(guildId: string, reason: string): boolean {
  if (maintenanceGuilds.has(guildId)) return false;
  maintenanceGuilds.set(guildId, { since: Date.now(), reason });
  const langSync = getLangSync();
  console.log(
    `${colors.cyan}[ AUTOPROTECT ]${colors.reset} ${colors.yellow}Maintenance mode activated for guild ${guildId}: ${reason}${colors.reset}`
  );
  return true;
}

export function clearMaintenanceMode(guildId: string): boolean {
  const existed = maintenanceGuilds.delete(guildId) || false;
  if (existed) {
    console.log(
      `${colors.cyan}[ AUTOPROTECT ]${colors.reset} ${colors.green}Maintenance mode cleared for guild ${guildId}${colors.reset}`
    );
  }
  return existed;
}

export function isMaintenanceMode(guildId: string): boolean {
  return maintenanceGuilds.has(guildId);
}

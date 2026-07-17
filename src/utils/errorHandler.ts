const LAVALINK_SUPPRESSED_PATTERNS = [
  "track.info",
  "thumbnail",
  "player.restart is not a function",
  "restart is not a function",
  "DAVE",
  "external sender",
];

const NETWORK_ERROR_CODES = [
  "UND_ERR_CONNECT_TIMEOUT",
  "ECONNRESET",
  "ECONNREFUSED",
  "ConnectionRefused",
  "ENOTFOUND",
  "UND_ERR_SOCKET",
];

const NETWORK_ERROR_MESSAGES = [
  "Connect Timeout",
  "fetch failed",
  "ConnectTimeoutError",
  "ECONNRESET",
  "socket connection was closed",
  "There was an Error while Making Node Request",
];

export function shouldSuppressError(error: any): boolean {
  if (!error) return false;
  const msg = error.message || "";

  if (LAVALINK_SUPPRESSED_PATTERNS.some((p) => msg.includes(p))) {
    return true;
  }

  const cause = error.cause || {};
  const causeCode = cause.code || "";
  const causeMessage = cause.message || "";

  if (NETWORK_ERROR_CODES.includes(causeCode)) return true;
  if (NETWORK_ERROR_MESSAGES.some((m) => msg.includes(m))) return true;
  if (
    causeMessage.includes("ECONNRESET") ||
    causeMessage.includes("socket connection was closed") ||
    causeMessage.includes("Unable to connect")
  ) {
    return true;
  }

  return false;
}

export function safeCatch(context: string): (err: any) => void {
  return (err: any) => {
    const msg = err?.message || "";
    if (
      msg.includes("10008") ||
      msg.includes("Unknown Message") ||
      msg.includes("Missing Access") ||
      msg.includes("10062") ||
      msg.includes("Unknown Interaction")
    ) {
      return;
    }
    if (msg) {
      console.debug(`[SAFE] ${context}: ${msg}`);
    }
  };
}

export function getErrorLogMessage(error: any): string {
  const msg = error.message || "";

  if (
    msg.includes("player.restart") ||
    msg.includes("restart is not a function")
  ) {
    return "";
  }
  if (msg.includes("DAVE") || msg.includes("external sender")) {
    return `[ VOICE ] DAVE protocol error — connection may need recovery: ${msg}`;
  }

  return "";
}

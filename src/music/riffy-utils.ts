import { colors } from "../ui/colors.js";

/**
 * Checkt Riffy's interne nodeMap (echte Node-Objekte mit WebSocket-State)
 * ob mindestens ein Node wirklich per WebSocket connected ist.
 * Das ist die authoritative Quelle – Riffy's `leastUsedNodes` basiert auf
 * exakt diesem State (riffy.js:64-68).
 */
export function hasRiffyNodesReady(client: any): boolean {
  if (!client?.riffy?.nodeMap) return false;
  if (client.riffy.nodeMap instanceof Map) {
    for (const node of client.riffy.nodeMap.values()) {
      if (node?.connected) return true;
    }
  }
  return false;
}

export function hasConnectedNode(client: any): boolean {
  if (!client?.riffy?.nodes) return false;
  const nodes = client.riffy.nodes;
  if (nodes.size === 0) return false;
  return [...nodes.values()].some((n: any) => n.connected);
}

export async function safeAutoplay(player: any, maxRetries = 2): Promise<any> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await player.autoplay(player);
      return result;
    } catch (error: any) {
      lastError = error;
      console.warn(
        `${colors.yellow}[ RIFFY ]${colors.reset} Autoplay attempt ${attempt}/${maxRetries} failed: ${error?.message || error}`
      );
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }
    }
  }
  throw lastError;
}

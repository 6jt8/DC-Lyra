import { colors } from "../ui/colors.js";
import { getLavalinkManager } from "./lavalink.js";


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
  if (typeof nodes.size === "number" && nodes.size === 0) return false;
  if (nodes instanceof Map) {
    return [...nodes.values()].some((n: any) => n?.connected);
  }
  if (Array.isArray(nodes)) {
    return nodes.some((n: any) => n?.connected);
  }
  return false;
}

export function getBestConnectedNode(client: any): any | null {
  if (!client?.riffy?.nodeMap) return null;
  if (client.riffy.nodeMap instanceof Map) {
    for (const node of client.riffy.nodeMap.values()) {
      if (node?.connected) return node;
    }
  }
  return null;
}

export function getNodeConnectionStatus(client: any): {
  total: number;
  connected: number;
  nodes: { name: string; connected: boolean }[];
} {
  const manager = getLavalinkManager();
  const total = manager?.getTotalNodeCount() || 0;
  const connected = manager?.getConnectedNodeCount() || 0;
  const nodes: { name: string; connected: boolean }[] = [];

  if (client?.riffy?.nodeMap instanceof Map) {
    for (const node of client.riffy.nodeMap.values()) {
      if (node) {
        nodes.push({ name: node.name || "unknown", connected: !!node.connected });
      }
    }
  }

  return { total, connected, nodes };
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

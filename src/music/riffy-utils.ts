import { colors } from "../ui/colors.js";

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

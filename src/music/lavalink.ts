import { Riffy } from "riffy";
import axios from "axios";
import { colors } from "../ui/colors.js";
import { config } from "../config.js";
import { EnhancedMusicCard } from "../utils/musicCard.js";
import { getLangSync } from "../utils/language.js";

let getLangSync_impl: () => any;
try {
  const langLoader = require("../utils/language");
  getLangSync_impl = langLoader.getLangSync;
} catch (e) {
  getLangSync_impl = () => ({ console: {} });
}

export class LavalinkNodeManager {
  public client: any;
  public nodes: Map<string, any>;
  public nodeStatus: Map<string, any>;
  public healthCheckInterval: any;
  public connectLoopInterval: any;
  public riffy: any;
  public initialized: boolean;
  public connectionPromise: any;
  public connectionResolve: any;
  private reconnectInterval: any;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(client: any) {
    this.client = client;
    this.nodes = new Map();
    this.nodeStatus = new Map();
    this.healthCheckInterval = null;
    this.connectLoopInterval = null;
    this.riffy = null;
    this.initialized = false;
    this.connectionPromise = null;
    this.connectionResolve = null;
    this.reconnectTimeout = null;

    this.initializeNodes();
  }

  initializeNodes(): void {
    if (
      config.nodes &&
      Array.isArray(config.nodes) &&
      config.nodes.length > 0
    ) {
      const nameCounts = new Map();

      config.nodes.forEach((node: any, index: number) => {
        const baseName = node.name || `node-${index}`;
        const count = nameCounts.get(baseName) || 0;
        nameCounts.set(baseName, count + 1);

        const nodeId =
          count > 0 ? `${baseName}-${count}` : baseName;
        const displayName =
          count > 0 ? `${baseName}-${count}` : baseName;

        this.nodes.set(nodeId, {
          ...node,
          id: nodeId,
          displayName: displayName,
          originalName: baseName,
        });
        this.nodeStatus.set(nodeId, {
          online: false,
          lastCheck: null,
          lastError: null,
        });
      });
    }

    const lang = getLangSync_impl();
    console.log(
      `${colors.cyan}[ LAVALINK ][INIT ]${colors.reset} ${lang.console?.lavalink?.nodesConfigured?.replace("{count}", this.nodes.size) || `Nodes configured: ${this.nodes.size}`}`
    );
  }

  async initializeRiffy(): Promise<any> {
    try {
      const nodesToUse = Array.from(this.nodes.values()).map(
        (node: any) => ({
          host: node.host,
          password: node.password,
          port: node.port,
          secure: !!node.secure,
          name: node.id,
          displayName: node.displayName || node.name || node.id,
        })
      );

      this.riffy = new Riffy(this.client, nodesToUse, {
        send: (payload: any) => {
          const guild =
            this.client.guilds.cache.get(payload.d.guild_id);
          if (guild) guild.shard.send(payload);
        },
        defaultSearchPlatform: "ytsearch",
        restVersion: "v4",
        autoResume: true,
        resumeKey: "LyraMusic",
        resumeTimeout: 30000,
        bypassChecks: {
          nodeFetchInfo: true,
        },
      });

      this.setupEventListeners();
      this.startHealthMonitoring();
      this.startConnectLoop();
      this.initialized = true;

      const lang = getLangSync_impl();
      console.log(
        `${colors.cyan}[ LAVALINK ][Riffy]${colors.reset} ${colors.green}${lang.console?.lavalink?.riffyInitialized?.replace("{count}", nodesToUse.length) || `Initialized with ${nodesToUse.length} node(s)`}${colors.reset}`
      );

      setTimeout(() => {
        try {
          let keys: string[] = [];
          if (this.riffy?.nodes instanceof Map) {
            keys = [...this.riffy.nodes.keys()];
          } else if (Array.isArray(this.riffy?.nodes)) {
            keys = this.riffy.nodes.map(
              (n: any) => n?.name || n?.identifier
            );
          } else if (
            this.riffy?.nodes &&
            typeof this.riffy.nodes === "object"
          ) {
            keys = Object.keys(this.riffy.nodes);
          }
          const lang = getLangSync_impl();
          console.log(
            `${colors.cyan}[ LAVALINK ][Riffy]${colors.reset} ${lang.console?.lavalink?.nodeKeys || "Node keys:"}`,
            keys
          );
        } catch (_) {}
      }, 2000);

      return this.riffy;
    } catch (error: any) {
      const lang = getLangSync_impl();
      console.error(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}${lang.console?.lavalink?.failedToInitialize?.replace("{message}", error.message) || `Failed to initialize Riffy: ${error.message}`}${colors.reset}`
      );
      throw error;
    }
  }

  _findRiffyNodeObjectByConfig(nodeConfig: any): any {
    if (!this.riffy || !this.riffy.nodes) return null;

    const tryMatch = (riffyNode: any, cfg: any) => {
      if (!riffyNode) return false;
      if (riffyNode.host && riffyNode.port) {
        return (
          riffyNode.host === cfg.host &&
          String(riffyNode.port) === String(cfg.port)
        );
      }
      if (riffyNode.identifier) {
        return (
          riffyNode.identifier === cfg.id ||
          riffyNode.identifier === cfg.displayName
        );
      }
      if (riffyNode.name) {
        return (
          riffyNode.name === cfg.id ||
          riffyNode.name === cfg.displayName ||
          riffyNode.name === cfg.name
        );
      }
      return false;
    };

    try {
      if (this.riffy.nodes instanceof Map) {
        for (const [, rnode] of this.riffy.nodes.entries()) {
          if (tryMatch(rnode, nodeConfig)) return rnode;
        }
      } else if (Array.isArray(this.riffy.nodes)) {
        for (const rnode of this.riffy.nodes) {
          if (tryMatch(rnode, nodeConfig)) return rnode;
        }
      } else if (typeof this.riffy.nodes === "object") {
        for (const key in this.riffy.nodes) {
          const rnode = this.riffy.nodes[key];
          if (tryMatch(rnode, nodeConfig)) return rnode;
        }
      }
    } catch (_) {}
    return null;
  }

  async attemptConnectNode(nodeId: string): Promise<boolean> {
    const nodeCfg = this.nodes.get(nodeId);
    if (!nodeCfg) return false;

    const healthy = await this.checkNodeHealth(nodeId).catch(
      () => false
    );
    if (!healthy) return false;

    const riffyNode = this._findRiffyNodeObjectByConfig(nodeCfg);
    if (riffyNode) {
      if (
        typeof riffyNode.connect === "function" &&
        !riffyNode.connected
      ) {
        try {
          riffyNode.connect();
          return true;
        } catch (_) {}
      }
      if (
        typeof riffyNode.connectNode === "function" &&
        !riffyNode.connected
      ) {
        try {
          riffyNode.connectNode();
          return true;
        } catch (_) {}
      }
    }

    try {
      await this.refreshRiffy();
      return true;
    } catch (_) {
      return false;
    }
  }

  async forceConnectAllNodes(): Promise<boolean> {
    if (!this.riffy) return false;
    let attempted = false;
    const tries = [];
    for (const nodeId of this.nodes.keys()) {
      tries.push(
        this.attemptConnectNode(nodeId)
          .then((res) => {
            if (res) attempted = true;
            return res;
          })
          .catch(() => false)
      );
    }
    await Promise.allSettled(tries);
    return attempted;
  }

  async checkNodeHealth(nodeId: string): Promise<boolean> {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    try {
      const protocol = node.secure ? "https" : "http";
      const url = `${protocol}://${node.host}:${node.port}/version`;
      await axios.get(url, {
        headers: node.password
          ? { Authorization: node.password }
          : {},
        timeout: 3000,
      });
      this.nodeStatus.set(nodeId, {
        online: true,
        lastCheck: new Date(),
        lastError: null,
      });
      return true;
    } catch (error: any) {
      this.nodeStatus.set(nodeId, {
        online: false,
        lastCheck: new Date(),
        lastError: error.message,
      });
      return false;
    }
  }

  async checkAllNodesHealth(): Promise<string[]> {
    const healthy: string[] = [];
    const checks = [];
    for (const nodeId of this.nodes.keys()) {
      checks.push(
        this.checkNodeHealth(nodeId)
          .then((ok) => {
            if (ok) healthy.push(nodeId);
          })
          .catch(() => {})
      );
    }
    await Promise.allSettled(checks);
    return healthy;
  }

  startConnectLoop(): void {
    if (this.connectLoopInterval) return;
    this.connectLoopInterval = setInterval(async () => {
      try {
        if (this.hasConnectedNodes()) return;
        await this.reconnectNodesNow(5000);
      } catch (_) {}
    }, 10000);
  }

  async reconnectNodesNow(
    maxWaitTime: number = 8000
  ): Promise<boolean> {
    this.clearScheduledReconnect();
    await this.checkAllNodesHealth().catch(() => {});
    const attempted = await this.forceConnectAllNodes();

    const start = Date.now();
    while (Date.now() - start < maxWaitTime) {
      if (this.hasConnectedNodes()) return true;

      const eventConnected = await Promise.race([
        this.waitForNodeConnectEvent(800),
        new Promise((res) => setTimeout(() => res(false), 800)),
      ]);
      if (eventConnected && this.hasConnectedNodes()) return true;
      await new Promise((res) => setTimeout(res, 400));
    }
    return attempted && this.hasConnectedNodes();
  }

  private clearScheduledReconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private scheduleReconnect(delayMs: number): void {
    this.clearScheduledReconnect();
    this.reconnectTimeout = setTimeout(async () => {
      this.reconnectTimeout = null;
      await this.reconnectNodesNow(8000).catch(() => {});
    }, delayMs);
  }

  async refreshRiffy(): Promise<boolean> {
    try {
      if (this.hasConnectedNodes()) {
        return true;
      }
      if (this.riffy && typeof this.riffy.destroy === "function") {
        this.riffy.destroy();
      }
      this.riffy = null;
      await this.initializeRiffy();
      const lang = getLangSync_impl();
      console.log(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.green}${lang.console?.lavalink?.riffyReinitialized || "Riffy re-initialized"}${colors.reset}`
      );
      return true;
    } catch (error: any) {
      const lang = getLangSync_impl();
      console.error(
        `${colors.cyan}[ LAVALINK ]${colors.reset} ${colors.red}${lang.console?.lavalink?.failedToReinitialize?.replace("{message}", error.message) || `Failed to re-initialize Riffy: ${error.message}`}${colors.reset}`
      );
      return false;
    }
  }

  setupEventListeners(): void {
    this.riffy.on("nodeConnect", (node: any) => {
      const nodeId = this.findNodeIdByName(node.name);
      if (nodeId) {
        this.nodeStatus.set(nodeId, {
          online: true,
          lastCheck: new Date(),
          lastError: null,
        });
        const availableCount = this.getConnectedNodeCount();
        const totalCount = this.getTotalNodeCount();
        const lang = getLangSync_impl();
        console.log(
          `${colors.cyan}[ LAVALINK ][NODE ]${colors.reset} ${colors.green}${lang.console?.lavalink?.nodeConnected?.replace("{name}", node.name).replace("{host}", node.host).replace("{port}", node.port).replace("{available}", availableCount).replace("{total}", totalCount) || `Connected: ${node.name} (${node.host}:${node.port}) • ${availableCount}/${totalCount} up`}${colors.reset}`
        );

        if (this.connectionResolve) {
          this.connectionResolve(true);
          this.connectionResolve = null;
          this.connectionPromise = null;
        }
      }
    });

    this.riffy.on("nodeDisconnect", (node: any) => {
      const nodeId = this.findNodeIdByName(node.name);
      if (nodeId) {
        const status = this.nodeStatus.get(nodeId) || {};
        this.nodeStatus.set(nodeId, {
          ...status,
          online: false,
          lastCheck: new Date(),
          lastError: "Disconnected",
        });
        const availableCount = this.getConnectedNodeCount();
        const totalCount = this.getTotalNodeCount();
        const lang = getLangSync_impl();
        console.log(
          `${colors.cyan}[ LAVALINK ][NODE ]${colors.reset} ${colors.red}${lang.console?.lavalink?.nodeDisconnected?.replace("{name}", node.name).replace("{host}", node.host).replace("{port}", node.port).replace("{available}", availableCount).replace("{total}", totalCount) || `Disconnected: ${node.name} (${node.host}:${node.port}) • ${availableCount}/${totalCount} up`}${colors.reset}`
        );
      }
    });

    this.riffy.on("nodeError", (node: any, error: any) => {
      const nodeId = this.findNodeIdByName(node.name);
      if (nodeId) {
        const status = this.nodeStatus.get(nodeId) || {};
        const msg = error?.message || "";

        if (
          msg.includes("player.restart is not a function") ||
          msg.includes("restart is not a function")
        ) {
          const lang = getLangSync_impl();
          console.warn(
            `${colors.cyan}[ LAVALINK ][NODE ]${colors.reset} ${colors.yellow}Ignoring Riffy reconnect bug for ${node.name} - node will reconnect automatically${colors.reset}`
          );
          return;
        }

        this.nodeStatus.set(nodeId, {
          ...status,
          online: false,
          lastCheck: new Date(),
          lastError: error.message,
        });
        const availableCount = this.getConnectedNodeCount();
        const totalCount = this.getTotalNodeCount();

        if (msg.includes("after 3 attempts")) {
          const lang = getLangSync_impl();
          console.warn(
            `${colors.cyan}[ LAVALINK ][NODE ]${colors.reset} ${colors.yellow}${lang.console?.lavalink?.retryLimitReported?.replace("{name}", node.name) || `Retry limit reported by ${node.name}; reconnect loop continues`}${colors.reset}`
          );
          this.reconnectNodesNow(3000).catch(() => {});
        } else {
          const lang = getLangSync_impl();
          console.error(
            `${colors.cyan}[ LAVALINK ][NODE ]${colors.reset} ${colors.red}${lang.console?.lavalink?.nodeError?.replace("{name}", node.name).replace("{host}", node.host).replace("{port}", node.port).replace("{message}", msg) || `Error: ${node.name} (${node.host}:${node.port}) • ${msg}`}${colors.reset}`
          );
          console.log(
            `${colors.cyan}[ LAVALINK ][STATUS]${colors.reset} ${colors.yellow}${lang.console?.lavalink?.nodeStatus?.replace("{available}", availableCount).replace("{total}", totalCount) || `${availableCount}/${totalCount} up`}${colors.reset}`
          );
        }
      }
    });
  }

  findNodeIdByName(nodeName: string): string | null {
    for (const [nodeId, node] of this.nodes.entries()) {
      if (
        node.name === nodeName ||
        node.id === nodeName ||
        node.displayName === nodeName ||
        node.originalName === nodeName
      ) {
        return nodeId;
      }
    }
    return null;
  }

  getConnectedNodeCount(): number {
    if (!this.riffy || !this.riffy.nodes) return 0;

    let count = 0;
    try {
      if (this.riffy.nodes instanceof Map) {
        for (const [nodeName, node] of this.riffy.nodes) {
          if (
            node &&
            (node.connected || node.state === "CONNECTED")
          ) {
            const nodeId = this.findNodeIdByName(nodeName);
            if (nodeId) {
              this.nodeStatus.set(nodeId, {
                online: true,
                lastCheck: new Date(),
                lastError: null,
              });
            }
            count++;
          }
        }
      } else if (Array.isArray(this.riffy.nodes)) {
        for (const node of this.riffy.nodes) {
          if (
            node &&
            (node.connected || node.state === "CONNECTED")
          ) {
            const nodeName = node.name || node.identifier;
            const nodeId = this.findNodeIdByName(nodeName);
            if (nodeId) {
              this.nodeStatus.set(nodeId, {
                online: true,
                lastCheck: new Date(),
                lastError: null,
              });
            }
            count++;
          }
        }
      } else if (typeof this.riffy.nodes === "object") {
        for (const nodeName in this.riffy.nodes) {
          const node = this.riffy.nodes[nodeName];
          if (
            node &&
            (node.connected || node.state === "CONNECTED")
          ) {
            const nodeId = this.findNodeIdByName(nodeName);
            if (nodeId) {
              this.nodeStatus.set(nodeId, {
                online: true,
                lastCheck: new Date(),
                lastError: null,
              });
            }
            count++;
          }
        }
      }
    } catch (_) {}

    if (count === 0) {
      for (const status of this.nodeStatus.values()) {
        if (status.online) count++;
      }
    }
    return count;
  }

  getTotalNodeCount(): number {
    return this.nodes.size;
  }

  getNodeCount(): number {
    return this.getConnectedNodeCount();
  }

  hasConnectedNodes(): boolean {
    return this.getConnectedNodeCount() > 0;
  }

  async waitForNodeConnectEvent(
    timeout: number = 8000
  ): Promise<boolean> {
    return new Promise((resolve) => {
      if (!this.riffy) {
        resolve(false);
        return;
      }

      let settled = false;
      const onConnect = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(true);
      };

      const timer = setTimeout(() => {
        if (settled) return;
        settled = true;
        this.riffy?.off?.("nodeConnect", onConnect);
        resolve(false);
      }, timeout);

      this.riffy.once("nodeConnect", onConnect);
    });
  }

  async waitForConnectedNode(
    maxWaitTime: number = 15000
  ): Promise<boolean> {
    if (this.hasConnectedNodes()) {
      return true;
    }

    if (!this.riffy) {
      return false;
    }

    return new Promise((resolve) => {
      const startTime = Date.now();

      const checkInterval = setInterval(() => {
        if (this.hasConnectedNodes()) {
          clearInterval(checkInterval);
          if (this.connectionResolve) {
            this.connectionResolve = null;
            this.connectionPromise = null;
          }
          resolve(true);
          return;
        }

        if (Date.now() - startTime >= maxWaitTime) {
          clearInterval(checkInterval);
          if (this.connectionResolve) {
            this.connectionResolve = null;
            this.connectionPromise = null;
          }
          resolve(false);
        }
      }, 500);

      this.connectionPromise = new Promise((innerResolve) => {
        this.connectionResolve = innerResolve;
      });
    });
  }

  async ensureNodeAvailable(): Promise<boolean> {
    if (this.hasConnectedNodes()) return true;

    const lang = getLangSync_impl();
    console.log(
      `${colors.cyan}[ LAVALINK ][WAIT ]${colors.reset} ${colors.yellow}${lang.console?.lavalink?.waitingForConnection || "Waiting for Lavalink node connection..."}${colors.reset}`
    );

    await this.reconnectNodesNow(5000);
    const eventConnected = await this.waitForNodeConnectEvent(8000);
    if (eventConnected || this.hasConnectedNodes()) {
      const count = this.getConnectedNodeCount();
      const lang = getLangSync_impl();
      console.log(
        `${colors.cyan}[ LAVALINK ][READY]${colors.reset} ${colors.green}${lang.console?.lavalink?.nodeAvailable?.replace("{count}", count) || `Node available (${count} connected)`}${colors.reset}`
      );
      return true;
    }

    throw new Error(
      "No Lavalink nodes are currently available. Please check your node configuration."
    );
  }

  startHealthMonitoring(): void {
    const healthCheckMs = 60000;
    let consecutiveZeroConnected = 0;

    this.healthCheckInterval = setInterval(async () => {
      try {
        const connected = this.getConnectedNodeCount();
        const total = this.getTotalNodeCount();

        if (connected === 0 && total > 0) {
          consecutiveZeroConnected++;
          const backoffMs = Math.min(consecutiveZeroConnected * 30000, 180000);
          const lang = getLangSync_impl();
          console.log(
            `${colors.cyan}[ LAVALINK ][STATUS]${colors.reset} ${colors.yellow}${lang.console?.lavalink?.noNodesConnected?.replace("{connected}", connected).replace("{total}", total) || `No nodes connected (${connected}/${total}) — attempting reconnect in ${backoffMs / 1000}s...`}${colors.reset}`
          );
          this.scheduleReconnect(backoffMs);
        } else {
          consecutiveZeroConnected = 0;
          if (this.hasConnectedNodes()) {
            this.clearScheduledReconnect();
          }
        }

        const lang = getLangSync_impl();
        console.log(
          `${colors.cyan}[ LAVALINK ][STATUS]${colors.reset} ${connected > 0 ? colors.green : colors.red}${lang.console?.lavalink?.nodeStatusReport?.replace("{connected}", connected).replace("{total}", total) || `Node Status: ${connected}/${total} connected`}${colors.reset}`
        );
      } catch (_) {}
    }, healthCheckMs);

    setTimeout(() => {
      const connected = this.getConnectedNodeCount();
      const total = this.getTotalNodeCount();
      const lang = getLangSync_impl();
      console.log(
        `${colors.cyan}[ LAVALINK ][STATUS]${colors.reset} ${connected > 0 ? colors.green : colors.red}${lang.console?.lavalink?.nodeStatusReport?.replace("{connected}", connected).replace("{total}", total) || `Node Status: ${connected}/${total} connected`}${colors.reset}`
      );
    }, 5000);
  }

  getNodeStatus(): any {
    const status: any = {
      total: this.nodes.size,
      online: 0,
      offline: 0,
      nodes: [],
    };

    for (const [nodeId, node] of this.nodes.entries()) {
      const nodeStatus = this.nodeStatus.get(nodeId) || {
        online: false,
      };
      const isConnected = this.isNodeConnected(nodeId);

      status.nodes.push({
        id: nodeId,
        name: node.displayName || node.name || node.id,
        host: node.host,
        port: node.port,
        online: isConnected,
        lastCheck: nodeStatus.lastCheck,
        lastError: nodeStatus.lastError,
      });

      if (isConnected) {
        status.online++;
      } else {
        status.offline++;
      }
    }

    return status;
  }

  isNodeConnected(nodeId: string): boolean {
    const node = this.nodes.get(nodeId);
    if (!node) return false;

    if (this.riffy && this.riffy.nodes) {
      try {
        if (this.riffy.nodes instanceof Map) {
          for (const [nodeName, riffyNode] of this.riffy.nodes) {
            if (
              (nodeName === node.id ||
                nodeName === node.displayName ||
                nodeName === node.name) &&
              riffyNode &&
              (riffyNode.connected ||
                riffyNode.state === "CONNECTED")
            ) {
              return true;
            }
          }
        } else if (Array.isArray(this.riffy.nodes)) {
          for (const riffyNode of this.riffy.nodes) {
            const nodeName =
              riffyNode.name || riffyNode.identifier;
            if (
              (nodeName === node.id ||
                nodeName === node.displayName ||
                nodeName === node.name) &&
              (riffyNode.connected ||
                riffyNode.state === "CONNECTED")
            ) {
              return true;
            }
          }
        } else if (typeof this.riffy.nodes === "object") {
          for (const nodeName in this.riffy.nodes) {
            const riffyNode = this.riffy.nodes[nodeName];
            if (
              (nodeName === node.id ||
                nodeName === node.displayName ||
                nodeName === node.name) &&
              riffyNode &&
              (riffyNode.connected ||
                riffyNode.state === "CONNECTED")
            ) {
              return true;
            }
          }
        }
      } catch (_) {}
    }

    const status = this.nodeStatus.get(nodeId);
    if (status && status.online) return true;

    return false;
  }

  init(userId: string): void {
    if (this.riffy) {
      this.riffy.init(userId);
    }
  }

  destroy(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    if (this.connectLoopInterval) {
      clearInterval(this.connectLoopInterval);
      this.connectLoopInterval = null;
    }
    this.clearScheduledReconnect();
    if (this.riffy) {
      this.riffy.destroy();
      this.riffy = null;
    }
    this.initialized = false;
  }
}

let nodeManagerInstance: LavalinkNodeManager | null = null;

export async function initializeLavalinkManager(
  client: any
): Promise<LavalinkNodeManager> {
  if (!nodeManagerInstance) {
    nodeManagerInstance = new LavalinkNodeManager(client);
    await nodeManagerInstance.initializeRiffy();
  }
  return nodeManagerInstance;
}

export function getLavalinkManager(): LavalinkNodeManager | null {
  return nodeManagerInstance;
}

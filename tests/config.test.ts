import { config } from "../src/config";

describe("config", () => {
  it("should have default values", () => {
    expect(config.language).toBe("en");
    expect(config.embedColor).toBe("#e11d2e");
    expect(config.lowMemoryMode).toBe(false);
    expect(config.port).toBe(3000);
  });

  it("should have lavalink nodes configured", () => {
    expect(config.nodes.length).toBeGreaterThan(0);
  });

  it("should have application emojis enabled by default", () => {
    expect(config.applicationEmojis.enabled).toBe(true);
    expect(config.applicationEmojis.autoSync).toBe(true);
  });
});

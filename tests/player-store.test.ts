import { describe, it, expect } from "vitest";
import { requesters, PLAYER_FAVORITES_NAME, LEGACY_PLAYER_FAVORITES_NAME, getCommandRef } from "../src/music/player-store";

describe("player-store", () => {
  it("should export an empty requesters map", () => {
    expect(requesters).toBeInstanceOf(Map);
    expect(requesters.size).toBe(0);
  });

  it("should export PLAYER_FAVORITES_NAME constant", () => {
    expect(PLAYER_FAVORITES_NAME).toBe("AutoFavourites");
  });

  it("should export LEGACY_PLAYER_FAVORITES_NAME constant", () => {
    expect(LEGACY_PLAYER_FAVORITES_NAME).toBe("__FAVORITES__");
  });

  it("should allow setting and getting requesters", () => {
    requesters.set("test-uri", "test-user");
    expect(requesters.get("test-uri")).toBe("test-user");
    requesters.delete("test-uri");
    expect(requesters.get("test-uri")).toBeUndefined();
  });

  it("should export getCommandRef function", () => {
    expect(getCommandRef).toBeDefined();
  });
});

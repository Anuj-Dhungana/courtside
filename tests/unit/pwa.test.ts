import fs from "fs";
import path from "path";
import { describe, expect, it } from "vitest";

import manifest from "@/app/manifest";

describe("PWA Manifest & Configuration", () => {
  it("generates a valid web manifest with standalone display and theme colors", () => {
    const data = manifest();
    expect(data.name).toBe("CourtSide — Live Sports");
    expect(data.short_name).toBe("CourtSide");
    expect(data.display).toBe("standalone");
    expect(data.theme_color).toBe("#07090f");
    expect(data.background_color).toBe("#07090f");
    expect(data.start_url).toBe("/");
  });

  it("contains all required icon resolutions including maskable", () => {
    const data = manifest();
    expect(data.icons).toBeDefined();
    expect(data.icons?.length).toBeGreaterThanOrEqual(3);

    const sizes = data.icons?.map((icon) => icon.sizes);
    expect(sizes).toContain("192x192");
    expect(sizes).toContain("512x512");

    const maskable = data.icons?.find((icon) => icon.purpose === "maskable");
    expect(maskable).toBeDefined();
    expect(maskable?.sizes).toBe("512x512");
  });

  it("defines essential sports app shortcuts", () => {
    const data = manifest();
    expect(data.shortcuts).toBeDefined();
    const urls = data.shortcuts?.map((s) => s.url);
    expect(urls).toContain("/live");
    expect(urls).toContain("/schedule");
    expect(urls).toContain("/sports");
  });

  it("verifies all icon files exist in public/icons directory", () => {
    const publicIconsDir = path.join(process.cwd(), "public", "icons");
    expect(fs.existsSync(path.join(publicIconsDir, "icon-192x192.png"))).toBe(
      true
    );
    expect(fs.existsSync(path.join(publicIconsDir, "icon-512x512.png"))).toBe(
      true
    );
    expect(
      fs.existsSync(path.join(publicIconsDir, "icon-maskable-512x512.png"))
    ).toBe(true);
    expect(fs.existsSync(path.join(publicIconsDir, "apple-touch-icon.png"))).toBe(
      true
    );
    expect(fs.existsSync(path.join(publicIconsDir, "icon.svg"))).toBe(true);
  });

  it("verifies service worker file exists in public/sw.js", () => {
    const swPath = path.join(process.cwd(), "public", "sw.js");
    expect(fs.existsSync(swPath)).toBe(true);
    const swContent = fs.readFileSync(swPath, "utf-8");
    expect(swContent).toContain("courtside-v1");
    expect(swContent).toContain("/offline");
  });
});

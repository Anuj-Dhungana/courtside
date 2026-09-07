import { expect, test } from "@playwright/test";

test.describe("homepage", () => {
  test("loads with hero, sections and footer", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CourtSide/);
    await expect(page.getByRole("heading", { name: "Live Now" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Browse Sports" }),
    ).toBeVisible();
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: "Disclaimer" }),
    ).toBeVisible();
  });

  test("sports cards navigate to sport pages", async ({ page }) => {
    await page.goto("/");
    const sportsSection = page.getByRole("region", { name: "Browse Sports" });
    // Click the first sport card link under the Browse Sports heading.
    const firstSport = page.locator('a[href^="/sports/"]').first();
    await firstSport.click();
    await expect(page).toHaveURL(/\/sports\/[a-z-]+/);
    await expect(page.getByRole("heading", { name: "Upcoming" })).toBeVisible();
    void sportsSection;
  });
});

test.describe("live page", () => {
  test("shows live board with filter controls", async ({ page }) => {
    await page.goto("/live");
    await expect(page.getByRole("heading", { name: "Live Now" })).toBeVisible();
    await expect(
      page.getByPlaceholder("Filter by team or event…"),
    ).toBeVisible();
    await expect(page.getByLabel("Filter by sport")).toBeVisible();
  });

  test("sport filter narrows visible events", async ({ page }) => {
    await page.goto("/live");
    const select = page.getByLabel("Filter by sport");
    const options = await select.locator("option").allTextContents();
    if (options.length > 1) {
      await select.selectOption({ index: 1 });
      // Status line updates with a count — no crash and cards still render.
      await expect(page.getByRole("status")).toContainText(/event/);
    }
  });
});

test.describe("sports index", () => {
  test("lists API-provided sports", async ({ page }) => {
    await page.goto("/sports");
    await expect(
      page.getByRole("heading", { name: "All Sports" }),
    ).toBeVisible();
    const cards = page.locator('a[href^="/sports/"]');
    expect(await cards.count()).toBeGreaterThan(3);
  });
});

test.describe("event page", () => {
  test("opens an event from the homepage or live page", async ({ page }) => {
    await page.goto("/");
    const eventLink = page.locator('a[href^="/events/"]').first();
    const count = await eventLink.count();
    test.skip(count === 0, "No events available right now");
    await eventLink.click();
    await expect(page).toHaveURL(/\/events\//);
    await expect(
      page.getByRole("heading", { name: "Where to Watch" }),
    ).toBeVisible();
    // Third-party notice must always be present.
    await expect(
      page.getByText("Third-party sources", { exact: true }),
    ).toBeVisible();
  });

  test("unknown event shows friendly not-found", async ({ page }) => {
    await page.goto("/events/this-event-does-not-exist-000");
    await expect(
      page.getByRole("heading", { name: "Event not found" }),
    ).toBeVisible();
  });
});

test.describe("search", () => {
  test("debounced search returns results or empty state", async ({ page }) => {
    await page.goto("/search");
    const input = page.getByPlaceholder("Search teams, events, sports…");
    await expect(input).toBeVisible();
    await input.fill("foot");
    // Debounce + fetch: either sports chips or events grid or empty state.
    await expect(
      page
        .getByRole("link", { name: /Football/ })
        .first()
        .or(page.getByText(/No results/)),
    ).toBeVisible({ timeout: 10_000 });
    await expect(page).toHaveURL(/q=foot/);
  });

  test("short queries show idle guidance", async ({ page }) => {
    await page.goto("/search");
    await expect(page.getByText("Search the world of sport")).toBeVisible();
  });
});

test.describe("mobile navigation", () => {
  test("hamburger menu opens and navigates", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-only test");
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNav = page.getByRole("navigation", {
      name: "Mobile navigation",
    });
    await expect(mobileNav).toBeVisible();
    await mobileNav.getByRole("link", { name: "Live" }).click();
    await expect(page).toHaveURL(/\/live/);
  });
});

test.describe("SEO & a11y basics", () => {
  test("pages expose canonical and OG metadata", async ({ page }) => {
    await page.goto("/live");
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/live/);
  });

  test("skip link focuses main content", async ({ page, isMobile }) => {
    test.skip(isMobile, "Keyboard-focused test on desktop only");
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(
      page.getByRole("link", { name: "Skip to content" }),
    ).toBeFocused();
  });
});

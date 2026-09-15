import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("search, filter, details, and return preserve the research context", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "View Aderinib, In Development" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("ader");
  await expect(
    page.getByRole("list", { name: "Drug candidates" }).getByRole("listitem"),
  ).toHaveCount(1);
  await page.getByLabel("Filter by status").selectOption("In Development");
  await expect(page).toHaveURL(/status=In\+Development/);
  await page
    .getByRole("link", { name: "View Aderinib, In Development" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Mechanism of action" }),
  ).toBeVisible();
  await expect(page).toHaveTitle("Aderinib | Candidate Atlas");
  await page.getByRole("link", { name: "Back to candidates" }).click();
  await expect(page.getByRole("searchbox")).toHaveValue("ader");
  await expect(page.getByLabel("Filter by status")).toHaveValue(
    "In Development",
  );
});
test("pagination, sorting, and reload work from the URL", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page).toHaveURL(/page=2/);
  await expect(
    page.getByRole("link", { name: "View Istraven, Approved" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "View Istraven, Approved" }),
  ).toBeVisible();
  await page.getByLabel("Sort candidates").selectOption("name-desc");
  await expect(
    page
      .getByRole("list", { name: "Drug candidates" })
      .getByRole("link")
      .first(),
  ).toContainText("Zerunex");
  await expect(page).not.toHaveURL(/page=2/);
});
test("empty state recovers on clear", async ({ page }) => {
  await page.goto("/?q=does-not-exist");
  await expect(
    page.getByRole("heading", { name: "No candidates found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Clear all filters" }).last().click();
  await expect(
    page.getByRole("link", { name: "View Aderinib, In Development" }),
  ).toBeVisible();
  await expect(page.getByRole("searchbox")).toHaveValue("");
});
test("API failure is recoverable with retry", async ({ page }) => {
  let fail = true;
  await page.route("**/api/candidates?*", (route) =>
    fail ? route.fulfill({ status: 500, body: "{}" }) : route.continue(),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Unable to load candidates" }),
  ).toBeVisible();
  fail = false;
  await page.getByRole("button", { name: "Try again" }).click();
  await expect(
    page.getByRole("link", { name: "View Aderinib, In Development" }),
  ).toBeVisible();
});
test("stale responses cannot overwrite a newer search", async ({ page }) => {
  await page.route("**/api/candidates?*", async (route) => {
    if (new URL(route.request().url()).searchParams.get("q") === "ader")
      await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue().catch(() => {});
  });
  await page.goto("/");
  await expect(
    page.getByRole("link", { name: "View Aderinib, In Development" }),
  ).toBeVisible();
  await page.getByRole("searchbox").fill("ader");
  await expect(page).toHaveURL(/q=ader/);
  await page.getByRole("searchbox").fill("belu");
  await expect(
    page.getByRole("link", { name: "View Belunimab, In Development" }),
  ).toBeVisible();
  await expect(
    page.getByRole("list", { name: "Drug candidates" }).getByRole("listitem"),
  ).toHaveCount(1);
});
test("unknown details have a helpful recovery link", async ({ page }) => {
  await page.goto("/candidates/missing");
  await expect(
    page.getByRole("heading", { name: "Candidate not found" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Return to library" }).click();
  await expect(
    page.getByRole("heading", { name: "Candidate library." }),
  ).toBeVisible();
});
test("desktop and mobile have no detected WCAG A/AA violations or horizontal overflow", async ({
  page,
}) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const url of ["/", "/candidates/ca-001"]) {
      await page.goto(url);
      if (url === "/")
        await expect(
          page.getByRole("link", { name: "View Aderinib, In Development" }),
        ).toBeVisible();
      await page.screenshot({
        path: test
          .info()
          .outputPath(`${url === "/" ? "library" : "profile"}-${width}.png`),
        fullPage: true,
      });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    }
  }
});
test("keyboard users can skip navigation and search", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("searchbox")).toBeFocused();
  await page.keyboard.type("Ceralex");
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("link", { name: "View Ceralex, Approved" }),
  ).toBeVisible();
});

import { expect, test } from "@playwright/test";

// Each test gets a fresh browser context and therefore its own real SQLite OPFS database.
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date("2026-10-23T06:30:00Z"));
  await page.goto("/");
});

test("log short unplanned practice and retain it after reopening", async ({
  page,
}) => {
  await expect(page.getByText("No practice logged today.")).toBeVisible();
  await page.getByRole("button", { name: "Log practice", exact: true }).click();
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("0.5");
  await page.getByRole("button", { name: "Singing", exact: true }).click();
  await page.getByRole("button", { name: "Learning intent" }).click();
  await page.getByRole("button", { name: "Singing focus" }).click();
  await page.getByRole("textbox", { name: "Notes" }).fill("Quiet warmup");
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByText("0.5 min logged today")).toBeVisible();
  await page.waitForURL("/");
  await page.reload();
  await expect(page.getByText("0.5 min logged today")).toBeVisible();
  await expect(page.getByText("Quiet warmup")).toBeVisible();
});

test("correct dates and durations, delete with confirmation, and preserve unrelated sessions", async ({
  page,
}) => {
  async function log(minutes: string, notes: string) {
    await page
      .getByRole("button", { name: "Log practice", exact: true })
      .click();
    await page
      .getByRole("textbox", { name: "Duration (minutes)" })
      .fill(minutes);
    await page.getByRole("textbox", { name: "Notes" }).fill(notes);
    await page.getByRole("button", { name: "Save session" }).click();
    await expect(page.getByText(notes, { exact: true })).toBeVisible();
  }
  await log("10", "First session");
  await log("5", "Keep this session");
  await expect(page.getByText("15 min logged today")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Edit Repetition session: First session",
      exact: true,
    })
    .click();
  await page
    .getByRole("textbox", { name: "Date (YYYY-MM-DD)" })
    .fill("2026-10-22");
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("12");
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByText("5 min logged today")).toBeVisible();
  await page.getByRole("tab", { name: /History/ }).click();
  await expect(page.getByText("2026-10-22 · 12 min total")).toBeVisible();
  await expect(page.getByText("2026-10-23 · 5 min total")).toBeVisible();
  await page
    .getByRole("button", {
      name: "Edit Repetition session: First session",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Delete session", exact: true })
    .click();
  await page.getByRole("button", { name: "Keep session", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Notes" })).toHaveValue(
    "First session",
  );
  await page
    .getByRole("button", { name: "Delete session", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm delete", exact: true })
    .click();
  await expect(page.getByText("First session", { exact: true })).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "Edit Repetition session: Keep this session",
      exact: true,
    }),
  ).toBeVisible();
  await page.waitForURL("/history");
  await page.reload();
  await expect(page.getByText("2026-10-23 · 5 min total")).toBeVisible();
  await expect(page.getByText("2026-10-22 · 12 min total")).toHaveCount(0);
});

test("combined practice counts once and can be logged offline", async ({
  page,
  context,
}) => {
  await expect(page.getByText("No practice logged today.")).toBeVisible();
  await context.setOffline(true);
  await page.getByRole("button", { name: "Log practice", exact: true }).click();
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("20");
  await page
    .getByRole("button", { name: "Combined performance", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Singing focus", exact: true })
    .click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByText("20 min logged today")).toBeVisible();
  await expect(page.getByText("Practice · Guitar + Singing")).toBeVisible();
  // Web needs HTTP to load its JS bundle. Cache those files to stand in for the
  // installed native bundle, then cold-start with all network requests blocked.
  await context.setOffline(false);
  const assets = new Map<string, import("@playwright/test").APIResponse>();
  const capture = async (route: import("@playwright/test").Route) => {
    const response = await route.fetch();
    assets.set(route.request().url(), response);
    await route.fulfill({ response });
  };
  await context.route("**/*", capture);
  await page.reload();
  await expect(page.getByText("20 min logged today")).toBeVisible();
  await context.unroute("**/*", capture);
  const uncached: string[] = [];
  await context.route("**/*", async (route) => {
    const asset = assets.get(route.request().url());
    if (asset) await route.fulfill({ response: asset });
    else {
      uncached.push(route.request().url());
      await route.abort();
    }
  });
  await context.setOffline(true);
  await page.close();
  const reopened = await context.newPage();
  await reopened.clock.setFixedTime(new Date("2026-10-23T06:30:00Z"));
  await reopened.goto("/");
  await expect(reopened.getByText("20 min logged today")).toBeVisible();
  expect(uncached).toEqual([]);
});

test("empty destinations, validation, canceled edits, and local midnight", async ({
  page,
}) => {
  await page.getByRole("tab", { name: /History/ }).click();
  await expect(
    page.getByText("No sessions yet. Your first log will appear here."),
  ).toBeVisible();
  await page.getByRole("tab", { name: /Library/ }).click();
  await expect(page.getByText(/No songs or skills saved yet/)).toBeVisible();
  await page.getByRole("tab", { name: /Settings/ }).click();
  await expect(page.getByText(/Weeks run Monday through Sunday/)).toBeVisible();
  await page.getByRole("tab", { name: /Home/ }).click();
  await page.getByRole("button", { name: "Log practice", exact: true }).click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a duration greater than zero.",
  );
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("-2");
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a duration greater than zero.",
  );
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("2");
  await page
    .getByRole("textbox", { name: "Date (YYYY-MM-DD)" })
    .fill("2026-02-30");
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Enter a valid date as YYYY-MM-DD.",
  );
  await page
    .getByRole("textbox", { name: "Date (YYYY-MM-DD)" })
    .fill("2026-10-23");
  await page.getByRole("button", { name: "Guitar focus", exact: true }).click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Choose at least one focus area.",
  );
  await page.getByRole("button", { name: "Guitar focus", exact: true }).click();
  await page.getByRole("button", { name: "Save session" }).click();
  await expect(page.getByText("2 min logged today")).toBeVisible();
  await page
    .getByRole("button", { name: "Edit Repetition session", exact: true })
    .click();
  await page.getByRole("textbox", { name: "Duration (minutes)" }).fill("99");
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByText("2 min logged today")).toBeVisible();
  await page.waitForURL("/");
  // 18:30 UTC is midnight in the controlled Asia/Kolkata timezone.
  await page.clock.setFixedTime(new Date("2026-10-23T18:31:00Z"));
  await page.reload();
  await expect(page.getByText("2026-10-24", { exact: true })).toBeVisible();
  await expect(page.getByText("0 min logged today")).toBeVisible();
  await page.getByRole("tab", { name: /History/ }).click();
  await expect(page.getByText("2026-10-23 · 2 min total")).toBeVisible();
});

import { expect, test, type APIRequestContext, type Page } from "@playwright/test";

let createdGameId: number | undefined;

async function fillGameForm(
  page: Page,
  title: string,
  comments: string,
): Promise<void> {
  await page.getByRole("textbox", { name: "Title" }).fill(title);
  await page.getByRole("textbox", { name: "Original release year" }).fill("2022");
  await page.getByRole("checkbox", { name: "Nintendo Switch" }).check();
  await page.getByRole("combobox", { name: "ESRB rating" }).click();
  await page.getByRole("option", { name: "T", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Personal comments" })
    .fill(comments);
}

async function removeCreatedGame(
  request: APIRequestContext,
  gameId: number,
): Promise<void> {
  const response = await request.delete(`/api/v1/games/${gameId}`);
  if (!response.ok() && response.status() !== 404) {
    throw new Error(
      `Test cleanup could not delete game ${gameId}: HTTP ${response.status()}`,
    );
  }
}

test.beforeEach(() => {
  createdGameId = undefined;
});

test.afterEach(async ({ request }) => {
  if (createdGameId !== undefined) {
    await removeCreatedGame(request, createdGameId);
    createdGameId = undefined;
  }
});

test("creates, searches, filters, edits, views, and deletes a collection game", async ({
  page,
}) => {
  const title = `E2E Game ${crypto.randomUUID()}`;
  const comments = `e2e-marker-${crypto.randomUUID()}`;

  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your game collection", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add game" })).toBeVisible();
  await page.getByRole("button", { name: "Add game" }).click();
  await expect(
    page.getByRole("heading", { name: "Add a game", level: 1 }),
  ).toBeVisible();
  await fillGameForm(page, title, comments);

  const createResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/games",
  );
  await page.getByRole("button", { name: "Save game" }).click();
  const createResponse = await createResponsePromise;
  expect(createResponse.ok()).toBeTruthy();
  const createdGame: unknown = await createResponse.json();
  if (
    typeof createdGame !== "object" ||
    createdGame === null ||
    !("id" in createdGame) ||
    typeof createdGame.id !== "number"
  ) {
    throw new Error("The create-game response did not include a numeric ID.");
  }
  createdGameId = createdGame.id;

  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await expect(page.getByText(comments)).toBeVisible();
  await expect(page.getByText("Nintendo Switch")).toBeVisible();

  await page.getByRole("button", { name: "Back to collection" }).click();
  const search = page.getByRole("searchbox", { name: "Search games" });
  await search.fill(title);
  const gameCard = page.getByRole("button", {
    name: `View details for ${title}`,
  });
  await expect(gameCard).toBeVisible();

  await page.getByRole("combobox", { name: "Consoles" }).click();
  await page.getByRole("option", { name: "Nintendo Switch" }).click();
  await page.keyboard.press("Escape");
  await expect(gameCard).toBeVisible();

  await gameCard.click();
  await expect(page.getByRole("heading", { name: title, level: 1 })).toBeVisible();
  await page.getByRole("button", { name: "Edit game" }).click();
  await expect(
    page.getByRole("heading", { name: "Edit game", level: 1 }),
  ).toBeVisible();

  const updatedTitle = `${title} Updated`;
  const updatedComments = `${comments}-edited`;
  await page.getByRole("textbox", { name: "Title" }).fill(updatedTitle);
  await page
    .getByRole("textbox", { name: "Personal comments" })
    .fill(updatedComments);
  const updateResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "PUT" &&
      new URL(response.url()).pathname === `/api/v1/games/${createdGameId}`,
  );
  await page.getByRole("button", { name: "Save game" }).click();
  expect((await updateResponsePromise).ok()).toBeTruthy();
  await expect(
    page.getByRole("heading", { name: updatedTitle, level: 1 }),
  ).toBeVisible();
  await expect(page.getByText(updatedComments)).toBeVisible();

  await page.getByRole("button", { name: "Delete game" }).click();
  const deleteDialog = page.getByRole("dialog", { name: "Delete game?" });
  await expect(deleteDialog).toContainText(updatedTitle);
  const deleteResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "DELETE" &&
      new URL(response.url()).pathname === `/api/v1/games/${createdGameId}`,
  );
  await deleteDialog.getByRole("button", { name: "Confirm deletion" }).click();
  expect((await deleteResponsePromise).ok()).toBeTruthy();
  await expect(
    page.getByRole("button", { name: `View details for ${updatedTitle}` }),
  ).toHaveCount(0);
  createdGameId = undefined;
});

test("does not save a game and shows an error when create fails", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your game collection", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add game" })).toBeVisible();
  await page.getByRole("button", { name: "Add game" }).click();
  await expect(
    page.getByRole("heading", { name: "Add a game", level: 1 }),
  ).toBeVisible();
  await fillGameForm(
    page,
    `E2E Failed Save ${crypto.randomUUID()}`,
    `e2e-failed-save-${crypto.randomUUID()}`,
  );
  await page.route(
    (url) => url.pathname === "/api/v1/games",
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          code: "SERVICE_UNAVAILABLE",
          message: "The service is temporarily unavailable.",
          details: [],
        }),
      }),
  );
  const failedResponsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      new URL(response.url()).pathname === "/api/v1/games",
  );
  await page.getByRole("button", { name: "Save game" }).click();
  expect((await failedResponsePromise).status()).toBe(503);

  await expect(
    page.getByRole("alert").getByText("We couldn’t save this game. Please try again."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Add a game", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: /E2E Failed Save/,
      level: 1,
    }),
  ).toHaveCount(0);
});

import type { Game, GamePage, GameWrite } from "../features/collection/types";

const game: Game = {
  id: 7,
  title: "Moonlit Harbor",
  originalReleaseYear: 2022,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: "E",
  maxLocalMultiplayerPlayers: 4,
  coverImageUrl: null,
  personalComments: "A favorite co-op adventure.",
};

const write: GameWrite = {
  title: game.title,
  originalReleaseYear: game.originalReleaseYear,
  consoles: game.consoles,
  esrbRating: game.esrbRating,
  maxLocalMultiplayerPlayers: game.maxLocalMultiplayerPlayers,
  coverImageUrl: game.coverImageUrl,
  personalComments: game.personalComments,
};

function apiUrl(path: string): URL {
  return new URL(path, window.location.origin);
}

async function getCollection(url = "/api/v1/games"): Promise<GamePage> {
  const response = await fetch(apiUrl(url));
  expect(response.status).toBe(200);
  return response.json();
}

describe("shared API mock handlers", () => {
  it("filters, sorts, and paginates collection requests using API query parameters", async () => {
    const page = await getCollection(
      "/api/v1/games?keyword=co-op&console=Nintendo+Switch&console=Sony+PlayStation+5&rating=T&minPlayers=2&maxPlayers=2&sort=title&direction=desc&page=0&size=1",
    );

    expect(page).toEqual({
      items: [
        {
          ...game,
          id: 1,
          title: "Starfall Tactics",
          originalReleaseYear: 2023,
          consoles: [
            { name: "Nintendo Switch" },
            { name: "Sony PlayStation 5" },
          ],
          esrbRating: "T",
          maxLocalMultiplayerPlayers: 2,
          personalComments: "A favorite for weekend co-op.",
        },
      ],
      page: 0,
      size: 1,
      totalItems: 1,
      totalPages: 1,
    });
  });

  it("serves console and game reads, mutations, and in-session updated collection data", async () => {
    const consolesResponse = await fetch(apiUrl("/api/v1/consoles"));
    const consoles = await consolesResponse.json();
    expect(consoles).toContainEqual({ name: "Nintendo Switch" });

    const createdResponse = await fetch(apiUrl("/api/v1/games"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(write),
    });
    expect(createdResponse.status).toBe(201);
    const created: Game = await createdResponse.json();
    expect(created).toMatchObject(write);
    expect(createdResponse.headers.get("Location")).toBe(
      `/api/v1/games/${created.id}`,
    );

    const updatedResponse = await fetch(apiUrl(`/api/v1/games/${created.id}`), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...write, title: "Moonlit Harbor Updated" }),
    });
    expect(updatedResponse.status).toBe(200);
    expect(await updatedResponse.json()).toMatchObject({
      id: created.id,
      title: "Moonlit Harbor Updated",
    });

    const detailResponse = await fetch(
      apiUrl(`/api/v1/games/${created.id}`),
    );
    expect(await detailResponse.json()).toMatchObject({
      id: created.id,
      title: "Moonlit Harbor Updated",
    });
    expect(
      (await getCollection("/api/v1/games?keyword=Moonlit")).items.some(
        (item) => item.title === "Moonlit Harbor Updated",
      ),
    ).toBe(true);

    const deleteResponse = await fetch(apiUrl(`/api/v1/games/${created.id}`), {
      method: "DELETE",
    });
    expect(deleteResponse.status).toBe(204);
    expect(await deleteResponse.text()).toBe("");
    expect(
      (
        await getCollection(
          "/api/v1/games?keyword=Moonlit+Harbor+Updated",
        )
      ).items.some((item) => item.id === created.id),
    ).toBe(false);
  });

  it("supports page navigation over the seeded mock collection", async () => {
    const firstPage = await getCollection("/api/v1/games?page=0&size=20");
    const secondPage = await getCollection("/api/v1/games?page=1&size=20");

    expect(firstPage).toMatchObject({
      page: 0,
      size: 20,
      totalItems: 25,
      totalPages: 2,
    });
    expect(firstPage.items).toHaveLength(20);
    expect(secondPage).toMatchObject({
      page: 1,
      size: 20,
      totalItems: 25,
      totalPages: 2,
    });
    expect(secondPage.items).toHaveLength(5);
  });

  it("returns contract-shaped errors for invalid queries, writes, and missing games", async () => {
    const invalidQuery = await fetch(
      apiUrl("/api/v1/games?minPlayers=4&maxPlayers=2"),
    );
    expect(invalidQuery.status).toBe(400);
    expect(await invalidQuery.json()).toMatchObject({
      code: "INVALID_REQUEST",
      message: "Request contains invalid values.",
      details: [{ field: "minPlayers", message: "must not exceed maxPlayers" }],
    });

    const invalidWrite = await fetch(apiUrl("/api/v1/games"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...write, title: " " }),
    });
    expect(invalidWrite.status).toBe(400);
    expect(await invalidWrite.json()).toMatchObject({
      code: "INVALID_REQUEST",
      details: [{ field: "title", message: "must not be blank" }],
    });

    const missingGame = await fetch(apiUrl("/api/v1/games/404"));
    expect(missingGame.status).toBe(404);
    expect(await missingGame.json()).toMatchObject({
      code: "GAME_NOT_FOUND",
      message: "Game with the specified identifier was not found.",
      details: [],
    });
  });
});

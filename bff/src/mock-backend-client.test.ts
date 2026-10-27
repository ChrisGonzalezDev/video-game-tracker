import { describe, expect, test } from "@jest/globals";
import { createMockBackendClient } from "./mock-backend-client.js";

describe("mock backend client", () => {
  test("returns a fixed contract-shaped collection regardless of query", async () => {
    const client = createMockBackendClient();
    const defaultResponse = await client.getGames(new URLSearchParams());
    const filteredResponse = await client.getGames(
      new URLSearchParams("keyword=missing&page=3&size=1"),
    );

    expect(defaultResponse).toMatchObject({
      status: 200,
      contentType: "application/json",
      location: null,
    });
    expect(JSON.parse(defaultResponse.body)).toMatchObject({
      page: 0,
      size: 20,
      totalItems: 4,
      totalPages: 1,
      items: expect.arrayContaining([
        expect.objectContaining({ id: 1, title: "Starfall Tactics" }),
      ]),
    });
    expect(filteredResponse.body).toBe(defaultResponse.body);
  });

  test("returns fixed create and replacement responses without changing fixtures", async () => {
    const client = createMockBackendClient();
    const created = await client.createGame({
      title: "Ignored by the fixed mock",
      originalReleaseYear: 2025,
      consoles: [{ name: "Nintendo Switch" }],
    });
    const replaced = await client.replaceGame(1, {
      title: "Ignored replacement",
      originalReleaseYear: 2025,
      consoles: [{ name: "Nintendo Switch" }],
    });
    const original = await client.getGame(1);
    const createdIdLookup = await client.getGame(5);

    expect(created).toMatchObject({
      status: 201,
      contentType: "application/json",
      location: "/api/v1/games/5",
    });
    expect(JSON.parse(created.body)).toMatchObject({
      id: 5,
      title: "Sample New Game",
    });
    expect(replaced.status).toBe(200);
    expect(JSON.parse(replaced.body)).toMatchObject({
      id: 1,
      title: "Starfall Tactics",
    });
    expect(JSON.parse(original.body)).toMatchObject({
      id: 1,
      title: "Starfall Tactics",
    });
    expect(createdIdLookup.status).toBe(404);
  });

  test("returns fixed delete responses without removing fixtures", async () => {
    const client = createMockBackendClient();
    const deleted = await client.deleteGame(1);
    const stillPresent = await client.getGame(1);
    const missing = await client.deleteGame(999);

    expect(deleted).toMatchObject({
      status: 204,
      contentType: null,
      location: null,
      body: "",
    });
    expect(stillPresent.status).toBe(200);
    expect(missing.status).toBe(404);
    expect(JSON.parse(missing.body)).toEqual({
      code: "GAME_NOT_FOUND",
      message: "Game with the specified identifier was not found.",
      details: [],
    });
  });

  test("returns the supported console catalog", async () => {
    const response = await createMockBackendClient().getConsoles();

    expect(response.status).toBe(200);
    expect(JSON.parse(response.body)).toEqual([
      { name: "Microsoft Xbox Series X/S" },
      { name: "Nintendo Switch" },
      { name: "Sony PlayStation 5" },
    ]);
  });
});

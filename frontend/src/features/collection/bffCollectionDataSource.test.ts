import { http, HttpResponse } from "msw";
import { server } from "../../test/testServer";
import {
  BffRequestError,
  createBffCollectionDataSource,
} from "./bffCollectionDataSource";
import type { Game, GamePage, GameWrite } from "./types";

const game: Game = {
  id: 7,
  title: "Moonlit Harbor",
  originalReleaseYear: 2022,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: "E",
  maxLocalMultiplayerPlayers: 4,
  coverImageUrl: null,
  personalComments: null,
};

const page: GamePage = {
  items: [game],
  page: 0,
  size: 20,
  totalItems: 1,
  totalPages: 1,
};

describe("BFF collection data source", () => {
  it("serializes all supported collection criteria and repeats console parameters", async () => {
    let requestedUrl: URL | undefined;
    server.use(
      http.get("http://localhost/api/v1/games", ({ request }) => {
        requestedUrl = new URL(request.url);
        return HttpResponse.json(page);
      }),
    );

    await createBffCollectionDataSource().getCollection({
      keyword: " harbor ",
      consoles: ["Nintendo Switch", "Sony PlayStation 5"],
      rating: "E",
      minPlayers: 2,
      maxPlayers: 4,
      sort: "originalReleaseYear",
      direction: "desc",
      page: 3,
    });

    expect(requestedUrl?.pathname).toBe("/api/v1/games");
    expect(requestedUrl?.searchParams.get("keyword")).toBe("harbor");
    expect(requestedUrl?.searchParams.getAll("console")).toEqual([
      "Nintendo Switch",
      "Sony PlayStation 5",
    ]);
    expect(requestedUrl?.searchParams.get("rating")).toBe("E");
    expect(requestedUrl?.searchParams.get("minPlayers")).toBe("2");
    expect(requestedUrl?.searchParams.get("maxPlayers")).toBe("4");
    expect(requestedUrl?.searchParams.get("sort")).toBe("originalReleaseYear");
    expect(requestedUrl?.searchParams.get("direction")).toBe("desc");
    expect(requestedUrl?.searchParams.get("page")).toBe("3");
  });

  it("sends JSON create/update requests and an empty delete request to the BFF", async () => {
    const requests: Array<{
      method: string;
      url: URL;
      body?: unknown;
    }> = [];
    server.use(
      http.post("http://localhost/api/v1/games", async ({ request }) => {
        requests.push({
          method: request.method,
          url: new URL(request.url),
          body: await request.json(),
        });
        return HttpResponse.json(game, { status: 201 });
      }),
      http.put("http://localhost/api/v1/games/:id", async ({ request }) => {
        requests.push({
          method: request.method,
          url: new URL(request.url),
          body: await request.json(),
        });
        return HttpResponse.json(game);
      }),
      http.delete("http://localhost/api/v1/games/:id", ({ request }) => {
        requests.push({ method: request.method, url: new URL(request.url) });
        return new HttpResponse(null, { status: 204 });
      }),
    );
    const dataSource = createBffCollectionDataSource();
    const write: GameWrite = {
      title: game.title,
      originalReleaseYear: game.originalReleaseYear,
      consoles: game.consoles,
      esrbRating: game.esrbRating,
      maxLocalMultiplayerPlayers: game.maxLocalMultiplayerPlayers,
      coverImageUrl: game.coverImageUrl,
      personalComments: game.personalComments,
    };

    await expect(dataSource.createGame(write)).resolves.toEqual(game);
    await expect(dataSource.updateGame(game.id, write)).resolves.toEqual(game);
    await expect(dataSource.deleteGame(game.id)).resolves.toBeUndefined();

    expect(requests).toHaveLength(3);
    expect(requests[0].method).toBe("POST");
    expect(requests[0].url.pathname).toBe("/api/v1/games");
    expect(requests[0].body).toEqual(write);
    expect(requests[1].method).toBe("PUT");
    expect(requests[1].url.pathname).toBe("/api/v1/games/7");
    expect(requests[1].body).toEqual(write);
    expect(requests[2].method).toBe("DELETE");
    expect(requests[2].url.pathname).toBe("/api/v1/games/7");
  });

  it("returns undefined for a missing game and preserves BFF error messages", async () => {
    server.use(
      http.get("http://localhost/api/v1/games/404", () =>
        HttpResponse.json(
          { code: "GAME_NOT_FOUND", message: "Game was not found.", details: [] },
          { status: 404 },
        ),
      ),
      http.get("http://localhost/api/v1/games", () =>
        HttpResponse.json(
          { code: "INVALID_REQUEST", message: "Invalid filters.", details: [] },
          { status: 400 },
        ),
      ),
    );
    const dataSource = createBffCollectionDataSource();

    await expect(dataSource.getGame(404)).resolves.toBeUndefined();
    await expect(dataSource.getCollection()).rejects.toMatchObject({
      name: "BffRequestError",
      message: "Invalid filters.",
      status: 400,
    } satisfies Partial<BffRequestError>);
  });
});

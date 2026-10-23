import {
  createFixtureCollectionDataSource,
  fixtureCollection,
} from "./collectionDataSource";
import type { Game, GamePage, GameWrite } from "./types";

const newGame: GameWrite = {
  title: "Moonlit Harbor",
  originalReleaseYear: 2022,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: null,
  maxLocalMultiplayerPlayers: null,
  coverImageUrl: null,
  personalComments: null,
};

const queryGames: Game[] = [
  {
    id: 3,
    title: "Zelda",
    originalReleaseYear: 2020,
    consoles: [{ name: "Nintendo Switch" }, { name: "Sony PlayStation 5" }],
    esrbRating: "E",
    maxLocalMultiplayerPlayers: 2,
    coverImageUrl: null,
    personalComments: "Local co-op adventure",
  },
  {
    id: 1,
    title: "Alpha",
    originalReleaseYear: 2020,
    consoles: [{ name: "Microsoft Xbox Series X/S" }],
    esrbRating: "T",
    maxLocalMultiplayerPlayers: 4,
    coverImageUrl: null,
    personalComments: null,
  },
  {
    id: 2,
    title: "alpha",
    originalReleaseYear: 2018,
    consoles: [{ name: "Nintendo Switch" }],
    esrbRating: "E",
    maxLocalMultiplayerPlayers: null,
    coverImageUrl: null,
    personalComments: null,
  },
  {
    id: 4,
    title: "No comment",
    originalReleaseYear: 2022,
    consoles: [{ name: "Microsoft Xbox Series X/S" }],
    esrbRating: "E10+",
    maxLocalMultiplayerPlayers: 3,
    coverImageUrl: null,
    personalComments: null,
  },
];

function pageFromGames(games: Game[]): GamePage {
  return {
    items: games,
    page: 0,
    size: 20,
    totalItems: games.length,
    totalPages: Math.ceil(games.length / 20),
  };
}

describe("fixture collection data source", () => {
  it("returns defensive copies and provides supported consoles", async () => {
    const source = createFixtureCollectionDataSource();
    const collection = await source.getCollection();
    collection.items[0].title = "Changed outside the source";
    const consoles = await source.getConsoles();
    consoles.pop();

    expect((await source.getGame(fixtureCollection.items[0].id))?.title).toBe(
      fixtureCollection.items[0].title,
    );
    expect(await source.getConsoles()).toHaveLength(3);
  });

  it("creates and updates games in memory with stable IDs and page metadata", async () => {
    const source = createFixtureCollectionDataSource();
    const created = await source.createGame(newGame);

    expect(created.id).toBe(5);
    expect(await source.getGame(created.id)).toMatchObject(newGame);
    expect(await source.getCollection()).toMatchObject({
      totalItems: 5,
      totalPages: 1,
    });

    const updated = await source.updateGame(created.id, {
      ...newGame,
      title: "Moonlit Harbor: Director’s Cut",
    });
    expect(updated).toMatchObject({
      id: created.id,
      title: "Moonlit Harbor: Director’s Cut",
    });
    expect(
      (await source.getCollection()).items.find((game) => game.id === created.id)
        ?.title,
    ).toBe(
      "Moonlit Harbor: Director’s Cut",
    );
  });

  it("rejects updates for unknown game IDs", async () => {
    const source = createFixtureCollectionDataSource();

    await expect(source.updateGame(404, newGame)).rejects.toThrow(
      "Game 404 was not found.",
    );
  });

  it("deletes games and updates collection metadata", async () => {
    const source = createFixtureCollectionDataSource();
    const deletedId = fixtureCollection.items[0].id;

    await source.deleteGame(deletedId);

    await expect(source.getGame(deletedId)).resolves.toBeUndefined();
    await expect(source.getCollection()).resolves.toMatchObject({
      totalItems: fixtureCollection.totalItems - 1,
      totalPages: 1,
    });
    await expect(source.deleteGame(404)).rejects.toThrow(
      "Game 404 was not found.",
    );
  });

  it("searches titles and comments case-insensitively and applies filters", async () => {
    const source = createFixtureCollectionDataSource(pageFromGames(queryGames));

    await expect(
      source.getCollection({ keyword: "CO-OP" }),
    ).resolves.toMatchObject({
      items: [{ id: 3 }],
      totalItems: 1,
    });
    await expect(
      source.getCollection({
        consoles: ["Nintendo Switch", "Microsoft Xbox Series X/S"],
      }),
    ).resolves.toMatchObject({ totalItems: 4 });
    await expect(
      source.getCollection({
        consoles: ["Nintendo Switch"],
        rating: "E",
        minPlayers: 2,
      }),
    ).resolves.toMatchObject({
      items: [{ id: 3 }],
      totalItems: 1,
    });
    await expect(
      source.getCollection({ rating: "T" }),
    ).resolves.toMatchObject({
      items: [{ id: 1 }],
      totalItems: 1,
    });
  });

  it("uses inclusive player bounds and excludes games without player counts", async () => {
    const source = createFixtureCollectionDataSource(pageFromGames(queryGames));

    await expect(
      source.getCollection({ minPlayers: 2, maxPlayers: 3 }),
    ).resolves.toMatchObject({
      items: [{ id: 4 }, { id: 3 }],
      totalItems: 2,
    });
    await expect(
      source.getCollection({ minPlayers: 4 }),
    ).resolves.toMatchObject({
      items: [{ id: 1 }],
      totalItems: 1,
    });
    await expect(
      source.getCollection({ maxPlayers: 1 }),
    ).resolves.toMatchObject({ items: [], totalItems: 0, totalPages: 0 });
    await expect(
      source.getCollection({ minPlayers: 4, maxPlayers: 2 }),
    ).rejects.toThrow("minPlayers cannot exceed maxPlayers.");
  });

  it("sorts by title or release year and keeps ID ascending for ties", async () => {
    const source = createFixtureCollectionDataSource(pageFromGames(queryGames));

    await expect(
      source.getCollection({ sort: "title" }),
    ).resolves.toMatchObject({
      items: [{ id: 1 }, { id: 2 }, { id: 4 }, { id: 3 }],
    });
    await expect(
      source.getCollection({ sort: "originalReleaseYear", direction: "asc" }),
    ).resolves.toMatchObject({
      items: [{ id: 2 }, { id: 1 }, { id: 3 }, { id: 4 }],
    });
    await expect(
      source.getCollection({ sort: "originalReleaseYear", direction: "desc" }),
    ).resolves.toMatchObject({
      items: [{ id: 4 }, { id: 1 }, { id: 3 }, { id: 2 }],
    });
  });

  it("returns page metadata and empty items for pages beyond the last page", async () => {
    const games = Array.from({ length: 25 }, (_, index): Game => ({
      ...queryGames[0],
      id: index + 1,
      title: `Game ${String(index + 1).padStart(2, "0")}`,
    }));
    const source = createFixtureCollectionDataSource(pageFromGames(games));

    await expect(source.getCollection({ page: 1 })).resolves.toMatchObject({
      items: [{ id: 21 }, { id: 22 }, { id: 23 }, { id: 24 }, { id: 25 }],
      page: 1,
      size: 20,
      totalItems: 25,
      totalPages: 2,
    });
    await expect(source.getCollection({ page: 2 })).resolves.toMatchObject({
      items: [],
      page: 2,
      size: 20,
      totalItems: 25,
      totalPages: 2,
    });
  });
});

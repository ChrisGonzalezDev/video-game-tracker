import {
  createFixtureCollectionDataSource,
  fixtureCollection,
} from "./collectionDataSource";
import type { GameWrite } from "./types";

const newGame: GameWrite = {
  title: "Moonlit Harbor",
  originalReleaseYear: 2022,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: null,
  maxLocalMultiplayerPlayers: null,
  coverImageUrl: null,
  personalComments: null,
};

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
    expect((await source.getCollection()).items.at(-1)?.title).toBe(
      "Moonlit Harbor: Director’s Cut",
    );
  });

  it("rejects updates for unknown game IDs", async () => {
    const source = createFixtureCollectionDataSource();

    await expect(source.updateGame(404, newGame)).rejects.toThrow(
      "Game 404 was not found.",
    );
  });
});

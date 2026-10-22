import type { Console, Game, GamePage, GameWrite } from "./types";

export interface CollectionDataSource {
  getCollection(): Promise<GamePage>;
  getGame(id: number): Promise<Game | undefined>;
  getConsoles(): Promise<Console[]>;
  createGame(game: GameWrite): Promise<Game>;
  updateGame(id: number, game: GameWrite): Promise<Game>;
}

export const fixtureCollection: GamePage = {
  items: [
    {
      id: 1,
      title: "Starfall Tactics",
      originalReleaseYear: 2023,
      consoles: [{ name: "Nintendo Switch" }, { name: "Sony PlayStation 5" }],
      esrbRating: "T",
      maxLocalMultiplayerPlayers: 2,
      coverImageUrl: null,
      personalComments: "A favorite for weekend co-op.",
    },
    {
      id: 2,
      title: "Mosslight",
      originalReleaseYear: 2021,
      consoles: [{ name: "Sony PlayStation 5" }],
      esrbRating: "E10+",
      maxLocalMultiplayerPlayers: null,
      coverImageUrl: null,
      personalComments: null,
    },
    {
      id: 3,
      title: "Neon Drift Circuit",
      originalReleaseYear: 2024,
      consoles: [{ name: "Microsoft Xbox Series X/S" }],
      esrbRating: "E",
      maxLocalMultiplayerPlayers: 4,
      coverImageUrl: null,
      personalComments: null,
    },
    {
      id: 4,
      title: "Clockwork Isles",
      originalReleaseYear: 2019,
      consoles: [{ name: "Nintendo Switch" }],
      esrbRating: null,
      maxLocalMultiplayerPlayers: null,
      coverImageUrl: null,
      personalComments: null,
    },
  ],
  page: 0,
  size: 20,
  totalItems: 4,
  totalPages: 1,
};

export const fixtureConsoles: Console[] = [
  { name: "Microsoft Xbox Series X/S" },
  { name: "Nintendo Switch" },
  { name: "Sony PlayStation 5" },
];

function copyGame(game: Game): Game {
  return {
    ...game,
    consoles: game.consoles.map((console) => ({ ...console })),
  };
}

function copyCollection(collection: GamePage): GamePage {
  return {
    ...collection,
    items: collection.items.map(copyGame),
  };
}

export function createFixtureCollectionDataSource(
  initialCollection: GamePage = fixtureCollection,
  consoles: Console[] = fixtureConsoles,
): CollectionDataSource {
  let collection = copyCollection(initialCollection);
  let nextId = collection.items.reduce((maximum, game) => Math.max(maximum, game.id), 0) + 1;

  return {
    getCollection: async () => copyCollection(collection),
    getGame: async (id) => {
      const game = collection.items.find((item) => item.id === id);
      return game ? copyGame(game) : undefined;
    },
    getConsoles: async () => consoles.map((console) => ({ ...console })),
    createGame: async (game) => {
      const created = copyGame({ ...game, id: nextId++ });
      collection = {
        ...collection,
        items: [...collection.items, created],
        totalItems: collection.totalItems + 1,
        totalPages: Math.ceil((collection.totalItems + 1) / collection.size),
      };
      return copyGame(created);
    },
    updateGame: async (id, game) => {
      const index = collection.items.findIndex((item) => item.id === id);
      if (index === -1) {
        throw new Error(`Game ${id} was not found.`);
      }

      const updated = copyGame({ ...game, id });
      const items = [...collection.items];
      items[index] = updated;
      collection = { ...collection, items };
      return copyGame(updated);
    },
  };
}

export const fixtureCollectionDataSource = createFixtureCollectionDataSource();

import type { Console, Game, GamePage, GameWrite } from "./types";

export type CollectionSortField = "title" | "originalReleaseYear";
export type CollectionSortDirection = "asc" | "desc";

export interface CollectionQuery {
  keyword?: string;
  consoles?: string[];
  rating?: NonNullable<Game["esrbRating"]>;
  minPlayers?: number;
  maxPlayers?: number;
  sort?: CollectionSortField;
  direction?: CollectionSortDirection;
  page?: number;
  size?: number;
}

export interface CollectionDataSource {
  getCollection(query?: CollectionQuery): Promise<GamePage>;
  getGame(id: number): Promise<Game | undefined>;
  getConsoles(): Promise<Console[]>;
  createGame(game: GameWrite): Promise<Game>;
  updateGame(id: number, game: GameWrite): Promise<Game>;
  deleteGame(id: number): Promise<void>;
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
    getCollection: async (query = {}) => {
      for (const [field, value] of [
        ["minPlayers", query.minPlayers],
        ["maxPlayers", query.maxPlayers],
      ] as const) {
        if (value != null && (!Number.isInteger(value) || value < 1)) {
          throw new RangeError(`${field} must be a positive whole number.`);
        }
      }
      if (
        query.minPlayers != null &&
        query.maxPlayers != null &&
        query.minPlayers > query.maxPlayers
      ) {
        throw new RangeError("minPlayers cannot exceed maxPlayers.");
      }
      if (
        query.page != null &&
        (!Number.isInteger(query.page) || query.page < 0)
      ) {
        throw new RangeError("page must be a non-negative whole number.");
      }
      if (
        query.size != null &&
        (!Number.isInteger(query.size) || query.size < 1 || query.size > 100)
      ) {
        throw new RangeError("size must be a whole number between 1 and 100.");
      }

      const keyword = query.keyword?.trim().toLowerCase();
      const selectedConsoles = new Set(query.consoles ?? []);
      const filtered = collection.items.filter((game) => {
        if (
          keyword &&
          !game.title.toLowerCase().includes(keyword) &&
          !(game.personalComments ?? "").toLowerCase().includes(keyword)
        ) {
          return false;
        }

        if (
          selectedConsoles.size > 0 &&
          !game.consoles.some((console) => selectedConsoles.has(console.name))
        ) {
          return false;
        }

        if (query.rating && game.esrbRating !== query.rating) {
          return false;
        }

        if (query.minPlayers != null || query.maxPlayers != null) {
          const players = game.maxLocalMultiplayerPlayers;
          if (
            players == null ||
            (query.minPlayers != null && players < query.minPlayers) ||
            (query.maxPlayers != null && players > query.maxPlayers)
          ) {
            return false;
          }
        }

        return true;
      });

      const sort = query.sort ?? "title";
      const direction = query.direction ?? "asc";
      const directionMultiplier = direction === "asc" ? 1 : -1;
      const sorted = filtered.sort((left, right) => {
        const comparison =
          sort === "title"
            ? left.title.toLowerCase().localeCompare(right.title.toLowerCase())
            : left.originalReleaseYear - right.originalReleaseYear;
        return comparison === 0
          ? left.id - right.id
          : comparison * directionMultiplier;
      });
      const size = query.size ?? 20;
      const page = query.page ?? 0;
      const totalItems = sorted.length;
      const totalPages = Math.ceil(totalItems / size);

      return {
        items: sorted.slice(page * size, (page + 1) * size).map(copyGame),
        page,
        size,
        totalItems,
        totalPages,
      };
    },
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
    deleteGame: async (id) => {
      const items = collection.items.filter((item) => item.id !== id);
      if (items.length === collection.items.length) {
        throw new Error(`Game ${id} was not found.`);
      }

      const totalItems = Math.max(0, collection.totalItems - 1);
      collection = {
        ...collection,
        items,
        totalItems,
        totalPages: Math.ceil(totalItems / collection.size),
      };
    },
  };
}

export const fixtureCollectionDataSource = createFixtureCollectionDataSource();

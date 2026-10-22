import type { GamePage } from "./types";

export interface CollectionDataSource {
  getCollection(): Promise<GamePage>;
}

export const fixtureCollection: GamePage = {
  items: [
    {
      id: 1,
      title: "Starfall Tactics",
      originalReleaseYear: 2023,
      consoles: [{ name: "Nintendo Switch" }, { name: "PC" }],
      esrbRating: "T",
      maxLocalMultiplayerPlayers: 2,
      coverImageUrl: null,
      personalComments: "A favorite for weekend co-op.",
    },
    {
      id: 2,
      title: "Mosslight",
      originalReleaseYear: 2021,
      consoles: [{ name: "PlayStation 5" }],
      esrbRating: "E10+",
      maxLocalMultiplayerPlayers: null,
      coverImageUrl: null,
      personalComments: null,
    },
    {
      id: 3,
      title: "Neon Drift Circuit",
      originalReleaseYear: 2024,
      consoles: [{ name: "PC" }],
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

export const fixtureCollectionDataSource: CollectionDataSource = {
  getCollection: async () => fixtureCollection,
};

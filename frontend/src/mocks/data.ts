import {
  createFixtureCollectionDataSource,
  fixtureCollection,
  fixtureConsoles,
} from "../features/collection/collectionDataSource";
import type { EsrbRating, GamePage } from "../features/collection/types";

const sampleRatings: EsrbRating[] = ["E", "E10+", "T", "M"];
const sampleGames = Array.from({ length: 21 }, (_, index) => ({
  id: index + 5,
  title: `Sample Game ${String(index + 1).padStart(2, "0")}`,
  originalReleaseYear: 2000 + index,
  consoles: [fixtureConsoles[index % fixtureConsoles.length]],
  esrbRating: sampleRatings[index % sampleRatings.length],
  maxLocalMultiplayerPlayers: (index % 4) + 1,
  coverImageUrl: null,
  personalComments: `Mock collection sample ${index + 1}.`,
}));

const initialCollection: GamePage = {
  ...fixtureCollection,
  items: [...fixtureCollection.items, ...sampleGames],
  totalItems: fixtureCollection.items.length + sampleGames.length,
  totalPages: Math.ceil(
    (fixtureCollection.items.length + sampleGames.length) / fixtureCollection.size,
  ),
};

export function createMockDataSource() {
  return createFixtureCollectionDataSource(initialCollection, fixtureConsoles);
}

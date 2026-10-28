import type {
  BackendClient,
  BackendResponse,
} from "./backend-client.js";

interface Game {
  id: number;
  title: string;
  originalReleaseYear: number;
  consoles: Array<{ name: string }>;
  esrbRating: string | null;
  maxLocalMultiplayerPlayers: number | null;
  coverImageUrl: string | null;
  personalComments: string | null;
}

interface GamePage {
  items: Game[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

interface Console {
  name: string;
}

const games: Game[] = [
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
];

const collection: GamePage = {
  items: games,
  page: 0,
  size: 20,
  totalItems: games.length,
  totalPages: 1,
};

const consoles: Console[] = [
  { name: "Microsoft Xbox Series X/S" },
  { name: "Nintendo Switch" },
  { name: "Sony PlayStation 5" },
];

const createdGame: Game = {
  id: 5,
  title: "Sample New Game",
  originalReleaseYear: 2024,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: "E",
  maxLocalMultiplayerPlayers: 1,
  coverImageUrl: null,
  personalComments: "A fixed mock create response.",
};

function jsonResponse(
  status: number,
  body: unknown,
  location: string | null = null,
): BackendResponse {
  return {
    status,
    contentType: "application/json",
    location,
    body: JSON.stringify(body),
  };
}

function gameNotFound(): BackendResponse {
  return jsonResponse(404, {
    code: "GAME_NOT_FOUND",
    message: "Game with the specified identifier was not found.",
    details: [],
  });
}

export function createMockBackendClient(): BackendClient {
  return {
    getGames: async () => jsonResponse(200, collection),
    createGame: async () =>
      jsonResponse(201, createdGame, "/api/v1/games/5"),
    getGame: async (id) => {
      const game = games.find((item) => item.id === id);
      return game ? jsonResponse(200, game) : gameNotFound();
    },
    replaceGame: async (id) => {
      const game = games.find((item) => item.id === id);
      return game ? jsonResponse(200, game) : gameNotFound();
    },
    deleteGame: async (id) => {
      const game = games.find((item) => item.id === id);
      return game
        ? { status: 204, contentType: null, location: null, body: "" }
        : gameNotFound();
    },
    getConsoles: async () => jsonResponse(200, consoles),
  };
}

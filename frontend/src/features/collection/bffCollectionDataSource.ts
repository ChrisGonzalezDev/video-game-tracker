import type { Console, Game, GamePage } from "./types";
import type {
  CollectionDataSource,
  CollectionQuery,
} from "./collectionDataSource";

export class BffRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BffRequestError";
  }
}

function collectionUrl(query: CollectionQuery = {}): URL {
  const url = new URL("/api/v1/games", window.location.origin);
  if (query.keyword?.trim()) {
    url.searchParams.set("keyword", query.keyword.trim());
  }
  for (const consoleName of query.consoles ?? []) {
    url.searchParams.append("console", consoleName);
  }
  if (query.rating) {
    url.searchParams.set("rating", query.rating);
  }
  if (query.minPlayers != null) {
    url.searchParams.set("minPlayers", String(query.minPlayers));
  }
  if (query.maxPlayers != null) {
    url.searchParams.set("maxPlayers", String(query.maxPlayers));
  }
  if (query.page != null) {
    url.searchParams.set("page", String(query.page));
  }
  if (query.sort) {
    url.searchParams.set("sort", query.sort);
  }
  if (query.direction) {
    url.searchParams.set("direction", query.direction);
  }
  return url;
}

async function throwRequestError(response: Response): Promise<never> {
  let message = `Request failed with status ${response.status}.`;
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    const body: unknown = await response.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof body.message === "string" &&
      body.message.trim()
    ) {
      message = body.message;
    }
  }
  throw new BffRequestError(message, response.status);
}

async function request<T>(path: string | URL, init?: RequestInit): Promise<T> {
  const url = typeof path === "string" ? new URL(path, window.location.origin) : path;
  const response = await fetch(url, init);
  if (!response.ok) {
    await throwRequestError(response);
  }
  if (response.status === 204) {
    throw new Error("The BFF returned an empty response where JSON was expected.");
  }
  return response.json();
}

async function requestWithoutResponse(path: string, init: RequestInit): Promise<void> {
  const response = await fetch(new URL(path, window.location.origin), init);
  if (!response.ok) {
    await throwRequestError(response);
  }
}

export function createBffCollectionDataSource(): CollectionDataSource {
  return {
    getCollection: (query) => request<GamePage>(collectionUrl(query)),
    getGame: async (id) => {
      try {
        return await request<Game>(`/api/v1/games/${id}`);
      } catch (error) {
        if (error instanceof BffRequestError && error.status === 404) {
          return undefined;
        }
        throw error;
      }
    },
    getConsoles: () => request<Console[]>("/api/v1/consoles"),
    createGame: (game) =>
      request<Game>("/api/v1/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      }),
    updateGame: (id, game) =>
      request<Game>(`/api/v1/games/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(game),
      }),
    deleteGame: async (id) => {
      await requestWithoutResponse(`/api/v1/games/${id}`, { method: "DELETE" });
    },
  };
}

export const bffCollectionDataSource = createBffCollectionDataSource();

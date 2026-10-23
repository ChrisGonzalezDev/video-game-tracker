export type JsonObject = Record<string, unknown>;

export interface BackendResponse {
  status: number;
  contentType: string | null;
  location: string | null;
  body: string;
}

export interface BackendClient {
  getGames(query: URLSearchParams): Promise<BackendResponse>;
  createGame(body: JsonObject): Promise<BackendResponse>;
  getGame(id: number): Promise<BackendResponse>;
  replaceGame(id: number, body: JsonObject): Promise<BackendResponse>;
  deleteGame(id: number): Promise<BackendResponse>;
  getConsoles(): Promise<BackendResponse>;
}

export class BackendTransportError extends Error {
  constructor(cause: unknown) {
    super("The backend request failed.", { cause });
    this.name = "BackendTransportError";
  }
}

const DEFAULT_BACKEND_API_URL = "http://localhost:8080/api/v1";

export function createBackendClient(
  baseUrl = process.env.BACKEND_API_URL ?? DEFAULT_BACKEND_API_URL,
  request: typeof fetch = fetch,
): BackendClient {
  const normalizedBaseUrl = `${baseUrl.replace(/\/+$/, "")}/`;

  async function send(
    method: string,
    path: string,
    body?: JsonObject,
  ): Promise<BackendResponse> {
    const url = new URL(path, normalizedBaseUrl);
    const headers: HeadersInit = {};
    const init: RequestInit = { method, headers };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(body);
    }

    let response: Response;
    let responseBody: string;
    try {
      response = await request(url, init);
      responseBody = response.status === 204 ? "" : await response.text();
    } catch (error) {
      throw new BackendTransportError(error);
    }

    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      location: response.headers.get("location"),
      body: responseBody,
    };
  }

  return {
    getGames: (query) => {
      const urlQuery = query.toString();
      return send("GET", `games${urlQuery ? `?${urlQuery}` : ""}`);
    },
    createGame: (body) => send("POST", "games", body),
    getGame: (id) => send("GET", `games/${id}`),
    replaceGame: (id, body) => send("PUT", `games/${id}`, body),
    deleteGame: (id) => send("DELETE", `games/${id}`),
    getConsoles: () => send("GET", "consoles"),
  };
}

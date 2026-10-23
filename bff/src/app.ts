import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import {
  BackendTransportError,
  createBackendClient,
  type BackendClient,
  type BackendResponse,
  type JsonObject,
} from "./backend-client.js";
import {
  createBadGatewayResponse,
  normalizeBackendResponse,
  type ApiError,
} from "./backend-response.js";

const ratings = new Set(["EC", "E", "E10+", "T", "M", "AO", "RP"]);
const queryParameters = new Set([
  "keyword",
  "console",
  "rating",
  "minPlayers",
  "maxPlayers",
  "page",
  "size",
  "sort",
  "direction",
]);

function invalidRequest(response: Response): void {
  sendApiError(response, 400, {
    code: "INVALID_REQUEST",
    message: "Request contains invalid values.",
    details: [],
  });
}

function sendApiError(
  response: Response,
  status: number,
  error: ApiError,
): void {
  response.status(status).json(error);
}

function parseSearchQuery(request: Request): URLSearchParams | undefined {
  const query = new URL(request.originalUrl, "http://localhost").searchParams;
  const entries = [...query.entries()];

  if (entries.some(([key]) => !queryParameters.has(key))) {
    return undefined;
  }

  const repeatedAllowed = new Set(["console"]);
  const seen = new Set<string>();
  for (const [key] of entries) {
    if (seen.has(key) && !repeatedAllowed.has(key)) {
      return undefined;
    }
    seen.add(key);
  }

  const consoles = query.getAll("console");
  if (consoles.some((consoleName) => consoleName.trim().length === 0)) {
    return undefined;
  }

  const rating = query.get("rating");
  if (rating !== null && !ratings.has(rating)) {
    return undefined;
  }

  const minimumPlayers = parsePositiveInteger(query.get("minPlayers"));
  const maximumPlayers = parsePositiveInteger(query.get("maxPlayers"));
  const page = parseNonNegativeInteger(query.get("page"));
  const size = parsePositiveInteger(query.get("size"));

  if (
    !isOptionalIntegerValid(query, "minPlayers", minimumPlayers) ||
    !isOptionalIntegerValid(query, "maxPlayers", maximumPlayers) ||
    !isOptionalIntegerValid(query, "page", page) ||
    !isOptionalIntegerValid(query, "size", size) ||
    (minimumPlayers !== undefined &&
      maximumPlayers !== undefined &&
      minimumPlayers > maximumPlayers) ||
    (size !== undefined && size > 100)
  ) {
    return undefined;
  }

  const sort = query.get("sort");
  if (sort !== null && sort !== "title" && sort !== "originalReleaseYear") {
    return undefined;
  }

  const direction = query.get("direction");
  if (direction !== null && direction !== "asc" && direction !== "desc") {
    return undefined;
  }

  return query;
}

function parsePositiveInteger(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  if (!/^[1-9]\d*$/.test(value)) {
    return Number.NaN;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
}

function parseNonNegativeInteger(value: string | null): number | undefined {
  if (value === null) {
    return undefined;
  }
  if (!/^(0|[1-9]\d*)$/.test(value)) {
    return Number.NaN;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : Number.NaN;
}

function isOptionalIntegerValid(
  query: URLSearchParams,
  key: string,
  value: number | undefined,
): boolean {
  return !query.has(key) || (value !== undefined && Number.isSafeInteger(value));
}

function getGameId(request: Request): number | undefined {
  const { id } = request.params;
  if (typeof id !== "string" || !/^[1-9]\d*$/.test(id)) {
    return undefined;
  }
  const parsed = Number(id);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function getJsonObjectBody(request: Request): JsonObject | undefined {
  const contentType = request.get("content-type");
  if (!contentType || !/^application\/json(?:\s*;|$)/i.test(contentType)) {
    return undefined;
  }
  if (
    typeof request.body !== "object" ||
    request.body === null ||
    Array.isArray(request.body)
  ) {
    return undefined;
  }
  return request.body as JsonObject;
}

function sendBackendResponse(
  response: Response,
  backendResponse: BackendResponse,
): void {
  response.status(backendResponse.status);
  if (backendResponse.contentType) {
    response.set("Content-Type", backendResponse.contentType);
  }
  if (backendResponse.location) {
    response.set("Location", backendResponse.location);
  }
  if (backendResponse.status === 204 || backendResponse.body.length === 0) {
    response.end();
    return;
  }
  response.send(backendResponse.body);
}

async function requestBackendResponse(
  operation: () => Promise<BackendResponse>,
): Promise<BackendResponse> {
  try {
    return normalizeBackendResponse(await operation());
  } catch (error) {
    if (!(error instanceof BackendTransportError)) {
      console.error("Unexpected BFF backend client failure", error);
      throw new BackendTransportError(error);
    }
    throw error;
  }
}

export function createApp(backendClient: BackendClient = createBackendClient()) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_request, response) => {
    response.json({ status: "ok" });
  });

  app.get("/api/v1/games", async (request, response) => {
    const query = parseSearchQuery(request);
    if (!query) {
      invalidRequest(response);
      return;
    }
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.getGames(query)),
    );
  });

  app.post("/api/v1/games", async (request, response) => {
    const body = getJsonObjectBody(request);
    if (!body) {
      invalidRequest(response);
      return;
    }
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.createGame(body)),
    );
  });

  app.get("/api/v1/games/:id", async (request, response) => {
    const id = getGameId(request);
    if (id === undefined) {
      invalidRequest(response);
      return;
    }
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.getGame(id)),
    );
  });

  app.put("/api/v1/games/:id", async (request, response) => {
    const id = getGameId(request);
    const body = getJsonObjectBody(request);
    if (id === undefined || !body) {
      invalidRequest(response);
      return;
    }
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.replaceGame(id, body)),
    );
  });

  app.delete("/api/v1/games/:id", async (request, response) => {
    const id = getGameId(request);
    if (id === undefined) {
      invalidRequest(response);
      return;
    }
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.deleteGame(id)),
    );
  });

  app.get("/api/v1/consoles", async (_request, response) => {
    sendBackendResponse(
      response,
      await requestBackendResponse(() => backendClient.getConsoles()),
    );
  });

  const handleErrors: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof BackendTransportError) {
      sendBackendResponse(response, createBadGatewayResponse());
      return;
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "status" in error &&
      error.status === 400
    ) {
      invalidRequest(response);
      return;
    }

    console.error("Unexpected BFF request failure", error);
    sendApiError(
      response,
      500,
      {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
        details: [],
      },
    );
  };
  app.use(handleErrors);

  return app;
}

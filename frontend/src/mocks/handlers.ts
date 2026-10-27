import { http, HttpResponse } from "msw";
import type { CollectionQuery } from "../features/collection/collectionDataSource";
import type { Console, EsrbRating, GameWrite } from "../features/collection/types";
import { createMockDataSource } from "./data";

const ratings: EsrbRating[] = ["EC", "E", "E10+", "T", "M", "AO", "RP"];
const allowedGameFields = new Set([
  "title",
  "originalReleaseYear",
  "consoles",
  "esrbRating",
  "maxLocalMultiplayerPlayers",
  "coverImageUrl",
  "personalComments",
]);
const allowedConsoleNames = new Set([
  "Microsoft Xbox Series X/S",
  "Nintendo Switch",
  "Sony PlayStation 5",
]);

function isEsrbRating(value: string): value is EsrbRating {
  return ratings.includes(value as EsrbRating);
}

function isCollectionSortField(
  value: string,
): value is NonNullable<CollectionQuery["sort"]> {
  return value === "title" || value === "originalReleaseYear";
}

function isCollectionSortDirection(
  value: string,
): value is NonNullable<CollectionQuery["direction"]> {
  return value === "asc" || value === "desc";
}

interface ApiErrorDetail {
  field: string;
  message: string;
}

interface ApiErrorBody {
  code: "INVALID_REQUEST" | "GAME_NOT_FOUND";
  message: string;
  details: ApiErrorDetail[];
}

function invalidRequest(details: ApiErrorDetail[]) {
  return HttpResponse.json<ApiErrorBody>(
    {
      code: "INVALID_REQUEST",
      message: "Request contains invalid values.",
      details,
    },
    { status: 400 },
  );
}

function gameNotFound() {
  return HttpResponse.json<ApiErrorBody>(
    {
      code: "GAME_NOT_FOUND",
      message: "Game with the specified identifier was not found.",
      details: [],
    },
    { status: 404 },
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function positiveId(value: string): number | undefined {
  if (!/^[1-9]\d*$/.test(value)) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function parseIntegerParameter(
  params: URLSearchParams,
  field: string,
  defaultValue?: number,
  minimum?: number,
  maximum?: number,
): { value: number | undefined; error?: ApiErrorDetail } {
  const raw = params.get(field);
  if (raw === null) {
    return { value: defaultValue };
  }
  if (!/^[+-]?\d+$/.test(raw)) {
    return { value: undefined, error: { field, message: "must be an integer" } };
  }

  const value = Number(raw);
  if (
    !Number.isInteger(value) ||
    value < -2_147_483_648 ||
    value > 2_147_483_647
  ) {
    return { value: undefined, error: { field, message: "must be an integer" } };
  }
  if (minimum != null && value < minimum) {
    return {
      value: undefined,
      error: {
        field,
        message:
          field === "page"
            ? "must be greater than or equal to zero"
            : field === "size"
              ? "must be between 1 and 100"
              : "must be greater than or equal to one",
      },
    };
  }
  if (maximum != null && value > maximum) {
    return {
      value: undefined,
      error: { field, message: `must be between 1 and ${maximum}` },
    };
  }
  return { value };
}

function parseCollectionQuery(url: URL):
  | { query: CollectionQuery }
  | { error: ApiErrorDetail[] } {
  const params = url.searchParams;
  const errors: ApiErrorDetail[] = [];
  const page = parseIntegerParameter(params, "page", 0, 0);
  const size = parseIntegerParameter(params, "size", 20, 1, 100);
  const minPlayers = parseIntegerParameter(params, "minPlayers", undefined, 1);
  const maxPlayers = parseIntegerParameter(params, "maxPlayers", undefined, 1);
  errors.push(
    ...[page, size, minPlayers, maxPlayers].flatMap((parsed) =>
      parsed.error ? [parsed.error] : [],
    ),
  );

  const rating = params.get("rating");
  const parsedRating =
    rating === null ? undefined : isEsrbRating(rating) ? rating : undefined;
  if (rating !== null && !isEsrbRating(rating)) {
    errors.push({
      field: "rating",
      message: "must be a supported ESRB rating",
    });
  }

  const sort = params.get("sort");
  const parsedSort =
    sort === null
      ? "title"
      : isCollectionSortField(sort)
        ? sort
        : undefined;
  if (sort !== null && !isCollectionSortField(sort)) {
    errors.push({
      field: "sort",
      message: "must be title or originalReleaseYear",
    });
  }

  const direction = params.get("direction");
  const parsedDirection =
    direction === null
      ? "asc"
      : isCollectionSortDirection(direction)
        ? direction
        : undefined;
  if (direction !== null && !isCollectionSortDirection(direction)) {
    errors.push({ field: "direction", message: "must be asc or desc" });
  }

  const consoles = params.getAll("console");
  if (consoles.some((consoleName) => !consoleName.trim())) {
    errors.push({ field: "console", message: "must not be blank" });
  }

  if (
    minPlayers.value != null &&
    maxPlayers.value != null &&
    minPlayers.value > maxPlayers.value
  ) {
    errors.push({
      field: "minPlayers",
      message: "must not exceed maxPlayers",
    });
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  return {
    query: {
      keyword: params.get("keyword") ?? undefined,
      consoles,
      rating: parsedRating,
      minPlayers: minPlayers.value,
      maxPlayers: maxPlayers.value,
      page: page.value,
      size: size.value,
      sort: parsedSort,
      direction: parsedDirection,
    },
  };
}

function parseGameWrite(value: unknown):
  | { game: GameWrite }
  | { error: ApiErrorDetail[] } {
  if (!isRecord(value)) {
    return { error: [{ field: "body", message: "must be a JSON object" }] };
  }

  const errors: ApiErrorDetail[] = [];
  for (const field of Object.keys(value)) {
    if (!allowedGameFields.has(field)) {
      errors.push({
        field: "body",
        message: `contains an unsupported property: ${field}`,
      });
    }
  }

  const title = value.title;
  if (title == null) {
    errors.push({ field: "title", message: "is required" });
  } else if (typeof title !== "string") {
    errors.push({ field: "title", message: "must be a string" });
  } else if (!title.trim()) {
    errors.push({ field: "title", message: "must not be blank" });
  }

  const year = value.originalReleaseYear;
  if (year == null) {
    errors.push({ field: "originalReleaseYear", message: "is required" });
  } else if (typeof year !== "number" || !Number.isInteger(year)) {
    errors.push({ field: "originalReleaseYear", message: "must be an integer" });
  } else if (year < 1000 || year > 9999) {
    errors.push({
      field: "originalReleaseYear",
      message: "must be a four-digit year",
    });
  } else if (year > new Date().getFullYear()) {
    errors.push({
      field: "originalReleaseYear",
      message: "must not be in the future",
    });
  }

  const rawConsoles = value.consoles;
  const consoles: Console[] = [];
  if (!Array.isArray(rawConsoles) || rawConsoles.length === 0) {
    errors.push({
      field: "consoles",
      message: "must contain at least one supported console",
    });
  } else {
    const seen = new Set<string>();
    for (const consoleValue of rawConsoles) {
      if (!isRecord(consoleValue)) {
        errors.push({ field: "consoles", message: "must contain console objects" });
        continue;
      }
      const name = consoleValue.name;
      if (typeof name !== "string" || !name.trim()) {
        errors.push({ field: "consoles", message: "console name must not be blank" });
      } else if (!allowedConsoleNames.has(name)) {
        errors.push({
          field: "consoles",
          message: `contains an unsupported console: ${name}`,
        });
      } else if (seen.has(name)) {
        errors.push({
          field: "consoles",
          message: "must not contain duplicate consoles",
        });
      } else {
        seen.add(name);
        consoles.push({ name });
      }
      if (Object.keys(consoleValue).some((field) => field !== "name")) {
        errors.push({
          field: "consoles",
          message: "contains an unsupported property",
        });
      }
    }
  }

  const rating = value.esrbRating;
  if (
    rating !== undefined &&
    rating !== null &&
    (typeof rating !== "string" || !isEsrbRating(rating))
  ) {
    errors.push({
      field: "esrbRating",
      message: "must be a supported ESRB rating",
    });
  }

  const maxPlayers = value.maxLocalMultiplayerPlayers;
  if (
    maxPlayers !== undefined &&
    maxPlayers !== null &&
    (typeof maxPlayers !== "number" ||
      !Number.isInteger(maxPlayers) ||
      maxPlayers <= 0)
  ) {
    errors.push({
      field: "maxLocalMultiplayerPlayers",
      message: "must be a positive integer or null",
    });
  }

  const coverImageUrl = value.coverImageUrl;
  if (coverImageUrl !== undefined && coverImageUrl !== null) {
    if (typeof coverImageUrl !== "string") {
      errors.push({
        field: "coverImageUrl",
        message: "must be a string or null",
      });
    } else {
      try {
        const url = new URL(coverImageUrl);
        if (
          !url.hostname ||
          (url.protocol !== "http:" && url.protocol !== "https:")
        ) {
          errors.push({
            field: "coverImageUrl",
            message: "must be an absolute HTTP or HTTPS URL",
          });
        }
      } catch (error) {
        if (!(error instanceof TypeError)) {
          throw error;
        }
        errors.push({
          field: "coverImageUrl",
          message: "must be an absolute HTTP or HTTPS URL",
        });
      }
    }
  }

  const comments = value.personalComments;
  if (
    comments !== undefined &&
    comments !== null &&
    typeof comments !== "string"
  ) {
    errors.push({
      field: "personalComments",
      message: "must be a string or null",
    });
  }

  if (errors.length > 0) {
    return { error: errors };
  }

  if (typeof title !== "string" || typeof year !== "number") {
    throw new Error("Validated game write data is missing required values.");
  }

  return {
    game: {
      title,
      originalReleaseYear: year,
      consoles,
      esrbRating:
        typeof rating === "string" && isEsrbRating(rating) ? rating : null,
      maxLocalMultiplayerPlayers:
        typeof maxPlayers === "number" ? maxPlayers : null,
      coverImageUrl:
        typeof coverImageUrl === "string" ? coverImageUrl : null,
      personalComments: typeof comments === "string" ? comments : null,
    },
  };
}

async function readGameWrite(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (!(error instanceof SyntaxError) && !(error instanceof TypeError)) {
      throw error;
    }
    return {
      error: [{ field: "body", message: "must contain valid game JSON" }],
    } satisfies { error: ApiErrorDetail[] };
  }
  return parseGameWrite(body);
}

export function createMockHandlers() {
  const dataSource = createMockDataSource();

  return [
    http.get("*/api/v1/consoles", async () =>
      HttpResponse.json(await dataSource.getConsoles()),
    ),
    http.get("*/api/v1/games", async ({ request }) => {
      const parsed = parseCollectionQuery(new URL(request.url));
      if ("error" in parsed) {
        return invalidRequest(parsed.error);
      }
      return HttpResponse.json(await dataSource.getCollection(parsed.query));
    }),
    http.get("*/api/v1/games/:id", async ({ params }) => {
      const id = positiveId(String(params.id));
      if (id === undefined) {
        return invalidRequest([
          { field: "id", message: "must be a positive integer" },
        ]);
      }
      const game = await dataSource.getGame(id);
      return game ? HttpResponse.json(game) : gameNotFound();
    }),
    http.post("*/api/v1/games", async ({ request }) => {
      const parsed = await readGameWrite(request);
      if ("error" in parsed) {
        return invalidRequest(parsed.error);
      }
      const game = await dataSource.createGame(parsed.game);
      return HttpResponse.json(game, {
        status: 201,
        headers: { Location: `/api/v1/games/${game.id}` },
      });
    }),
    http.put("*/api/v1/games/:id", async ({ params, request }) => {
      const id = positiveId(String(params.id));
      if (id === undefined) {
        return invalidRequest([
          { field: "id", message: "must be a positive integer" },
        ]);
      }
      const parsed = await readGameWrite(request);
      if ("error" in parsed) {
        return invalidRequest(parsed.error);
      }
      if (!(await dataSource.getGame(id))) {
        return gameNotFound();
      }
      return HttpResponse.json(await dataSource.updateGame(id, parsed.game));
    }),
    http.delete("*/api/v1/games/:id", async ({ params }) => {
      const id = positiveId(String(params.id));
      if (id === undefined) {
        return invalidRequest([
          { field: "id", message: "must be a positive integer" },
        ]);
      }
      if (!(await dataSource.getGame(id))) {
        return gameNotFound();
      }
      await dataSource.deleteGame(id);
      return new HttpResponse(null, { status: 204 });
    }),
  ];
}

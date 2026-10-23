import type { BackendResponse } from "./backend-client.js";

const apiErrorCodes = [
  "INVALID_REQUEST",
  "GAME_NOT_FOUND",
  "INTERNAL_SERVER_ERROR",
] as const;

export type ApiErrorCode = (typeof apiErrorCodes)[number];

export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details: ApiErrorDetail[];
}

const badGatewayError: ApiError = {
  code: "INTERNAL_SERVER_ERROR",
  message: "The backend request could not be completed.",
  details: [],
};

export function createBadGatewayResponse(): BackendResponse {
  return {
    status: 502,
    contentType: "application/json",
    location: null,
    body: JSON.stringify(badGatewayError),
  };
}

export function normalizeBackendResponse(
  backendResponse: BackendResponse,
): BackendResponse {
  if (backendResponse.status >= 200 && backendResponse.status < 300) {
    return backendResponse;
  }

  if (
    backendResponse.status >= 400 &&
    backendResponse.status < 500 &&
    isJsonContentType(backendResponse.contentType)
  ) {
    const apiError = parseApiError(backendResponse.body);
    if (apiError) {
      return {
        ...backendResponse,
        contentType: "application/json",
        body: JSON.stringify(apiError),
      };
    }
  }

  return createBadGatewayResponse();
}

function isJsonContentType(contentType: string | null): boolean {
  return contentType !== null && /^application\/json(?:\s*;|$)/i.test(contentType);
}

function parseApiError(body: string): ApiError | undefined {
  let value: unknown;
  try {
    value = JSON.parse(body);
  } catch {
    return undefined;
  }

  if (
    !hasExactKeys(value, ["code", "message", "details"]) ||
    typeof value.code !== "string" ||
    !isApiErrorCode(value.code) ||
    typeof value.message !== "string" ||
    !Array.isArray(value.details) ||
    !value.details.every(isApiErrorDetail)
  ) {
    return undefined;
  }

  return {
    code: value.code,
    message: value.message,
    details: value.details,
  };
}

function isApiErrorCode(value: string): value is ApiErrorCode {
  return apiErrorCodes.some((code) => code === value);
}

function isApiErrorDetail(value: unknown): value is ApiErrorDetail {
  return (
    hasExactKeys(value, ["field", "message"]) &&
    typeof value.field === "string" &&
    typeof value.message === "string"
  );
}

function hasExactKeys(
  value: unknown,
  keys: readonly string[],
): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const actualKeys = Object.keys(value);
  return (
    actualKeys.length === keys.length &&
    keys.every((key) => Object.hasOwn(value, key))
  );
}

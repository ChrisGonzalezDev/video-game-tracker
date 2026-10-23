import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import {
  BackendTransportError,
  type BackendClient,
  type BackendResponse,
  type JsonObject,
} from "./backend-client.js";

const okResponse: BackendResponse = {
  status: 200,
  contentType: "application/json",
  location: null,
  body: '{"ok":true}',
};

const apiError = (
  code: "INVALID_REQUEST" | "GAME_NOT_FOUND" | "INTERNAL_SERVER_ERROR",
  message: string,
  details: Array<{ field: string; message: string }> = [],
): BackendResponse => ({
  status: code === "GAME_NOT_FOUND" ? 404 : 400,
  contentType: "application/json",
  location: null,
  body: JSON.stringify({ code, message, details }),
});

function createMockClient(): jest.Mocked<BackendClient> {
  return {
    getGames: jest.fn<BackendClient["getGames"]>().mockResolvedValue(okResponse),
    createGame: jest.fn<BackendClient["createGame"]>().mockResolvedValue(okResponse),
    getGame: jest.fn<BackendClient["getGame"]>().mockResolvedValue(okResponse),
    replaceGame: jest
      .fn<BackendClient["replaceGame"]>()
      .mockResolvedValue(okResponse),
    deleteGame: jest.fn<BackendClient["deleteGame"]>().mockResolvedValue(okResponse),
    getConsoles: jest.fn<BackendClient["getConsoles"]>().mockResolvedValue(okResponse),
  };
}

describe("BFF routes", () => {
  let client: jest.Mocked<BackendClient>;
  let server: Server;
  let baseUrl: string;

  beforeEach(async () => {
    client = createMockClient();
    server = createApp(client).listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  });

  afterEach(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("preserves the standalone health response", async () => {
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: "ok" });
    expect(client.getGames).not.toHaveBeenCalled();
  });

  test("forwards all supported search query parameters, including repeated consoles", async () => {
    const response = await fetch(
      `${baseUrl}/api/v1/games?keyword=zelda&console=Switch&console=PS5&rating=E&page=1&size=10&sort=title&direction=desc`,
    );

    expect(response.status).toBe(200);
    expect(client.getGames).toHaveBeenCalledWith(
      new URLSearchParams([
        ["keyword", "zelda"],
        ["console", "Switch"],
        ["console", "PS5"],
        ["rating", "E"],
        ["page", "1"],
        ["size", "10"],
        ["sort", "title"],
        ["direction", "desc"],
      ]),
    );
  });

  test("forwards create body and retains downstream status, body, and Location", async () => {
    const body: JsonObject = {
      title: "Example",
      originalReleaseYear: 2020,
      consoles: [{ name: "Switch" }],
    };
    client.createGame.mockResolvedValue({
      status: 201,
      contentType: "application/json",
      location: "/api/v1/games/12",
      body: '{"id":12}',
    });

    const response = await fetch(`${baseUrl}/api/v1/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    expect(client.createGame).toHaveBeenCalledWith(body);
    expect(response.status).toBe(201);
    expect(response.headers.get("location")).toBe("/api/v1/games/12");
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await response.json()).toEqual({ id: 12 });
  });

  test("forwards game reads, replacements, and deletions by ID", async () => {
    await fetch(`${baseUrl}/api/v1/games/7`);
    const body = { title: "Updated" };
    await fetch(`${baseUrl}/api/v1/games/7`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    await fetch(`${baseUrl}/api/v1/games/7`, { method: "DELETE" });

    expect(client.getGame).toHaveBeenCalledWith(7);
    expect(client.replaceGame).toHaveBeenCalledWith(7, body);
    expect(client.deleteGame).toHaveBeenCalledWith(7);
  });

  test("forwards the console catalog request", async () => {
    await fetch(`${baseUrl}/api/v1/consoles`);

    expect(client.getConsoles).toHaveBeenCalledTimes(1);
  });

  test("preserves a bodyless 204 response", async () => {
    client.deleteGame.mockResolvedValue({
      status: 204,
      contentType: null,
      location: null,
      body: "",
    });

    const response = await fetch(`${baseUrl}/api/v1/games/7`, {
      method: "DELETE",
    });

    expect(response.status).toBe(204);
    expect(await response.text()).toBe("");
  });

  test.each([
    [
      "a valid bad-request error",
      apiError("INVALID_REQUEST", "Request contains invalid values.", [
        { field: "title", message: "must not be blank" },
      ]),
      400,
    ],
    [
      "a valid not-found error",
      apiError("GAME_NOT_FOUND", "Game was not found."),
      404,
    ],
  ])("preserves %s status and ApiError data", async (_description, backendResponse, status) => {
    client.getGame.mockResolvedValue(backendResponse);

    const response = await fetch(`${baseUrl}/api/v1/games/7`);

    expect(response.status).toBe(status);
    expect(response.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await response.json()).toEqual(JSON.parse(backendResponse.body));
  });

  test("surfaces backend transport failures as a 502 response", async () => {
    client.getGames.mockRejectedValue(
      new BackendTransportError(new TypeError("connection refused")),
    );

    const response = await fetch(`${baseUrl}/api/v1/games`);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "The backend request could not be completed.",
      details: [],
    });
  });

  test.each([
    [
      "malformed JSON",
      {
        status: 400,
        contentType: "application/json",
        location: null,
        body: "{",
      },
    ],
    [
      "an invalid ApiError shape",
      {
        status: 404,
        contentType: "application/json",
        location: null,
        body: '{"code":"GAME_NOT_FOUND"}',
      },
    ],
    [
      "a non-JSON error response",
      {
        status: 400,
        contentType: "text/plain",
        location: null,
        body: JSON.stringify({
          code: "INVALID_REQUEST",
          message: "Bad request",
          details: [],
        }),
      },
    ],
    [
      "a downstream server error",
      {
        status: 500,
        contentType: "application/json",
        location: null,
        body: JSON.stringify({
          code: "INTERNAL_SERVER_ERROR",
          message: "Private backend implementation details",
          details: [],
        }),
      },
    ],
    [
      "an unexpected redirect",
      {
        status: 302,
        contentType: "text/plain",
        location: "/private",
        body: "redirect",
      },
    ],
  ])("maps %s to a generic 502 ApiError", async (_description, backendResponse) => {
    client.getGame.mockResolvedValue(backendResponse);

    const response = await fetch(`${baseUrl}/api/v1/games/7`);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "The backend request could not be completed.",
      details: [],
    });
  });

  test("maps unexpected backend client failures without exposing their messages", async () => {
    const errorLog = jest.spyOn(console, "error").mockImplementation(() => {});
    client.getConsoles.mockRejectedValue(new Error("private backend detail"));

    try {
      const response = await fetch(`${baseUrl}/api/v1/consoles`);

      expect(response.status).toBe(502);
      expect(await response.json()).toEqual({
        code: "INTERNAL_SERVER_ERROR",
        message: "The backend request could not be completed.",
        details: [],
      });
      expect(errorLog).toHaveBeenCalledWith(
        "Unexpected BFF backend client failure",
        expect.any(Error),
      );
    } finally {
      errorLog.mockRestore();
    }
  });

  test.each([
    "/api/v1/games?page=-1",
    "/api/v1/games?size=101",
    "/api/v1/games?sort=unknown",
    "/api/v1/games?rating=invalid",
    "/api/v1/games?minPlayers=4&maxPlayers=2",
    "/api/v1/games?unexpected=value",
    "/api/v1/games?page=1&page=2",
  ])("rejects malformed requests without calling the backend: %s", async (path) => {
    const response = await fetch(`${baseUrl}${path}`);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      code: "INVALID_REQUEST",
      message: "Request contains invalid values.",
      details: [],
    });
    expect(client.getGames).not.toHaveBeenCalled();
  });

  test.each(["GET", "PUT", "DELETE"])(
    "rejects invalid game IDs for %s without calling the backend",
    async (method) => {
      const response = await fetch(`${baseUrl}/api/v1/games/not-an-id`, {
        method,
        ...(method === "PUT"
          ? {
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ title: "Example" }),
            }
          : {}),
      });

      expect(response.status).toBe(400);
      expect(client.getGame).not.toHaveBeenCalled();
      expect(client.replaceGame).not.toHaveBeenCalled();
      expect(client.deleteGame).not.toHaveBeenCalled();
    },
  );

  test("rejects malformed, missing, or non-object JSON bodies", async () => {
    const malformed = await fetch(`${baseUrl}/api/v1/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{",
    });
    const missing = await fetch(`${baseUrl}/api/v1/games`, { method: "POST" });
    const missingReplace = await fetch(`${baseUrl}/api/v1/games/7`, {
      method: "PUT",
    });
    const arrayBody = await fetch(`${baseUrl}/api/v1/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "[]",
    });

    expect([
      malformed.status,
      missing.status,
      missingReplace.status,
      arrayBody.status,
    ]).toEqual([
      400, 400, 400, 400,
    ]);
    expect(client.createGame).not.toHaveBeenCalled();
    expect(client.replaceGame).not.toHaveBeenCalled();
  });

  test.each([
    {
      name: "game search",
      path: "/api/v1/games",
      method: "GET" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.getGames.mockResolvedValue(response),
    },
    {
      name: "game creation",
      path: "/api/v1/games",
      method: "POST" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.createGame.mockResolvedValue(response),
    },
    {
      name: "game retrieval",
      path: "/api/v1/games/7",
      method: "GET" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.getGame.mockResolvedValue(response),
    },
    {
      name: "game replacement",
      path: "/api/v1/games/7",
      method: "PUT" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.replaceGame.mockResolvedValue(response),
    },
    {
      name: "game deletion",
      path: "/api/v1/games/7",
      method: "DELETE" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.deleteGame.mockResolvedValue(response),
    },
    {
      name: "console catalog",
      path: "/api/v1/consoles",
      method: "GET" as const,
      configure: (backendClient: jest.Mocked<BackendClient>, response: BackendResponse) =>
        backendClient.getConsoles.mockResolvedValue(response),
    },
  ])("maps downstream server failures consistently for $name", async (route) => {
    route.configure(client, {
      status: 503,
      contentType: "application/json",
      location: null,
      body: '{"message":"private backend detail"}',
    });

    const response = await fetch(`${baseUrl}${route.path}`, {
      method: route.method,
      ...(route.method === "POST" || route.method === "PUT"
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: "Example" }),
          }
        : {}),
    });

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      code: "INTERNAL_SERVER_ERROR",
      message: "The backend request could not be completed.",
      details: [],
    });
  });
});

import { afterEach, describe, expect, jest, test } from "@jest/globals";
import { createBackendClient } from "./backend-client.js";

describe("backend client", () => {
  const originalBackendUrl = process.env.BACKEND_API_URL;

  afterEach(() => {
    if (originalBackendUrl === undefined) {
      delete process.env.BACKEND_API_URL;
    } else {
      process.env.BACKEND_API_URL = originalBackendUrl;
    }
  });

  test("uses the default base URL and forwards search query parameters", async () => {
    delete process.env.BACKEND_API_URL;
    const request = jest
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('{"items":[]}', { status: 200 }));
    const client = createBackendClient(undefined, request);
    const query = new URLSearchParams([
      ["keyword", "zelda quest"],
      ["console", "Nintendo Switch"],
      ["console", "PlayStation 5"],
      ["page", "2"],
    ]);

    await client.getGames(query);

    expect(request).toHaveBeenCalledTimes(1);
    const [input, init] = request.mock.calls[0]!;
    expect(String(input)).toBe(
      "http://localhost:8080/api/v1/games?keyword=zelda+quest&console=Nintendo+Switch&console=PlayStation+5&page=2",
    );
    expect(init?.method).toBe("GET");
  });

  test("uses the environment base URL override", async () => {
    process.env.BACKEND_API_URL = "http://backend.internal/custom/api/";
    const request = jest
      .fn<typeof fetch>()
      .mockResolvedValue(new Response("[]", { status: 200 }));

    await createBackendClient(undefined, request).getConsoles();

    expect(String(request.mock.calls[0]![0])).toBe(
      "http://backend.internal/custom/api/consoles",
    );
  });

  test("forwards methods, paths, JSON bodies, response metadata, and empty 204 responses", async () => {
    const responses = [
      new Response('{"id":12}', {
        status: 201,
        headers: {
          "content-type": "application/json",
          location: "/api/v1/games/12",
        },
      }),
      new Response('{"id":12}', { status: 200 }),
      new Response('{"id":12}', { status: 200 }),
      new Response(null, { status: 204 }),
    ];
    const request = jest
      .fn<typeof fetch>()
      .mockImplementation(async () => responses.shift()!);
    const client = createBackendClient("http://backend.test/api/v1", request);
    const body = { title: "Example", originalReleaseYear: 2020, consoles: [] };

    const created = await client.createGame(body);
    await client.replaceGame(12, body);
    await client.getGame(12);
    const deleted = await client.deleteGame(12);

    expect(
      request.mock.calls.map(([input, init]) => [String(input), init?.method]),
    ).toEqual([
      ["http://backend.test/api/v1/games", "POST"],
      ["http://backend.test/api/v1/games/12", "PUT"],
      ["http://backend.test/api/v1/games/12", "GET"],
      ["http://backend.test/api/v1/games/12", "DELETE"],
    ]);
    expect(request.mock.calls[0]![1]?.headers).toEqual({
      "Content-Type": "application/json",
    });
    expect(request.mock.calls[0]![1]?.body).toBe(JSON.stringify(body));
    expect(created).toMatchObject({
      status: 201,
      contentType: "application/json",
      location: "/api/v1/games/12",
      body: '{"id":12}',
    });
    expect(deleted).toMatchObject({ status: 204, body: "" });
  });

  test("exposes network failures as transport errors", async () => {
    const request = jest
      .fn<typeof fetch>()
      .mockRejectedValue(new TypeError("connection refused"));

    await expect(
      createBackendClient("http://backend.test/api/v1", request).getGame(1),
    ).rejects.toThrow("The backend request failed.");
  });

  test("exposes response body read failures as transport errors", async () => {
    const response = new Response(
      new ReadableStream<Uint8Array>({
        start(controller) {
          controller.error(new Error("response body failed"));
        },
      }),
      { status: 200 },
    );
    const request = jest.fn<typeof fetch>().mockResolvedValue(response);

    await expect(
      createBackendClient("http://backend.test/api/v1", request).getGame(1),
    ).rejects.toThrow("The backend request failed.");
  });
});

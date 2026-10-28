import { afterEach, describe, expect, test } from "@jest/globals";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import { createMockBackendClient } from "./mock-backend-client.js";

describe("BFF routes with mock backend responses", () => {
  let server: Server;
  let baseUrl: string;

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }
  });

  async function startServer(): Promise<void> {
    server = createApp(createMockBackendClient()).listen(0);
    await new Promise<void>((resolve) => server.once("listening", resolve));
    const address = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
  }

  test("serves health, collection, game, mutation, and console routes", async () => {
    await startServer();

    const health = await fetch(`${baseUrl}/health`);
    const collection = await fetch(
      `${baseUrl}/api/v1/games?keyword=example&console=Nintendo+Switch&page=2`,
    );
    const game = await fetch(`${baseUrl}/api/v1/games/1`);
    const created = await fetch(`${baseUrl}/api/v1/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Ignored by the fixed mock",
        originalReleaseYear: 2025,
        consoles: [{ name: "Nintendo Switch" }],
      }),
    });
    const replaced = await fetch(`${baseUrl}/api/v1/games/1`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Ignored replacement",
        originalReleaseYear: 2025,
        consoles: [{ name: "Nintendo Switch" }],
      }),
    });
    const deleted = await fetch(`${baseUrl}/api/v1/games/1`, {
      method: "DELETE",
    });
    const consoles = await fetch(`${baseUrl}/api/v1/consoles`);

    expect(await health.json()).toEqual({ status: "ok" });
    expect(collection.status).toBe(200);
    expect(await collection.json()).toMatchObject({ page: 0, totalItems: 4 });
    expect(await game.json()).toMatchObject({ id: 1, title: "Starfall Tactics" });
    expect(created.status).toBe(201);
    expect(created.headers.get("location")).toBe("/api/v1/games/5");
    expect(await created.json()).toMatchObject({ id: 5 });
    expect(replaced.status).toBe(200);
    expect(await replaced.json()).toMatchObject({ id: 1 });
    expect(deleted.status).toBe(204);
    expect(await consoles.json()).toEqual([
      { name: "Microsoft Xbox Series X/S" },
      { name: "Nintendo Switch" },
      { name: "Sony PlayStation 5" },
    ]);

    const unchangedGame = await fetch(`${baseUrl}/api/v1/games/1`);
    expect(await unchangedGame.json()).toMatchObject({
      id: 1,
      title: "Starfall Tactics",
    });
  });

  test("keeps request validation and downstream error mapping active", async () => {
    await startServer();

    const invalidQuery = await fetch(`${baseUrl}/api/v1/games?page=-1`);
    const invalidBody = await fetch(`${baseUrl}/api/v1/games`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "[]",
    });
    const missingGame = await fetch(`${baseUrl}/api/v1/games/999`);

    expect(invalidQuery.status).toBe(400);
    expect(await invalidQuery.json()).toMatchObject({
      code: "INVALID_REQUEST",
    });
    expect(invalidBody.status).toBe(400);
    expect(await invalidBody.json()).toMatchObject({
      code: "INVALID_REQUEST",
    });
    expect(missingGame.status).toBe(404);
    expect(await missingGame.json()).toEqual({
      code: "GAME_NOT_FOUND",
      message: "Game with the specified identifier was not found.",
      details: [],
    });
  });
});

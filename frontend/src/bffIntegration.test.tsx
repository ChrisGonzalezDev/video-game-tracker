import { http, HttpResponse } from "msw";
import { jest } from "@jest/globals";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { server } from "./test/testServer";
import type { Console, Game, GamePage, GameWrite } from "./features/collection/types";

jest.setTimeout(60000);

const initialGame: Game = {
  id: 1,
  title: "Starfall Tactics",
  originalReleaseYear: 2023,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: "T",
  maxLocalMultiplayerPlayers: 2,
  coverImageUrl: null,
  personalComments: null,
};

const consoles: Console[] = [{ name: "Nintendo Switch" }];

function mockBff(initialGames: Game[] = [initialGame]) {
  const games = [...initialGames];
  const requests: Array<{ method: string; url: URL }> = [];
  server.use(
    http.get("http://localhost/api/v1/games", ({ request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      const page: GamePage = {
        items: [...games],
        page: 0,
        size: 20,
        totalItems: games.length,
        totalPages: Math.ceil(games.length / 20),
      };
      return HttpResponse.json(page);
    }),
    http.get("http://localhost/api/v1/games/:id", ({ params, request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      const game = games.find((item) => item.id === Number(params.id));
      return game
        ? HttpResponse.json(game)
        : HttpResponse.json(
            { code: "GAME_NOT_FOUND", message: "Game was not found.", details: [] },
            { status: 404 },
          );
    }),
    http.get("http://localhost/api/v1/consoles", ({ request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      return HttpResponse.json(consoles);
    }),
    http.post("http://localhost/api/v1/games", async ({ request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      const write = (await request.json()) as GameWrite;
      const game = { ...write, id: Math.max(0, ...games.map(({ id }) => id)) + 1 };
      games.push(game);
      return HttpResponse.json(game, { status: 201 });
    }),
    http.put("http://localhost/api/v1/games/:id", async ({ params, request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      const write = (await request.json()) as GameWrite;
      const index = games.findIndex((item) => item.id === Number(params.id));
      if (index < 0) {
        return HttpResponse.json(
          { code: "GAME_NOT_FOUND", message: "Game was not found.", details: [] },
          { status: 404 },
        );
      }
      games[index] = { ...write, id: Number(params.id) };
      return HttpResponse.json(games[index]);
    }),
    http.delete("http://localhost/api/v1/games/:id", ({ params, request }) => {
      requests.push({ method: request.method, url: new URL(request.url) });
      const index = games.findIndex((item) => item.id === Number(params.id));
      if (index < 0) {
        return HttpResponse.json(
          { code: "GAME_NOT_FOUND", message: "Game was not found.", details: [] },
          { status: 404 },
        );
      }
      games.splice(index, 1);
      return new HttpResponse(null, { status: 204 });
    }),
  );
  return { games, requests };
}

describe("frontend and BFF integration", () => {
  it("uses relative BFF routes for default collection and console reads", async () => {
    const { requests } = mockBff();
    render(<App />);

    expect(
      await screen.findByRole("heading", {
        name: "Starfall Tactics",
        level: 3,
      }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(
        requests.some(
          ({ method, url }) =>
            method === "GET" && url.pathname === "/api/v1/consoles",
        ),
      ).toBe(true);
    });
    expect(
      requests.some(
        ({ method, url }) =>
          method === "GET" &&
          url.pathname === "/api/v1/games" &&
          url.searchParams.get("page") === "0" &&
          url.searchParams.get("sort") === "title",
      ),
    ).toBe(true);
    expect(
      requests.every(({ url }) => url.origin === window.location.origin),
    ).toBe(true);
  });

  it("shows and recovers from a BFF collection read failure", async () => {
    const user = userEvent.setup();
    mockBff();
    let attempts = 0;
    server.use(
      http.get("http://localhost/api/v1/games", () => {
        attempts += 1;
        if (attempts === 1) {
          return HttpResponse.json(
            { code: "INTERNAL_SERVER_ERROR", message: "Unavailable.", details: [] },
            { status: 502 },
          );
        }
        return HttpResponse.json({
          items: [initialGame],
          page: 0,
          size: 20,
          totalItems: 1,
          totalPages: 1,
        } satisfies GamePage);
      }),
    );
    render(<App />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load your collection",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("heading", {
        name: "Starfall Tactics",
        level: 3,
      }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  it("creates through the BFF, refreshes the collection, and confirms deletion", async () => {
    const user = userEvent.setup();
    const { games, requests } = mockBff();
    render(<App />);

    await user.click(await screen.findByRole("button", { name: "Add game" }));
    await user.type(screen.getByRole("textbox", { name: "Title" }), "Moonlit Harbor");
    await user.type(
      screen.getByRole("textbox", { name: "Original release year" }),
      "2022",
    );
    await user.click(screen.getByRole("checkbox", { name: "Nintendo Switch" }));
    await user.click(screen.getByRole("button", { name: "Save game" }));

    expect(
      await screen.findByRole("heading", { name: "Moonlit Harbor", level: 1 }),
    ).toBeInTheDocument();
    expect(
      requests.some(
        ({ method, url }) =>
          method === "POST" && url.pathname === "/api/v1/games",
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Edit game" }));
    const titleInput = await screen.findByRole("textbox", { name: "Title" });
    await user.clear(titleInput);
    await user.type(titleInput, "Moonlit Harbor Redux");
    await user.click(screen.getByRole("button", { name: "Save game" }));
    expect(
      await screen.findByRole("heading", {
        name: "Moonlit Harbor Redux",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(
      requests.some(
        ({ method, url }) =>
          method === "PUT" && url.pathname === "/api/v1/games/2",
      ),
    ).toBe(true);

    await user.click(screen.getByRole("button", { name: "Back to collection" }));
    expect(
      await screen.findByRole("button", {
        name: "View details for Moonlit Harbor Redux",
      }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole("button", { name: "View details for Moonlit Harbor Redux" }),
    );
    expect(
      requests.some(
        ({ method, url }) =>
          method === "GET" && url.pathname === "/api/v1/games/2",
      ),
    ).toBe(true);
    await user.click(await screen.findByRole("button", { name: "Delete game" }));
    expect(await screen.findByRole("dialog")).toHaveTextContent(
      "Delete Moonlit Harbor Redux from your collection?",
    );

    await user.click(screen.getByRole("button", { name: "Cancel deletion" }));
    expect(requests.filter(({ method }) => method === "DELETE")).toHaveLength(0);
    expect(games).toHaveLength(2);

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await user.click(screen.getByRole("button", { name: "Delete game" }));
    await user.click(screen.getByRole("button", { name: "Confirm deletion" }));
    expect(
      await screen.findByRole("heading", { name: "Your game collection", level: 1 }),
    ).toBeInTheDocument();
    await waitFor(() => expect(games).toHaveLength(1));
    expect(requests.filter(({ method }) => method === "DELETE")).toHaveLength(1);
    expect(
      requests.some(
        ({ method, url }) =>
          method === "DELETE" && url.pathname === "/api/v1/games/2",
      ),
    ).toBe(true);
  });

  it("keeps the game and reports a failed deletion", async () => {
    const user = userEvent.setup();
    const { requests } = mockBff();
    server.use(
      http.delete("http://localhost/api/v1/games/:id", ({ request }) => {
        requests.push({ method: request.method, url: new URL(request.url) });
        return HttpResponse.json(
          { code: "INTERNAL_SERVER_ERROR", message: "Unavailable.", details: [] },
          { status: 500 },
        );
      }),
    );
    render(<App />);

    await user.click(
      await screen.findByRole("button", {
        name: "View details for Starfall Tactics",
      }),
    );
    await user.click(await screen.findByRole("button", { name: "Delete game" }));
    await user.click(screen.getByRole("button", { name: "Confirm deletion" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t delete this game",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(requests.filter(({ method }) => method === "DELETE")).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Cancel deletion" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole("heading", { name: "Starfall Tactics", level: 1 }),
    ).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { jest } from "@jest/globals";
import userEvent from "@testing-library/user-event";
import App from "./App";
import {
  createFixtureCollectionDataSource,
  fixtureCollection,
  type CollectionDataSource,
} from "./features/collection/collectionDataSource";
import type { Game, GamePage, GameWrite } from "./features/collection/types";

jest.setTimeout(20000);

const testGame: Game = {
  id: 12,
  title: "Starfall Tactics",
  originalReleaseYear: 2023,
  consoles: [{ name: "Nintendo Switch" }],
  esrbRating: "T",
  maxLocalMultiplayerPlayers: 2,
  coverImageUrl: null,
  personalComments: "A favorite for weekend co-op.",
};

const emptyCollection: GamePage = {
  items: [],
  page: 0,
  size: 20,
  totalItems: 0,
  totalPages: 0,
};

function createDataSource(
  overrides: Partial<CollectionDataSource> = {},
  initialCollection: GamePage = {
    ...fixtureCollection,
    items: [testGame],
    totalItems: 1,
    totalPages: 1,
  },
): CollectionDataSource {
  return {
    ...createFixtureCollectionDataSource(initialCollection),
    ...overrides,
  };
}

describe("collection view", () => {
  it("renders games returned by the injectable collection data source", async () => {
    render(<App collectionDataSource={createDataSource()} />);

    expect(
      await screen.findByRole("heading", { name: "Your game collection", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Starfall Tactics", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 game")).toBeInTheDocument();
    expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
  });

  it("shows a loading status while the collection request is pending", () => {
    const dataSource = createDataSource({
      getCollection: () => new Promise<GamePage>(() => undefined),
    });

    render(<App collectionDataSource={dataSource} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your collection",
    );
  });

  it("shows a distinct empty state when the collection has no games", async () => {
    render(<App collectionDataSource={createDataSource({}, emptyCollection)} />);

    expect(
      await screen.findByRole("heading", { name: "Your collection is empty" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Games you add will show up here.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add game" })).toBeInTheDocument();
  });

  it("shows a recoverable collection error and retries loading", async () => {
    const user = userEvent.setup();
    let calls = 0;
    const dataSource = createDataSource({
      getCollection: async () => {
        calls += 1;
        if (calls === 1) {
          throw new Error("offline");
        }
        return { ...fixtureCollection, items: [testGame], totalItems: 1 };
      },
    });

    render(<App collectionDataSource={dataSource} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load your collection",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(
      await screen.findByRole("heading", { name: "Starfall Tactics", level: 3 }),
    ).toBeInTheDocument();
    expect(calls).toBe(2);
  });

  it("searches by title and comments, shows no matches, and clears criteria", async () => {
    const user = userEvent.setup();
    render(<App />);

    const search = await screen.findByRole("searchbox", { name: "Search games" });
    fireEvent.change(search, { target: { value: "weekend co-op" } });

    expect(
      await screen.findByRole("button", {
        name: "View details for Starfall Tactics",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 game")).toBeInTheDocument();

    fireEvent.change(search, { target: { value: "no matching game" } });
    expect(
      await screen.findByRole("heading", {
        name: "No games match your search",
      }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Clear search and filters" }),
    );
    expect(
      await screen.findByRole("button", {
        name: "View details for Clockwork Isles",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "No games match your search" }))
      .not.toBeInTheDocument();
  });

  it("combines console, rating, and player filters", async () => {
    render(<App />);
    await screen.findByRole("button", { name: "Add game" });

    fireEvent.mouseDown(screen.getByRole("combobox", { name: "Consoles" }));
    fireEvent.click(await screen.findByRole("option", { name: "Nintendo Switch" }));
    fireEvent.keyDown(screen.getByRole("listbox", { name: "Consoles" }), {
      key: "Escape",
    });
    fireEvent.mouseDown(screen.getByRole("combobox", { name: "ESRB rating" }));
    fireEvent.click(await screen.findByRole("option", { name: "T" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum players" }), {
      target: { value: "2" },
    });
    fireEvent.change(screen.getByRole("spinbutton", { name: "Maximum players" }), {
      target: { value: "2" },
    });

    expect(
      await screen.findByRole("button", {
        name: "View details for Starfall Tactics",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 game")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View details for Clockwork Isles" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "View details for Neon Drift Circuit" }),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByRole("spinbutton", { name: "Minimum players" }), {
      target: { value: "4" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Correct the player filters to update results.",
    );
  });

  it("paginates results and resets to the first page after criteria changes", async () => {
    const user = userEvent.setup();
    const games: Game[] = Array.from({ length: 25 }, (_, index) => ({
      ...testGame,
      id: index + 1,
      title: `Game ${String(index + 1).padStart(2, "0")}`,
    }));
    const collection: GamePage = {
      items: games,
      page: 0,
      size: 20,
      totalItems: games.length,
      totalPages: 2,
    };
    render(<App collectionDataSource={createDataSource({}, collection)} />);

    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "View details for Game 21" }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByRole("searchbox", { name: "Search games" }), {
      target: { value: "25" },
    });
    expect(await screen.findByText("Page 1 of 1")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "View details for Game 25" }),
    ).toBeInTheDocument();
  });

  it("sorts the collection by release year in either direction", async () => {
    const user = userEvent.setup();
    render(<App />);
    await screen.findByRole("button", { name: "Add game" });

    await user.click(screen.getByRole("combobox", { name: "Sort by" }));
    await user.click(screen.getByRole("option", { name: "Release year" }));
    let games = screen.getAllByRole("button", { name: /View details for/ });
    expect(games[0]).toHaveAccessibleName("View details for Clockwork Isles");

    await user.click(screen.getByRole("combobox", { name: "Sort direction" }));
    await user.click(screen.getByRole("option", { name: "Descending" }));
    games = screen.getAllByRole("button", { name: /View details for/ });
    expect(games[0]).toHaveAccessibleName("View details for Neon Drift Circuit");
  });
});

describe("game details", () => {
  it("opens a dedicated detail view with all game fields and handles absent values", async () => {
    const user = userEvent.setup();
    render(<App collectionDataSource={createDataSource()} />);

    await user.click(
      await screen.findByRole("button", {
        name: "View details for Starfall Tactics",
      }),
    );

    expect(
      screen.getByRole("heading", { name: "Starfall Tactics", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Original release year")).toBeInTheDocument();
    expect(screen.getByText("Supported consoles")).toBeInTheDocument();
    expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
    expect(screen.getByText("ESRB rating")).toBeInTheDocument();
    expect(screen.getByText("Maximum local multiplayer players")).toBeInTheDocument();
    expect(screen.getByText("2", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByText("Personal comments")).toBeInTheDocument();
    expect(screen.getByText("A favorite for weekend co-op.")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back to collection" }));
    expect(
      await screen.findByRole("heading", { name: "Your game collection", level: 1 }),
    ).toBeInTheDocument();
  });

  it("shows optional fields as unspecified when a game has no optional metadata", async () => {
    const user = userEvent.setup();
    const game: Game = {
      ...testGame,
      esrbRating: null,
      maxLocalMultiplayerPlayers: null,
      coverImageUrl: null,
      personalComments: null,
    };
    render(
      <App
        collectionDataSource={createDataSource(
          {},
          { ...fixtureCollection, items: [game], totalItems: 1 },
        )}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "View details for Starfall Tactics" }),
    );
    expect(screen.getAllByText("Not specified")).toHaveLength(3);
    expect(screen.getByText("No comments")).toBeInTheDocument();
  });

  it("surfaces game lookup failures with a path back to the collection", async () => {
    const user = userEvent.setup();
    render(
      <App
        collectionDataSource={createDataSource({
          getGame: async () => {
            throw new Error("offline");
          },
        })}
      />,
    );

    await user.click(
      await screen.findByRole("button", { name: "View details for Starfall Tactics" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load this game",
    );
    await user.click(screen.getByRole("button", { name: "Back to collection" }));
    expect(
      await screen.findByRole("heading", { name: "Your game collection", level: 1 }),
    ).toBeInTheDocument();
  });
});

describe("game create and edit forms", () => {
  it("creates a game, assigns an ID, and opens its details", async () => {
    const user = userEvent.setup();
    const dataSource = createDataSource({}, emptyCollection);
    render(<App collectionDataSource={dataSource} />);

    await user.click(await screen.findByRole("button", { name: "Add game" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Moonlit Harbor" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Original release year" }), {
      target: { value: "2022" },
    });
    await user.click(screen.getByRole("checkbox", { name: "Nintendo Switch" }));
    fireEvent.change(
      screen.getByRole("textbox", { name: "Maximum local multiplayer players" }),
      { target: { value: "4" } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Cover image URL" }), {
      target: { value: "https://example.test/moonlit-harbor.jpg" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Personal comments" }), {
      target: { value: "Play this with friends." },
    });
    await user.click(screen.getByRole("button", { name: "Save game" }));

    expect(
      await screen.findByRole("heading", { name: "Moonlit Harbor", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nintendo Switch")).toBeInTheDocument();
    expect(screen.getByText("2022", { selector: "dd" })).toBeInTheDocument();
    expect(screen.getByText("Play this with friends.")).toBeInTheDocument();

    const created = await dataSource.getGame(1);
    expect(created).toMatchObject({
      title: "Moonlit Harbor",
      originalReleaseYear: 2022,
      maxLocalMultiplayerPlayers: 4,
      coverImageUrl: "https://example.test/moonlit-harbor.jpg",
      personalComments: "Play this with friends.",
    });

    await user.click(screen.getByRole("button", { name: "Back to collection" }));
    expect(
      await screen.findByRole("button", {
        name: "View details for Moonlit Harbor",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 game")).toBeInTheDocument();
  });

  it("edits a game and preserves its ID", async () => {
    const user = userEvent.setup();
    const dataSource = createDataSource();
    render(<App collectionDataSource={dataSource} />);

    await user.click(
      await screen.findByRole("button", { name: "View details for Starfall Tactics" }),
    );
    await user.click(screen.getByRole("button", { name: "Edit game" }));

    expect(screen.getByRole("textbox", { name: "Title" })).toHaveValue(
      "Starfall Tactics",
    );
    expect(screen.getByRole("textbox", { name: "Original release year" })).toHaveValue(
      "2023",
    );
    expect(screen.getByRole("checkbox", { name: "Nintendo Switch" })).toBeChecked();

    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Starfall Tactics: Redux" },
    });
    await user.click(screen.getByRole("button", { name: "Save game" }));

    expect(
      await screen.findByRole("heading", {
        name: "Starfall Tactics: Redux",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(await dataSource.getGame(12)).toMatchObject({
      id: 12,
      title: "Starfall Tactics: Redux",
    });
  });

  it("rejects invalid fields accessibly without calling the data source", async () => {
    const user = userEvent.setup();
    const createGame = jest.fn(
      async (_game: GameWrite): Promise<Game> => testGame,
    );
    render(
      <App
        collectionDataSource={createDataSource(
          { createGame },
          emptyCollection,
        )}
      />,
    );

    await user.click(await screen.findByRole("button", { name: "Add game" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "   " },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Original release year" }), {
      target: { value: "3000" },
    });
    fireEvent.change(
      screen.getByRole("textbox", { name: "Maximum local multiplayer players" }),
      { target: { value: "0" } },
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Cover image URL" }), {
      target: { value: "ftp://example.test/game.jpg" },
    });
    await user.click(screen.getByRole("button", { name: "Save game" }));

    expect(await screen.findByText("Enter a game title.")).toBeInTheDocument();
    expect(
      screen.getByText(`Enter a year from 1000 through ${new Date().getFullYear()}.`),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Select at least one supported console."),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Enter a positive whole-number player count, or leave this blank.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Enter an absolute HTTP or HTTPS URL."),
    ).toBeInTheDocument();
    expect(createGame).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Add a game", level: 1 })).toBeInTheDocument();
  });

  it("canceling an edit leaves collection data unchanged", async () => {
    const user = userEvent.setup();
    const dataSource = createDataSource();
    render(<App collectionDataSource={dataSource} />);

    await user.click(
      await screen.findByRole("button", { name: "View details for Starfall Tactics" }),
    );
    await user.click(screen.getByRole("button", { name: "Edit game" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Unsaved title" },
    });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      await screen.findByRole("heading", { name: "Starfall Tactics", level: 1 }),
    ).toBeInTheDocument();
    expect(await dataSource.getGame(12)).toMatchObject({
      title: "Starfall Tactics",
    });
  });

  it("canceling a create leaves the collection unchanged", async () => {
    const user = userEvent.setup();
    const dataSource = createDataSource({}, emptyCollection);
    render(<App collectionDataSource={dataSource} />);

    await user.click(await screen.findByRole("button", { name: "Add game" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Unsaved game" },
    });
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      await screen.findByRole("heading", { name: "Your collection is empty" }),
    ).toBeInTheDocument();
    expect((await dataSource.getCollection()).items).toHaveLength(0);
  });

  it("shows recoverable save errors without changing the collection", async () => {
    const user = userEvent.setup();
    const createGame = jest.fn(async (_game: GameWrite): Promise<Game> => {
      throw new Error("offline");
    });
    const dataSource = createDataSource(
      { createGame },
      emptyCollection,
    );
    render(<App collectionDataSource={dataSource} />);

    await user.click(await screen.findByRole("button", { name: "Add game" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Title" }), {
      target: { value: "Failed game" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "Original release year" }), {
      target: { value: "2022" },
    });
    await user.click(screen.getByRole("checkbox", { name: "Nintendo Switch" }));
    await user.click(screen.getByRole("button", { name: "Save game" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t save this game",
    );
    expect(screen.getByRole("heading", { name: "Add a game", level: 1 })).toBeInTheDocument();
    expect((await dataSource.getCollection()).items).toHaveLength(0);
  });
});

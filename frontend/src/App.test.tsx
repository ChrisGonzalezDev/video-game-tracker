import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import type {
  CollectionDataSource,
} from "./features/collection/collectionDataSource";
import type { GamePage } from "./features/collection/types";

const collection: GamePage = {
  items: [
    {
      id: 12,
      title: "Starfall Tactics",
      originalReleaseYear: 2023,
      consoles: [{ name: "PC" }],
      esrbRating: "T",
      maxLocalMultiplayerPlayers: 2,
      coverImageUrl: null,
      personalComments: null,
    },
  ],
  page: 0,
  size: 20,
  totalItems: 1,
  totalPages: 1,
};

function createDataSource(
  getCollection: () => Promise<GamePage>,
): CollectionDataSource {
  return { getCollection };
}

describe("collection view", () => {
  it("renders games returned by the injectable collection data source", async () => {
    render(
      <App collectionDataSource={createDataSource(() => Promise.resolve(collection))} />,
    );

    expect(
      await screen.findByRole("heading", { name: "Your game collection", level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Starfall Tactics", level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText("1 game")).toBeInTheDocument();
    expect(screen.getByText("PC")).toBeInTheDocument();
  });

  it("shows a loading status while the collection request is pending", () => {
    const dataSource = createDataSource(
      () => new Promise<GamePage>(() => undefined),
    );

    render(<App collectionDataSource={dataSource} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "Loading your collection",
    );
  });

  it("shows a distinct empty state when the collection has no games", async () => {
    const emptyCollection: GamePage = {
      ...collection,
      items: [],
      totalItems: 0,
      totalPages: 0,
    };

    render(
      <App
        collectionDataSource={createDataSource(() =>
          Promise.resolve(emptyCollection),
        )}
      />,
    );

    expect(
      await screen.findByRole("heading", { name: "Your collection is empty" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Games you add will show up here.")).toBeInTheDocument();
  });

  it("shows a recoverable error state and retries loading", async () => {
    const user = userEvent.setup();
    let calls = 0;
    const getCollection = async () => {
      calls += 1;
      if (calls === 1) {
        throw new Error("offline");
      }
      return collection;
    };

    render(<App collectionDataSource={createDataSource(getCollection)} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn’t load your collection",
    );
    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(
      await screen.findByRole("heading", { name: "Starfall Tactics", level: 3 }),
    ).toBeInTheDocument();
    expect(calls).toBe(2);
  });
});

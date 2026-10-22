import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import type { ReactNode } from "react";
import GameForm from "./features/collection/GameForm";
import {
  fixtureCollectionDataSource,
  type CollectionDataSource,
} from "./features/collection/collectionDataSource";
import type { Console, Game, GamePage, GameWrite } from "./features/collection/types";

interface AppProps {
  collectionDataSource?: CollectionDataSource;
}

type CollectionState =
  | { status: "loading" }
  | { status: "success"; collection: GamePage }
  | { status: "error" };

type FormMode = "create" | "edit";

type Screen =
  | { view: "collection" }
  | { view: "detail-loading" }
  | { view: "detail-error"; message: string }
  | { view: "detail"; game: Game }
  | { view: "form-loading"; mode: FormMode; game?: Game }
  | { view: "form-error"; mode: FormMode; game?: Game }
  | { view: "create"; consoles: Console[] }
  | { view: "edit"; game: Game; consoles: Console[] };

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#10141c",
      paper: "#171d28",
    },
    primary: {
      main: "#9fb8ff",
    },
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shape: {
    borderRadius: 14,
  },
});

function GameCard({
  game,
  onOpen,
}: {
  game: Game;
  onOpen: (id: number) => void;
}) {
  return (
    <Card component="article" className="game-card" variant="outlined">
      <Button
        className="game-card__action"
        onClick={() => onOpen(game.id)}
        aria-label={`View details for ${game.title}`}
        fullWidth
      >
        {game.coverImageUrl ? (
          <CardMedia
            component="img"
            className="game-card__cover"
            image={game.coverImageUrl}
            alt=""
          />
        ) : (
          <Box
            className="game-card__cover game-card__cover--placeholder"
            aria-hidden="true"
          >
            <span className="game-card__cover-mark">PLAY</span>
          </Box>
        )}
        <CardContent className="game-card__content">
          <Typography component="h3" variant="h6" className="game-card__title">
            {game.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {game.originalReleaseYear}
            {game.esrbRating ? ` · ${game.esrbRating}` : ""}
          </Typography>
          <Box className="game-card__consoles" aria-label="Available consoles">
            {game.consoles.map(({ name }) => (
              <Chip key={name} label={name} size="small" variant="outlined" />
            ))}
          </Box>
          {game.maxLocalMultiplayerPlayers != null && (
            <Typography variant="caption" color="text.secondary">
              Up to {game.maxLocalMultiplayerPlayers} local players
            </Typography>
          )}
        </CardContent>
      </Button>
    </Card>
  );
}

function CollectionContents({
  state,
  onRetry,
  onOpenGame,
}: {
  state: CollectionState;
  onRetry: () => void;
  onOpenGame: (id: number) => void;
}) {
  if (state.status === "loading") {
    return (
      <Box className="collection-state" role="status" aria-live="polite">
        <CircularProgress size={32} aria-label="Loading collection" />
        <Typography color="text.secondary">Loading your collection…</Typography>
      </Box>
    );
  }

  if (state.status === "error") {
    return (
      <Alert
        className="collection-error"
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={onRetry}>
            Try again
          </Button>
        }
      >
        We couldn’t load your collection. Please try again.
      </Alert>
    );
  }

  if (state.collection.items.length === 0) {
    return (
      <Box className="collection-state collection-state--empty" role="status">
        <span className="empty-mark" aria-hidden="true">
          +
        </span>
        <Typography component="h2" variant="h5">
          Your collection is empty
        </Typography>
        <Typography color="text.secondary">
          Games you add will show up here.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={2.5}>
      <Box className="collection-summary">
        <Typography component="h2" variant="h5">
          Your collection
        </Typography>
        <Typography color="text.secondary">
          {state.collection.totalItems}{" "}
          {state.collection.totalItems === 1 ? "game" : "games"}
        </Typography>
      </Box>
      <Box className="game-grid">
        {state.collection.items.map((game) => (
          <GameCard key={game.id} game={game} onOpen={onOpenGame} />
        ))}
      </Box>
    </Stack>
  );
}

function GameDetails({
  game,
  onBack,
  onEdit,
}: {
  game: Game;
  onBack: () => void;
  onEdit: () => void;
}) {
  return (
    <Stack spacing={3}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        sx={{ justifyContent: "space-between" }}
      >
        <Button variant="outlined" onClick={onBack}>
          Back to collection
        </Button>
        <Button variant="contained" onClick={onEdit}>
          Edit game
        </Button>
      </Stack>

      {game.coverImageUrl && (
        <Box
          component="img"
          className="game-details__cover"
          src={game.coverImageUrl}
          alt={`${game.title} cover`}
        />
      )}

      <Box component="dl" className="game-details">
        <DetailField label="Original release year">
          {game.originalReleaseYear}
        </DetailField>
        <DetailField label="Supported consoles">
          {game.consoles.map(({ name }) => name).join(", ")}
        </DetailField>
        <DetailField label="ESRB rating">
          {game.esrbRating ?? "Not specified"}
        </DetailField>
        <DetailField label="Maximum local multiplayer players">
          {game.maxLocalMultiplayerPlayers ?? "Not specified"}
        </DetailField>
        <DetailField label="Cover image URL">
          {game.coverImageUrl ? (
            <a href={game.coverImageUrl} target="_blank" rel="noreferrer">
              {game.coverImageUrl}
            </a>
          ) : (
            "Not specified"
          )}
        </DetailField>
        <DetailField label="Personal comments">
          {game.personalComments || "No comments"}
        </DetailField>
      </Box>
    </Stack>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Box className="game-details__field">
      <Typography component="dt" variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography component="dd" variant="body1">
        {children}
      </Typography>
    </Box>
  );
}

function updateCollectionWithGame(
  state: CollectionState,
  game: Game,
  isNew: boolean,
): CollectionState {
  if (state.status !== "success") {
    return state;
  }

  const items = isNew
    ? [...state.collection.items, game]
    : state.collection.items.map((item) => (item.id === game.id ? game : item));
  const totalItems = isNew
    ? state.collection.totalItems + 1
    : state.collection.totalItems;

  return {
    status: "success",
    collection: {
      ...state.collection,
      items,
      totalItems,
      totalPages: Math.ceil(totalItems / state.collection.size),
    },
  };
}

function CollectionApp({
  collectionDataSource,
}: {
  collectionDataSource: CollectionDataSource;
}) {
  const [collectionState, setCollectionState] = useState<CollectionState>({
    status: "loading",
  });
  const [screen, setScreen] = useState<Screen>({ view: "collection" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;
    setCollectionState({ status: "loading" });
    collectionDataSource
      .getCollection()
      .then((collection) => {
        if (isCurrent) {
          setCollectionState({ status: "success", collection });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setCollectionState({ status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, collectionDataSource]);

  async function openGame(id: number) {
    setScreen({ view: "detail-loading" });
    try {
      const game = await collectionDataSource.getGame(id);
      if (game) {
        setScreen({ view: "detail", game });
      } else {
        setScreen({
          view: "detail-error",
          message: "This game is no longer available in the collection.",
        });
      }
    } catch {
      setScreen({
        view: "detail-error",
        message: "We couldn’t load this game. Please return to the collection and try again.",
      });
    }
  }

  async function openForm(mode: FormMode, game?: Game) {
    setScreen({ view: "form-loading", mode, game });
    try {
      const consoles = await collectionDataSource.getConsoles();
      if (mode === "create") {
        setScreen({ view: "create", consoles });
      } else if (game) {
        setScreen({ view: "edit", game, consoles });
      }
    } catch {
      setScreen({ view: "form-error", mode, game });
    }
  }

  async function createGame(write: GameWrite) {
    const created = await collectionDataSource.createGame(write);
    setCollectionState((current) => updateCollectionWithGame(current, created, true));
    setScreen({ view: "detail", game: created });
  }

  async function updateGame(write: GameWrite) {
    if (screen.view !== "edit") {
      throw new Error("The game being edited is no longer available.");
    }
    const updated = await collectionDataSource.updateGame(screen.game.id, write);
    setCollectionState((current) =>
      updateCollectionWithGame(current, updated, false),
    );
    setScreen({ view: "detail", game: updated });
  }

  const pageTitle =
    screen.view === "detail"
      ? screen.game.title
      : screen.view === "create"
        ? "Add a game"
        : screen.view === "edit"
          ? "Edit game"
          : screen.view === "detail-loading"
            ? "Loading game"
            : screen.view === "form-loading"
              ? screen.mode === "create"
                ? "Add a game"
                : "Edit game"
              : screen.view === "form-error"
                ? "Game form unavailable"
                : screen.view === "detail-error"
                  ? "Game unavailable"
                  : "Your game collection";

  const pageDescription =
    screen.view === "collection"
      ? "Keep track of the games you love and the worlds you’ve explored."
      : screen.view === "detail"
        ? "Game details"
        : screen.view === "create"
          ? "Add the details for a game in your collection."
          : screen.view === "edit"
            ? "Update the details for this game."
            : "";

  function returnToCollection() {
    setScreen({ view: "collection" });
  }

  return (
    <Box className="app-shell">
      <Box component="header" className="app-header">
        <Container maxWidth="xl" className="app-header__inner">
          <button
            className="brand"
            type="button"
            onClick={returnToCollection}
            aria-label="Video Game Tracker home"
          >
            <span className="brand__mark" aria-hidden="true">
              VG
            </span>
            <span>GameVault</span>
          </button>
          <span className="header-label">PERSONAL LIBRARY</span>
        </Container>
      </Box>

      <Container component="main" maxWidth="xl" className="page-content">
        <Box className="page-intro">
          {screen.view === "collection" && (
            <Typography className="eyebrow" component="p">
              Your collection, in one place
            </Typography>
          )}
          <Box className="page-intro__row">
            <Box>
              <Typography
                id={
                  screen.view === "create" || screen.view === "edit"
                    ? "game-form-title"
                    : undefined
                }
                component="h1"
                variant="h2"
                className="page-title"
              >
                {pageTitle}
              </Typography>
              {pageDescription && (
                <Typography className="page-description" color="text.secondary">
                  {pageDescription}
                </Typography>
              )}
            </Box>
            {screen.view === "collection" &&
              collectionState.status === "success" && (
                <Button
                  variant="contained"
                  onClick={() => void openForm("create")}
                >
                  Add game
                </Button>
              )}
          </Box>
        </Box>

        {screen.view === "collection" && (
          <Box component="section" aria-label="Game collection">
            <CollectionContents
              state={collectionState}
              onRetry={() => setAttempt((current) => current + 1)}
              onOpenGame={(id) => void openGame(id)}
            />
          </Box>
        )}

        {screen.view === "detail-loading" && (
          <Box className="collection-state" role="status" aria-live="polite">
            <CircularProgress size={32} aria-label="Loading game details" />
            <Typography color="text.secondary">Loading game details…</Typography>
          </Box>
        )}

        {screen.view === "detail-error" && (
          <Stack spacing={2}>
            <Alert severity="error">{screen.message}</Alert>
            <Button onClick={returnToCollection} variant="outlined">
              Back to collection
            </Button>
          </Stack>
        )}

        {screen.view === "detail" && (
          <GameDetails
            game={screen.game}
            onBack={returnToCollection}
            onEdit={() => void openForm("edit", screen.game)}
          />
        )}

        {screen.view === "form-loading" && (
          <Box className="collection-state" role="status" aria-live="polite">
            <CircularProgress size={32} aria-label="Loading game form" />
            <Typography color="text.secondary">Loading supported consoles…</Typography>
          </Box>
        )}

        {screen.view === "form-error" && (
          <Stack spacing={2}>
            <Alert severity="error">
              We couldn’t load supported consoles for this form.
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                onClick={() => void openForm(screen.mode, screen.game)}
              >
                Try again
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  if (screen.mode === "edit" && screen.game) {
                    setScreen({ view: "detail", game: screen.game });
                  } else {
                    returnToCollection();
                  }
                }}
              >
                Cancel
              </Button>
            </Stack>
          </Stack>
        )}

        {screen.view === "create" && (
          <GameForm
            consoles={screen.consoles}
            onSave={createGame}
            onCancel={returnToCollection}
          />
        )}

        {screen.view === "edit" && (
          <GameForm
            game={screen.game}
            consoles={screen.consoles}
            onSave={updateGame}
            onCancel={() => setScreen({ view: "detail", game: screen.game })}
          />
        )}
      </Container>
    </Box>
  );
}

export default function App({
  collectionDataSource = fixtureCollectionDataSource,
}: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CollectionApp collectionDataSource={collectionDataSource} />
    </ThemeProvider>
  );
}

import { useEffect, useRef, useState } from "react";
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
import CollectionControls, {
  defaultCollectionControls,
  hasInvalidPlayerCriteria,
  type CollectionControlsState,
} from "./features/collection/CollectionControls";
import GameForm from "./features/collection/GameForm";
import {
  fixtureCollectionDataSource,
  type CollectionQuery,
  type CollectionDataSource,
} from "./features/collection/collectionDataSource";
import type {
  Console,
  Game,
  GamePage,
  GameWrite,
} from "./features/collection/types";

interface AppProps {
  collectionDataSource?: CollectionDataSource;
}

type CollectionState =
  | { status: "loading" }
  | {
      status: "success";
      collection: GamePage;
      totalCollectionItems: number;
    }
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
  criteria,
  consoles,
  onCriteriaChange,
  onPageChange,
  queryError,
  onRetryQuery,
  queryPending,
  invalidPlayerCriteria,
}: {
  state: CollectionState;
  onRetry: () => void;
  onOpenGame: (id: number) => void;
  criteria: CollectionControlsState;
  consoles: Console[];
  onCriteriaChange: (criteria: CollectionControlsState) => void;
  onPageChange: (page: number) => void;
  queryError: boolean;
  onRetryQuery: () => void;
  queryPending: boolean;
  invalidPlayerCriteria: boolean;
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

  if (state.totalCollectionItems === 0) {
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
      <CollectionControls
        criteria={criteria}
        consoles={consoles}
        onCriteriaChange={onCriteriaChange}
      />
      {queryPending && (
        <Typography role="status" aria-live="polite" color="text.secondary">
          Updating results…
        </Typography>
      )}
      {queryError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={onRetryQuery}>
              Try again
            </Button>
          }
        >
          We couldn’t update your results. Please try again.
        </Alert>
      )}
      {invalidPlayerCriteria && (
        <Alert severity="warning">
          Correct the player filters to update results.
        </Alert>
      )}
      {state.collection.totalItems === 0 ? (
        <Box className="collection-state collection-state--empty" role="status">
          <Typography component="h2" variant="h5">
            No games match your search
          </Typography>
          <Typography color="text.secondary">
            Try changing your search or filters, or clear them to see your collection.
          </Typography>
        </Box>
      ) : (
        <Box className="game-grid">
          {state.collection.items.map((game) => (
            <GameCard key={game.id} game={game} onOpen={onOpenGame} />
          ))}
        </Box>
      )}
      {state.collection.totalPages > 0 && (
        <Stack
          className="collection-pagination"
          direction="row"
          spacing={1.5}
          sx={{ alignItems: "center", justifyContent: "center" }}
        >
          <Button
            variant="outlined"
            onClick={() => onPageChange(state.collection.page - 1)}
            disabled={state.collection.page === 0 || queryPending}
          >
            Previous
          </Button>
          <Typography aria-live="polite">
            Page {state.collection.page + 1} of {state.collection.totalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => onPageChange(state.collection.page + 1)}
            disabled={
              state.collection.page + 1 >= state.collection.totalPages ||
              queryPending
            }
          >
            Next
          </Button>
        </Stack>
      )}
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

function positiveInteger(value: string): number | undefined {
  if (value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

function toCollectionQuery(criteria: CollectionControlsState): CollectionQuery {
  const minPlayers = positiveInteger(criteria.minPlayers);
  const maxPlayers = positiveInteger(criteria.maxPlayers);
  return {
    keyword: criteria.keyword,
    consoles: criteria.consoles,
    ...(criteria.rating ? { rating: criteria.rating } : {}),
    ...(minPlayers != null ? { minPlayers } : {}),
    ...(maxPlayers != null ? { maxPlayers } : {}),
    sort: criteria.sort,
    direction: criteria.direction,
    page: criteria.page,
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
  const [queryAttempt, setQueryAttempt] = useState(0);
  const [criteria, setCriteria] = useState(defaultCollectionControls);
  const [consoleOptions, setConsoleOptions] = useState<Console[]>([]);
  const [queryError, setQueryError] = useState(false);
  const [queryPending, setQueryPending] = useState(false);
  const hasLoadedCollection = useRef(false);

  useEffect(() => {
    let isCurrent = true;
    const isInitialLoad = !hasLoadedCollection.current;
    if (hasInvalidPlayerCriteria(criteria)) {
      setQueryPending(false);
      setQueryError(false);
      return () => {
        isCurrent = false;
      };
    }

    if (isInitialLoad) {
      setCollectionState({ status: "loading" });
    } else {
      setQueryPending(true);
    }
    setQueryError(false);

    async function loadCollection() {
      try {
        const collection = await collectionDataSource.getCollection(
          toCollectionQuery(criteria),
        );
        if (isInitialLoad) {
          const consoles = await collectionDataSource.getConsoles();
          if (isCurrent) {
            hasLoadedCollection.current = true;
            setConsoleOptions(consoles);
            setCollectionState({
              status: "success",
              collection,
              totalCollectionItems: collection.totalItems,
            });
          }
        } else if (isCurrent) {
          setCollectionState((current) =>
            current.status === "success"
              ? { ...current, collection }
              : {
                  status: "success",
                  collection,
                  totalCollectionItems: collection.totalItems,
                },
          );
        }
      } catch {
        if (isCurrent) {
          if (isInitialLoad) {
            setCollectionState({ status: "error" });
          } else {
            setQueryError(true);
          }
        }
      } finally {
        if (isCurrent) {
          setQueryPending(false);
        }
      }
    }

    void loadCollection();

    return () => {
      isCurrent = false;
    };
  }, [attempt, criteria, collectionDataSource, queryAttempt]);

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
    try {
      const collection = await collectionDataSource.getCollection(
        toCollectionQuery(criteria),
      );
      setCollectionState((current) =>
        current.status === "success"
          ? {
              ...current,
              collection,
              totalCollectionItems: current.totalCollectionItems + 1,
            }
          : current,
      );
      setQueryError(false);
    } catch {
      setQueryError(true);
    }
    setScreen({ view: "detail", game: created });
  }

  async function updateGame(write: GameWrite) {
    if (screen.view !== "edit") {
      throw new Error("The game being edited is no longer available.");
    }
    const updated = await collectionDataSource.updateGame(screen.game.id, write);
    try {
      const collection = await collectionDataSource.getCollection(
        toCollectionQuery(criteria),
      );
      setCollectionState((current) =>
        current.status === "success" ? { ...current, collection } : current,
      );
      setQueryError(false);
    } catch {
      setQueryError(true);
    }
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
              criteria={criteria}
              consoles={consoleOptions}
              onCriteriaChange={setCriteria}
              onPageChange={(page) =>
                setCriteria((current) => ({ ...current, page }))
              }
              queryError={queryError}
              onRetryQuery={() => setQueryAttempt((current) => current + 1)}
              queryPending={queryPending}
              invalidPlayerCriteria={hasInvalidPlayerCriteria(criteria)}
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

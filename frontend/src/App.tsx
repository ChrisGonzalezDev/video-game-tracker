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
import {
  fixtureCollectionDataSource,
  type CollectionDataSource,
} from "./features/collection/collectionDataSource";
import type {
  Game,
  GamePage,
} from "./features/collection/types";

interface AppProps {
  collectionDataSource?: CollectionDataSource;
}

type CollectionState =
  | { status: "loading" }
  | { status: "success"; collection: GamePage }
  | { status: "error" };

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

function GameCard({ game }: { game: Game }) {
  return (
    <Card component="article" className="game-card" variant="outlined">
      {game.coverImageUrl ? (
        <CardMedia
          component="img"
          className="game-card__cover"
          image={game.coverImageUrl}
          alt=""
        />
      ) : (
        <Box className="game-card__cover game-card__cover--placeholder" aria-hidden="true">
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
    </Card>
  );
}

function CollectionContents({
  state,
  onRetry,
}: {
  state: CollectionState;
  onRetry: () => void;
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
          <GameCard key={game.id} game={game} />
        ))}
      </Box>
    </Stack>
  );
}

function CollectionApp({
  collectionDataSource,
}: {
  collectionDataSource: CollectionDataSource;
}) {
  const [state, setState] = useState<CollectionState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    setState({ status: "loading" });
    collectionDataSource
      .getCollection()
      .then((collection) => {
        if (isCurrent) {
          setState({ status: "success", collection });
        }
      })
      .catch(() => {
        if (isCurrent) {
          setState({ status: "error" });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [attempt, collectionDataSource]);

  return (
    <Box className="app-shell">
      <Box component="header" className="app-header">
        <Container maxWidth="xl" className="app-header__inner">
          <a className="brand" href="/" aria-label="Video Game Tracker home">
            <span className="brand__mark" aria-hidden="true">
              VG
            </span>
            <span>GameVault</span>
          </a>
          <span className="header-label">PERSONAL LIBRARY</span>
        </Container>
      </Box>

      <Container component="main" maxWidth="xl" className="page-content">
        <Box className="page-intro">
          <Typography className="eyebrow" component="p">
            Your collection, in one place
          </Typography>
          <Typography component="h1" variant="h2" className="page-title">
            Your game collection
          </Typography>
          <Typography className="page-description" color="text.secondary">
            Keep track of the games you love and the worlds you’ve explored.
          </Typography>
        </Box>

        <Box component="section" aria-label="Game collection">
          <CollectionContents
            state={state}
            onRetry={() => setAttempt((current) => current + 1)}
          />
        </Box>
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

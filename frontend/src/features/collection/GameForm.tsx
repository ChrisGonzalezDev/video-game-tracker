import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  FormLabel,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Console, EsrbRating, Game, GameWrite } from "./types";

const esrbRatings: EsrbRating[] = ["EC", "E", "E10+", "T", "M", "AO", "RP"];

interface GameFormValues {
  title: string;
  originalReleaseYear: string;
  consoles: string[];
  esrbRating: string;
  maxLocalMultiplayerPlayers: string;
  coverImageUrl: string;
  personalComments: string;
}

type GameFormField = keyof GameFormValues;
type GameFormErrors = Partial<Record<GameFormField, string>>;

function toFormValues(game?: Game): GameFormValues {
  return {
    title: game?.title ?? "",
    originalReleaseYear:
      game?.originalReleaseYear != null ? String(game.originalReleaseYear) : "",
    consoles: game?.consoles.map(({ name }) => name) ?? [],
    esrbRating: game?.esrbRating ?? "",
    maxLocalMultiplayerPlayers:
      game?.maxLocalMultiplayerPlayers != null
        ? String(game.maxLocalMultiplayerPlayers)
        : "",
    coverImageUrl: game?.coverImageUrl ?? "",
    personalComments: game?.personalComments ?? "",
  };
}

export function validateGameForm(
  values: GameFormValues,
  supportedConsoles: Console[],
  currentYear = new Date().getFullYear(),
): GameFormErrors {
  const errors: GameFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Enter a game title.";
  }

  if (!/^\d+$/.test(values.originalReleaseYear)) {
    errors.originalReleaseYear = "Enter a whole-number release year.";
  } else {
    const year = Number(values.originalReleaseYear);
    if (year < 1000 || year > currentYear) {
      errors.originalReleaseYear = `Enter a year from 1000 through ${currentYear}.`;
    }
  }

  const selectedConsoles = new Set(values.consoles);
  if (
    selectedConsoles.size === 0 ||
    selectedConsoles.size !== values.consoles.length ||
    values.consoles.some(
      (name) => !supportedConsoles.some((console) => console.name === name),
    )
  ) {
    errors.consoles = "Select at least one supported console.";
  }

  if (
    values.esrbRating !== "" &&
    !esrbRatings.includes(values.esrbRating as EsrbRating)
  ) {
    errors.esrbRating = "Choose a valid ESRB rating.";
  }

  if (
    values.maxLocalMultiplayerPlayers !== "" &&
    (!/^\d+$/.test(values.maxLocalMultiplayerPlayers) ||
      Number(values.maxLocalMultiplayerPlayers) < 1)
  ) {
    errors.maxLocalMultiplayerPlayers =
      "Enter a positive whole-number player count, or leave this blank.";
  }

  if (values.coverImageUrl.trim()) {
    try {
      const url = new URL(values.coverImageUrl.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        errors.coverImageUrl = "Enter an absolute HTTP or HTTPS URL.";
      }
    } catch {
      errors.coverImageUrl = "Enter an absolute HTTP or HTTPS URL.";
    }
  }

  return errors;
}

interface GameFormProps {
  game?: Game;
  consoles: Console[];
  onSave: (game: GameWrite) => Promise<void>;
  onCancel: () => void;
}

export default function GameForm({
  game,
  consoles,
  onSave,
  onCancel,
}: GameFormProps) {
  const [values, setValues] = useState<GameFormValues>(() => toFormValues(game));
  const [errors, setErrors] = useState<GameFormErrors>({});
  const [saveError, setSaveError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: GameFormField, value: string | string[]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setSaveError(undefined);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateGameForm(values, consoles);
    setErrors(validationErrors);
    setSaveError(undefined);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const write: GameWrite = {
      title: values.title.trim(),
      originalReleaseYear: Number(values.originalReleaseYear),
      consoles: values.consoles.map((name) => ({ name })),
      esrbRating: (values.esrbRating || null) as EsrbRating | null,
      maxLocalMultiplayerPlayers:
        values.maxLocalMultiplayerPlayers === ""
          ? null
          : Number(values.maxLocalMultiplayerPlayers),
      coverImageUrl: values.coverImageUrl.trim() || null,
      personalComments: values.personalComments.trim() || null,
    };

    setIsSubmitting(true);
    try {
      await onSave(write);
    } catch {
      setSaveError("We couldn’t save this game. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Box
      component="form"
      className="game-form"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="game-form-title"
    >
      <Stack spacing={2.5}>
        {saveError && <Alert severity="error">{saveError}</Alert>}

        <TextField
          id="game-title"
          label="Title"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
          error={Boolean(errors.title)}
          helperText={errors.title ?? " "}
          required
          autoComplete="off"
          fullWidth
        />

        <TextField
          id="game-release-year"
          label="Original release year"
          value={values.originalReleaseYear}
          onChange={(event) =>
            updateField("originalReleaseYear", event.target.value)
          }
          error={Boolean(errors.originalReleaseYear)}
          helperText={errors.originalReleaseYear ?? "Use a year from 1000 through the current year."}
          required
          slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
          fullWidth
        />

        <FormControl
          component="fieldset"
          error={Boolean(errors.consoles)}
          required
        >
          <FormLabel component="legend" id="game-consoles-label">
            Supported consoles
          </FormLabel>
          <FormGroup
            className="console-options"
            aria-labelledby="game-consoles-label"
          >
            {consoles.map(({ name }) => (
              <FormControlLabel
                key={name}
                control={
                  <Checkbox
                    checked={values.consoles.includes(name)}
                    onChange={(event) => {
                      const selected = new Set(values.consoles);
                      if (event.target.checked) {
                        selected.add(name);
                      } else {
                        selected.delete(name);
                      }
                      updateField("consoles", [...selected]);
                    }}
                  />
                }
                label={name}
              />
            ))}
          </FormGroup>
          <FormHelperText>
            {errors.consoles ?? "Select one or more consoles."}
          </FormHelperText>
        </FormControl>

        <TextField
          id="game-esrb-rating"
          label="ESRB rating"
          value={values.esrbRating}
          onChange={(event) => updateField("esrbRating", event.target.value)}
          error={Boolean(errors.esrbRating)}
          helperText={errors.esrbRating ?? "Optional"}
          select
          fullWidth
        >
          <MenuItem value="">Not specified</MenuItem>
          {esrbRatings.map((rating) => (
            <MenuItem key={rating} value={rating}>
              {rating}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          id="game-max-players"
          label="Maximum local multiplayer players"
          value={values.maxLocalMultiplayerPlayers}
          onChange={(event) =>
            updateField("maxLocalMultiplayerPlayers", event.target.value)
          }
          error={Boolean(errors.maxLocalMultiplayerPlayers)}
          helperText={errors.maxLocalMultiplayerPlayers ?? "Optional"}
          slotProps={{ htmlInput: { inputMode: "numeric", pattern: "[0-9]*" } }}
          fullWidth
        />

        <TextField
          id="game-cover-url"
          label="Cover image URL"
          value={values.coverImageUrl}
          onChange={(event) => updateField("coverImageUrl", event.target.value)}
          error={Boolean(errors.coverImageUrl)}
          helperText={errors.coverImageUrl ?? "Optional; use an HTTP or HTTPS URL."}
          type="url"
          fullWidth
        />

        <TextField
          id="game-comments"
          label="Personal comments"
          value={values.personalComments}
          onChange={(event) =>
            updateField("personalComments", event.target.value)
          }
          helperText="Optional"
          multiline
          minRows={3}
          fullWidth
        />

        <Stack
          direction={{ xs: "column-reverse", sm: "row" }}
          spacing={1.5}
          sx={{ justifyContent: "flex-end" }}
        >
          <Button
            type="button"
            variant="outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save game"}
          </Button>
        </Stack>
        <Typography className="visually-hidden" role="status" aria-live="polite">
          {isSubmitting ? "Saving game" : ""}
        </Typography>
      </Stack>
    </Box>
  );
}

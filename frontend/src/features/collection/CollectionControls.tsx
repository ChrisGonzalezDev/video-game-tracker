import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import type { Console, EsrbRating } from "./types";
import type {
  CollectionSortDirection,
  CollectionSortField,
} from "./collectionDataSource";

export interface CollectionControlsState {
  keyword: string;
  consoles: string[];
  rating: EsrbRating | "";
  minPlayers: string;
  maxPlayers: string;
  sort: CollectionSortField;
  direction: CollectionSortDirection;
  page: number;
}

export const defaultCollectionControls: CollectionControlsState = {
  keyword: "",
  consoles: [],
  rating: "",
  minPlayers: "",
  maxPlayers: "",
  sort: "title",
  direction: "asc",
  page: 0,
};

const esrbRatings: EsrbRating[] = ["EC", "E", "E10+", "T", "M", "AO", "RP"];

function positiveInteger(value: string): number | undefined {
  if (value === "") {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

export function hasInvalidPlayerCriteria(
  criteria: CollectionControlsState,
): boolean {
  const minIsInvalid =
    criteria.minPlayers !== "" && positiveInteger(criteria.minPlayers) == null;
  const maxIsInvalid =
    criteria.maxPlayers !== "" && positiveInteger(criteria.maxPlayers) == null;
  const minimum = positiveInteger(criteria.minPlayers);
  const maximum = positiveInteger(criteria.maxPlayers);

  return (
    minIsInvalid ||
    maxIsInvalid ||
    (minimum != null && maximum != null && minimum > maximum)
  );
}

interface CollectionControlsProps {
  criteria: CollectionControlsState;
  consoles: Console[];
  onCriteriaChange: (criteria: CollectionControlsState) => void;
}

function parseConsoleSelection(event: SelectChangeEvent<string[]>): string[] {
  const value = event.target.value;
  return typeof value === "string" ? value.split(",") : value;
}

function parseSortField(value: string): CollectionSortField {
  return value === "originalReleaseYear" ? value : "title";
}

function parseSortDirection(value: string): CollectionSortDirection {
  return value === "desc" ? value : "asc";
}

function parseRating(value: string): EsrbRating | "" {
  return esrbRatings.find((rating) => rating === value) ?? "";
}

export default function CollectionControls({
  criteria,
  consoles,
  onCriteriaChange,
}: CollectionControlsProps) {
  const hasActiveCriteria =
    criteria.keyword !== "" ||
    criteria.consoles.length > 0 ||
    criteria.rating !== "" ||
    criteria.minPlayers !== "" ||
    criteria.maxPlayers !== "" ||
    criteria.sort !== "title" ||
    criteria.direction !== "asc" ||
    criteria.page !== 0;

  function updateCriteria(
    updates: Partial<CollectionControlsState>,
  ) {
    onCriteriaChange({
      ...criteria,
      ...updates,
      page: 0,
    });
  }

  function numberFieldError(value: string) {
    return value !== "" && (!Number.isInteger(Number(value)) || Number(value) < 1);
  }
  const minimumPlayers = positiveInteger(criteria.minPlayers);
  const maximumPlayers = positiveInteger(criteria.maxPlayers);
  const hasReversedRange =
    minimumPlayers != null &&
    maximumPlayers != null &&
    minimumPlayers > maximumPlayers;

  return (
    <Box
      component="form"
      className="collection-controls"
      aria-label="Search and filter games"
      onSubmit={(event) => event.preventDefault()}
    >
      <Stack spacing={2}>
        <TextField
          label="Search games"
          placeholder="Title or personal comment"
          type="search"
          size="small"
          value={criteria.keyword}
          onChange={(event) => updateCriteria({ keyword: event.target.value })}
          fullWidth
        />

        <Box className="collection-controls__grid">
          <FormControl size="small" fullWidth>
            <InputLabel id="console-filter-label">Consoles</InputLabel>
            <Select
              labelId="console-filter-label"
              id="console-filter"
              multiple
              value={criteria.consoles}
              label="Consoles"
              onChange={(event) =>
                updateCriteria({ consoles: parseConsoleSelection(event) })
              }
              renderValue={(selected) => selected.join(", ")}
            >
              {consoles.map(({ name }) => (
                <MenuItem key={name} value={name}>
                  <Checkbox checked={criteria.consoles.includes(name)} />
                  <ListItemText primary={name} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="rating-filter-label">ESRB rating</InputLabel>
            <Select
              labelId="rating-filter-label"
              id="rating-filter"
              value={criteria.rating}
              label="ESRB rating"
              onChange={(event) =>
                updateCriteria({ rating: parseRating(event.target.value) })
              }
            >
              <MenuItem value="">All ratings</MenuItem>
              {esrbRatings.map((rating) => (
                <MenuItem key={rating} value={rating}>
                  {rating}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Minimum players"
            type="number"
            size="small"
            value={criteria.minPlayers}
            onChange={(event) => updateCriteria({ minPlayers: event.target.value })}
            error={numberFieldError(criteria.minPlayers)}
            helperText={
              numberFieldError(criteria.minPlayers)
                ? "Enter a positive whole number."
                : undefined
            }
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />

          <TextField
            label="Maximum players"
            type="number"
            size="small"
            value={criteria.maxPlayers}
            onChange={(event) => updateCriteria({ maxPlayers: event.target.value })}
            error={numberFieldError(criteria.maxPlayers)}
            helperText={
              numberFieldError(criteria.maxPlayers)
                ? "Enter a positive whole number."
                : hasReversedRange
                  ? "Maximum players must be at least minimum players."
                : undefined
            }
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="sort-field-label">Sort by</InputLabel>
            <Select
              labelId="sort-field-label"
              id="sort-field"
              value={criteria.sort}
              label="Sort by"
              onChange={(event) =>
                updateCriteria({
                  sort: parseSortField(event.target.value),
                })
              }
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="originalReleaseYear">Release year</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="sort-direction-label">Sort direction</InputLabel>
            <Select
              labelId="sort-direction-label"
              id="sort-direction"
              value={criteria.direction}
              label="Sort direction"
              onChange={(event) =>
                updateCriteria({
                  direction: parseSortDirection(event.target.value),
                })
              }
            >
              <MenuItem value="asc">Ascending</MenuItem>
              <MenuItem value="desc">Descending</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Button
          className="collection-controls__reset"
          variant="outlined"
          onClick={() => onCriteriaChange(defaultCollectionControls)}
          disabled={!hasActiveCriteria}
        >
          Clear search and filters
        </Button>
      </Stack>
    </Box>
  );
}

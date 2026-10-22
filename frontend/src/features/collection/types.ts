export type EsrbRating = "EC" | "E" | "E10+" | "T" | "M" | "AO" | "RP";

export interface Console {
  name: string;
}

export interface Game {
  id: number;
  title: string;
  originalReleaseYear: number;
  consoles: Console[];
  esrbRating?: EsrbRating | null;
  maxLocalMultiplayerPlayers?: number | null;
  coverImageUrl?: string | null;
  personalComments?: string | null;
}

export interface GamePage {
  items: Game[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface RawgPlatform {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
}

export interface RawgDeveloper {
  id: number;
  name: string;
  slug: string;
}

export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
}

export interface RawgRating {
  id: number;
  title: string;
  count: number;
  percent: number;
}

export interface RawgStore {
  id: number;
  name: string;
  slug: string;
  domain: string;
}

export interface RawgScreenshot {
  id: number;
  image: string;
}

export interface RawgEsrbRating {
  id: number;
  name: string;
  slug: string;
}

export interface RawgGameSearchResult {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  metacritic: number | null;
  platforms: Array<{ platform: RawgPlatform }>;
  genres: Array<{ genre: RawgGenre }>;
}

export interface RawgGameDetails {
  id: number;
  name: string;
  released: string | null;
  background_image: string | null;
  description_raw: string | null;
  metacritic: number | null;
  platforms: Array<{ platform: RawgPlatform }>;
  genres: Array<{ genre: RawgGenre }>;
  developers: Array<{ developer: RawgDeveloper }>;
  publishers: Array<{ publisher: RawgPublisher }>;
  ratings: RawgRating[];
  screenshots: RawgScreenshot[];
  stores: Array<{ store: RawgStore }>;
  esrb_rating: RawgEsrbRating | null;
  website: string | null;
  playtime: number;
}

export interface GameSearchResult {
  id: string;
  title: string;
  year: string;
  poster: string | null;
  metacritic: number | null;
  platforms: string[];
  genres: string[];
}

export interface GameDetails {
  id: string;
  title: string;
  year: string;
  poster: string | null;
  description: string | null;
  metacritic: number | null;
  platforms: string[];
  genres: string[];
  developers: string[];
  publishers: string[];
  ratings: RawgRating[];
  screenshots: string[];
  stores: string[];
  esrbRating: string | null;
  website: string | null;
  playtime: number;
}

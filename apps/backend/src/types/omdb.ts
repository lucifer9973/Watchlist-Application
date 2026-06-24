export type OmdbSearchItem = {
  Title: string;
  Year: string;
  imdbID: string;
  Type: "movie" | "series" | "episode";
  Poster: string;
};

export type SearchResult = {
  imdbID: string;
  title: string;
  year: string;
  type: string;
  poster: string | null;
};

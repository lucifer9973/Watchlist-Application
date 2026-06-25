export type BookSearchResult = {
  imdbId: string; // Using imdbId to match common UI requirements
  title: string;
  author: string | null;
  year: string | null;
  poster: string | null;
  type: "book";
};

export type BookDetails = {
  imdbId: string;
  title: string;
  author: string | null;
  year: string | null;
  poster: string | null;
  subjects: string[];
  description: string | null;
};

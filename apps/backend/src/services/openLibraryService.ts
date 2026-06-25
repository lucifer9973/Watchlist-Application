import { TtlCache } from "../utils/cache.js";
import { HttpError } from "../utils/httpError.js";
import type { BookSearchResult, BookDetails } from "../types/book.js";

export class OpenLibraryService {
  private readonly searchCache = new TtlCache<BookSearchResult[]>(1000 * 60 * 60);
  private readonly detailsCache = new TtlCache<BookDetails>(1000 * 60 * 60);
  private readonly authorCache = new TtlCache<string>(1000 * 60 * 60 * 24); // 24-hour cache for authors

  private readonly headers = {
    "User-Agent": "WatchlistApplication/1.0.0 (contact: developer@watchlistapp.local)",
    "Accept": "application/json"
  };

  private async fetchWithRetry(url: string, timeoutMs = 6000, maxRetries = 2): Promise<Response> {
    let delay = 1000;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: this.headers,
          signal: AbortSignal.timeout(timeoutMs)
        });
        if (response.ok) return response;
        // Don't retry on client errors (4xx) except 429 (rate limit)
        if (response.status >= 400 && response.status < 500 && response.status !== 429) {
          throw new HttpError(response.status, `HTTP error ${response.status}`);
        }
        if (response.status === 404) return response; // 404 is a terminal response, no need to retry
        if (attempt === maxRetries) {
          throw new HttpError(response.status, `HTTP error ${response.status}`);
        }
        console.warn(`Open Library request failed (attempt ${attempt}/${maxRetries}): ${response.status}`);
      } catch (error) {
        // Don't retry on AbortError (timeout) or network errors that are likely persistent
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            // Timeout - retry with backoff
            if (attempt === maxRetries) {
              throw new HttpError(504, "Open Library request timed out");
            }
            console.warn(`Open Library timeout (attempt ${attempt}/${maxRetries})`);
          } else if (error instanceof HttpError) {
            // Re-throw HTTP errors that we decided not to retry
            throw error;
          } else {
            // Other errors - retry once but not twice
            if (attempt === maxRetries) {
              throw new HttpError(502, "Open Library request failed");
            }
            console.warn(`Open Library network error (attempt ${attempt}/${maxRetries})`);
          }
        } else {
          if (attempt === maxRetries) {
            throw new HttpError(502, "Open Library request failed");
          }
          console.warn(`Open Library unknown error (attempt ${attempt}/${maxRetries})`);
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      }
    }
    throw new HttpError(502, "Request failed after maximum retries");
  }

  async search(query: string): Promise<BookSearchResult[]> {
    const normalizedQuery = query.trim();
    if (normalizedQuery.length < 3) return [];

    const cacheKey = normalizedQuery.toLowerCase();
    const cached = this.searchCache.get(cacheKey);
    if (cached) return cached;

    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(normalizedQuery)}&limit=15`;
      const response = await this.fetchWithRetry(url, 6000, 2);

      if (!response.ok) {
        throw new HttpError(response.status, "Open Library search request failed");
      }

      const data = await response.json() as any;

      if (!data || !data.docs) {
        return [];
      }

      const results: BookSearchResult[] = data.docs.map((doc: any) => {
        const workId = doc.key ? doc.key.replace("/works/", "") : "";
        return {
          imdbId: workId,
          title: doc.title,
          author: doc.author_name ? doc.author_name[0] : "Unknown Author",
          year: doc.first_publish_year ? String(doc.first_publish_year) : "N/A",
          poster: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : null,
          type: "book"
        };
      });

      this.searchCache.set(cacheKey, results);
      return results;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Open Library Search Error:", error);
      throw new HttpError(502, "Unable to reach Open Library search service");
    }
  }

  async getWorkDetails(workId: string): Promise<BookDetails> {
    const cleanWorkId = workId.trim().replace("/works/", "");
    const cached = this.detailsCache.get(cleanWorkId);
    if (cached) return cached;

    try {
      const response = await this.fetchWithRetry(`https://openlibrary.org/works/${cleanWorkId}.json`, 8000, 2);

      if (response.status === 404) {
        throw new HttpError(404, "Book details not found");
      }
      if (!response.ok) {
        throw new HttpError(response.status, "Open Library details request failed");
      }

      const data = await response.json() as any;

      // Resolve author name
      let authorName = "Unknown Author";
      if (data.authors && data.authors.length > 0) {
        const authorLink = data.authors[0].author.key;
        const cleanAuthorId = authorLink.replace("/authors/", "");
        
        const cachedAuthor = this.authorCache.get(cleanAuthorId);
        if (cachedAuthor) {
          authorName = cachedAuthor;
        } else {
          try {
            const authorRes = await this.fetchWithRetry(`https://openlibrary.org/authors/${cleanAuthorId}.json`, 4000, 1);
            if (authorRes.ok) {
              const authorData = await authorRes.json() as any;
              if (authorData && authorData.name) {
                authorName = authorData.name;
                this.authorCache.set(cleanAuthorId, authorName);
              }
            }
          } catch (authorErr) {
            console.error("Error fetching author details:", authorErr);
          }
        }
      }

      // Extract description
      let description = "No description available.";
      if (data.description) {
        if (typeof data.description === "string") {
          description = data.description;
        } else if (typeof data.description === "object" && data.description.value) {
          description = data.description.value;
        }
      }

      const details: BookDetails = {
        imdbId: cleanWorkId,
        title: data.title,
        author: authorName,
        year: data.first_publish_date ? String(data.first_publish_date) : "N/A",
        poster: data.covers && data.covers.length > 0 ? `https://covers.openlibrary.org/b/id/${data.covers[0]}-L.jpg` : null,
        subjects: data.subjects ? data.subjects.slice(0, 8) : [],
        description
      };

      this.detailsCache.set(cleanWorkId, details);
      return details;
    } catch (error) {
      if (error instanceof HttpError) throw error;
      console.error("Open Library Work Details Error:", error);
      throw new HttpError(502, "Unable to reach Open Library details service");
    }
  }
}

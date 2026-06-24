# Movie & Shows Watchlist

Framekeep is a full-stack watchlist application for searching OMDb movies and TV shows, saving titles, tracking watched status, adding ratings and notes, and viewing dashboard insights.

## Features

- Debounced OMDb search for movies and TV shows
- Add titles as `WATCHED` or `WANT_TO_WATCH`
- Edit status, personal rating, and notes
- Delete watchlist entries
- Filter by status, sort by title/year/recently added, and search inside the watchlist
- Dashboard cards for totals plus Recharts pie and bar charts
- Layered Express architecture with Zod validation and centralized error handling
- PostgreSQL persistence through Prisma ORM
- Jest, Supertest, and React Testing Library tests
- Docker Compose support for frontend, backend, and PostgreSQL

## Tech Stack

Frontend: React 18, TypeScript, Vite, TanStack Query, Tailwind CSS, shadcn-style UI primitives, Recharts, Axios.

Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, Zod.

Testing: Jest, React Testing Library, Supertest.

## Project Structure

```text
.
├── apps
│   ├── backend
│   │   ├── prisma
│   │   ├── src
│   │   │   ├── config
│   │   │   ├── controllers
│   │   │   ├── middleware
│   │   │   ├── repositories
│   │   │   ├── routes
│   │   │   ├── services
│   │   │   ├── types
│   │   │   ├── utils
│   │   │   └── validators
│   │   └── tests
│   └── frontend
│       └── src
│           ├── api
│           ├── components
│           ├── hooks
│           ├── pages
│           ├── routes
│           └── types
├── docker-compose.yml
└── package.json
```

## Environment Variables

Backend `apps/backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/watchlist?schema=public
OMDB_API_KEY=your_api_key
```

Frontend `apps/frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Installation

```bash
npm install
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
npm run db:generate --workspace apps/backend
npm run db:migrate --workspace apps/backend
```

Start PostgreSQL locally before running migrations, or use Docker Compose.

## Running

Run both apps in development:

```bash
npm run dev
```

Run individually:

```bash
npm run dev --workspace apps/backend
npm run dev --workspace apps/frontend
```

Frontend runs on `http://localhost:5173`; backend runs on `http://localhost:5000`.

## Docker

Set an OMDb key and start everything:

```bash
$env:OMDB_API_KEY="your_api_key"
docker compose up --build
```

The frontend is available at `http://localhost:5173`, the API at `http://localhost:5000`, and PostgreSQL at `localhost:5432`.

## Tests

```bash
npm run test --workspace apps/backend
npm run test --workspace apps/frontend
npm run test
```

## API Documentation

### Health

`GET /health`

```json
{ "status": "ok" }
```

### Search

`GET /api/search?q=breaking`

```json
[
  {
    "imdbID": "tt0903747",
    "title": "Breaking Bad",
    "year": "2008-2013",
    "type": "series",
    "poster": "https://example.com/poster.jpg"
  }
]
```

### Get Watchlist

`GET /api/watchlist?status=WATCHED&sortBy=title&sortOrder=asc&search=break`

```json
[
  {
    "id": "uuid",
    "imdbId": "tt0903747",
    "title": "Breaking Bad",
    "year": "2008-2013",
    "type": "series",
    "poster": null,
    "status": "WATCHED",
    "rating": 10,
    "notes": "Favorite show",
    "createdAt": "2026-06-24T00:00:00.000Z",
    "updatedAt": "2026-06-24T00:00:00.000Z"
  }
]
```

### Create Watchlist Item

`POST /api/watchlist`

```json
{
  "imdbId": "tt0903747",
  "title": "Breaking Bad",
  "year": "2008-2013",
  "type": "series",
  "poster": null,
  "status": "WATCHED",
  "rating": 10,
  "notes": "Favorite show"
}
```

### Update Watchlist Item

`PUT /api/watchlist/:id`

```json
{
  "status": "WANT_TO_WATCH",
  "rating": 8,
  "notes": "Rewatch later"
}
```

### Delete Watchlist Item

`DELETE /api/watchlist/:id`

Returns `204 No Content`.

### Dashboard Stats

`GET /api/dashboard/stats`

```json
{
  "total": 15,
  "watched": 10,
  "wantToWatch": 5,
  "movies": 8,
  "shows": 7
}
```

### Error Format

```json
{
  "success": false,
  "message": "Something went wrong"
}
```

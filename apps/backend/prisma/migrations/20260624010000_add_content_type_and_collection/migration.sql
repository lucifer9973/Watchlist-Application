-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('MOVIE', 'TV_SHOW', 'BOOK', 'GAME');

-- AlterTable
ALTER TABLE "WatchlistItem" ADD COLUMN     "contentType" "ContentType" NOT NULL DEFAULT 'MOVIE';

-- Add optional collection tag
ALTER TABLE "WatchlistItem" ADD COLUMN     "collection" TEXT;

-- Backfill contentType based on existing `type` column
UPDATE "WatchlistItem"
SET "contentType" = 'TV_SHOW'
WHERE "type" = 'series';

UPDATE "WatchlistItem"
SET "contentType" = 'MOVIE'
WHERE "type" = 'movie';


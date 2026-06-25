-- Safe-guard: backfill externalId for any items that might still have it null
UPDATE "WatchlistItem" SET "externalId" = "imdbId" WHERE "externalId" IS NULL AND "imdbId" IS NOT NULL;
UPDATE "WatchlistItem" SET "externalId" = "id" WHERE "externalId" IS NULL;

-- DropIndex
DROP INDEX IF EXISTS "WatchlistItem_imdbId_key";

-- DropIndex
DROP INDEX IF EXISTS "WatchlistItem_source_externalId_idx";

-- AlterTable
ALTER TABLE "WatchlistItem" ALTER COLUMN "externalId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_source_externalId_key" ON "WatchlistItem"("source", "externalId");

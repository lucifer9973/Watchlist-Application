-- AlterTable to add columns and allow NULL on imdbId
ALTER TABLE "WatchlistItem" ADD COLUMN "externalId" TEXT;
ALTER TABLE "WatchlistItem" ADD COLUMN "source" TEXT NOT NULL DEFAULT 'OMDB';
ALTER TABLE "WatchlistItem" ALTER COLUMN "imdbId" DROP NOT NULL;

-- 1. Create a clean enum type with the new values.
CREATE TYPE "WatchStatus_new" AS ENUM ('PLANNED', 'COMPLETED');

-- 2. Alter table to use the new status type with explicit casts.
ALTER TABLE "WatchlistItem" ALTER COLUMN "status" TYPE "WatchStatus_new" 
  USING (
    CASE "status"::text
      WHEN 'WATCHED' THEN 'COMPLETED'::"WatchStatus_new"
      WHEN 'WANT_TO_WATCH' THEN 'PLANNED'::"WatchStatus_new"
      ELSE 'PLANNED'::"WatchStatus_new"
    END
  );

-- 3. Drop the old enum type.
DROP TYPE "WatchStatus";

-- 4. Rename the new type to the expected name.
ALTER TYPE "WatchStatus_new" RENAME TO "WatchStatus";

-- 5. Backfill externalId for existing OMDB records
UPDATE "WatchlistItem" SET "externalId" = "imdbId" WHERE "source" = 'OMDB' AND "imdbId" IS NOT NULL;

-- 6. CreateIndex
CREATE INDEX "WatchlistItem_source_externalId_idx" ON "WatchlistItem"("source", "externalId");

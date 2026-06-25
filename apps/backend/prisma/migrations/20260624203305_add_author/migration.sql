-- AlterTable
ALTER TABLE "WatchlistItem" ADD COLUMN     "author" VARCHAR(255);

-- CreateIndex
CREATE INDEX "WatchlistItem_contentType_idx" ON "WatchlistItem"("contentType");

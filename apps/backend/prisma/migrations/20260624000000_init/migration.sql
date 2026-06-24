-- CreateEnum
CREATE TYPE "WatchStatus" AS ENUM ('WATCHED', 'WANT_TO_WATCH');

-- CreateTable
CREATE TABLE "WatchlistItem" (
    "id" TEXT NOT NULL,
    "imdbId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "poster" TEXT,
    "status" "WatchStatus" NOT NULL,
    "rating" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WatchlistItem_imdbId_key" ON "WatchlistItem"("imdbId");

-- CreateIndex
CREATE INDEX "WatchlistItem_status_idx" ON "WatchlistItem"("status");

-- CreateIndex
CREATE INDEX "WatchlistItem_title_idx" ON "WatchlistItem"("title");

-- CreateIndex
CREATE INDEX "WatchlistItem_type_idx" ON "WatchlistItem"("type");
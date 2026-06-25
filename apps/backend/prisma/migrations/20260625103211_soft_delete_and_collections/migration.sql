-- AlterEnum
ALTER TYPE "WatchStatus" ADD VALUE 'WATCHING';

-- AlterTable
ALTER TABLE "WatchlistItem" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "favorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Collection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Collection_name_key" ON "Collection"("name");

-- CreateIndex
CREATE INDEX "WatchlistItem_deletedAt_idx" ON "WatchlistItem"("deletedAt");

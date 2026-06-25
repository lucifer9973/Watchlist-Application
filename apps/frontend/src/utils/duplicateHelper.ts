export const findLibraryItem = <T extends { source: string; externalId: string | null; deletedAt?: string | null | Date }>(
  source: string | null | undefined,
  externalId: string | null | undefined,
  watchlist: T[] | undefined
): T | null => {
  if (!watchlist || !source || !externalId) return null;
  const src = String(source).trim();
  const ext = String(externalId).trim();
  if (!src || !ext) return null;

  return watchlist.find((item) => {
    const itemSrc = item.source ? String(item.source).trim() : "";
    const itemExt = item.externalId ? String(item.externalId).trim() : "";
    const isDeleted = item.deletedAt !== null && item.deletedAt !== undefined;
    return itemSrc === src && itemExt === ext && !isDeleted;
  }) ?? null;
};

export const isAlreadyInLibrary = (
  source: string | null | undefined,
  externalId: string | null | undefined,
  watchlist: Array<{ source: string; externalId: string | null }> | undefined
): boolean => {
  return findLibraryItem(source, externalId, watchlist) !== null;
};

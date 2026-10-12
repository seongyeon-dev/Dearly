const FAVORITES_STORAGE_KEY = "dearly-favorite-products";

export function getFavoriteIds(): number[] {
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is number =>
        typeof id === "number" && Number.isSafeInteger(id) && id > 0,
    );
  } catch {
    return [];
  }
}

export function isFavorite(productId: number): boolean {
  return getFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: number): boolean {
  if (!Number.isSafeInteger(productId) || productId <= 0) {
    return false;
  }

  const favorites = getFavoriteIds();
  const wasFavorite = favorites.includes(productId);

  const updatedFavorites = wasFavorite
    ? favorites.filter((id) => id !== productId)
    : [...favorites, productId];

  try {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(updatedFavorites),
    );

    window.dispatchEvent(new Event("dearly-favorites-updated"));

    return !wasFavorite;
  } catch {
    throw new Error("관심 상품 저장에 실패했습니다.");
  }
}

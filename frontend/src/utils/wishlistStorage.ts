import { products } from "../data/products";
import type { Wish } from "../types/wish";

const STORAGE_KEY = "dearly-custom-products";
const NEXT_ID_KEY = "dearly-next-product-id";

export const getCustomProducts = (): Wish[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return [];

    const parsed: unknown = JSON.parse(saved);

    return Array.isArray(parsed) ? (parsed as Wish[]) : [];
  } catch {
    return [];
  }
};

export const getWishlistProducts = (): Wish[] => {
  return [...products, ...getCustomProducts()];
};

export const saveWishlistProduct = (product: Omit<Wish, "id">): Wish => {
  const customProducts = getCustomProducts();

  const highestId = Math.max(
    0,
    ...products.map((item) => item.id),
    ...customProducts.map((item) => item.id),
  );

  const savedNextId = Number(localStorage.getItem(NEXT_ID_KEY));

  const newId = Math.max(
    highestId + 1,
    Number.isInteger(savedNextId) && savedNextId > 0 ? savedNextId : 1,
  );

  const newProduct: Wish = {
    id: newId,
    ...product,
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify([...customProducts, newProduct]),
  );

  localStorage.setItem(NEXT_ID_KEY, String(newId + 1));

  return newProduct;
};

import { products } from "../data/products";
import type { Wish } from "../types/wish";

const STORAGE_KEY = "dearly-custom-products";
const NEXT_ID_KEY = "dearly-next-product-id";

type StoredProductDetail = {
  details?: {
    expectedPrice?: string | number;
  };
};

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

const getUpdatedPrice = (productId: number, originalPrice: string): string => {
  try {
    const saved = localStorage.getItem(`dearly-product-detail-${productId}`);

    if (!saved) {
      return originalPrice;
    }

    const parsed = JSON.parse(saved) as StoredProductDetail;

    const updatedPrice = parsed?.details?.expectedPrice;

    if (
      updatedPrice === undefined ||
      updatedPrice === null ||
      String(updatedPrice).trim() === ""
    ) {
      return originalPrice;
    }

    const price = Number(updatedPrice);

    if (!Number.isSafeInteger(price) || price < 0) {
      return originalPrice;
    }

    return `${price.toLocaleString("ko-KR")}원`;
  } catch {
    return originalPrice;
  }
};

export const getWishlistProducts = (): Wish[] => {
  const allProducts = [...products, ...getCustomProducts()];

  return allProducts.map((product) => ({
    ...product,
    price: getUpdatedPrice(product.id, product.price),
  }));
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

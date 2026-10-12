import type { PurchaseRecord } from "../types/purchase";

const STORAGE_KEY = "dearly-purchases";

export function getPurchases(): PurchaseRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (item): item is PurchaseRecord =>
        typeof item === "object" &&
        item !== null &&
        typeof item.wishId === "number" &&
        typeof item.name === "string" &&
        typeof item.category === "string" &&
        typeof item.amount === "number" &&
        Number.isFinite(item.amount) &&
        item.amount >= 0 &&
        typeof item.date === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(item.date) &&
        typeof item.store === "string" &&
        typeof item.memo === "string",
    );
  } catch {
    return [];
  }
}

export function savePurchase(purchase: PurchaseRecord): boolean {
  try {
    const purchases = getPurchases();

    const existingIndex = purchases.findIndex(
      (item) => item.wishId === purchase.wishId,
    );

    if (existingIndex >= 0) {
      purchases[existingIndex] = purchase;
    } else {
      purchases.push(purchase);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));

    return true;
  } catch {
    return false;
  }
}

export function deletePurchase(wishId: number): boolean {
  try {
    const purchases = getPurchases();

    const updatedPurchases = purchases.filter((item) => item.wishId !== wishId);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPurchases));

    return true;
  } catch {
    return false;
  }
}

export function getMonthlyPurchases(month: string): PurchaseRecord[] {
  return getPurchases().filter(
    (purchase) => purchase.date.slice(0, 7) === month,
  );
}

export function getMonthlyTotal(month: string): number {
  return getMonthlyPurchases(month).reduce(
    (total, purchase) => total + purchase.amount,
    0,
  );
}

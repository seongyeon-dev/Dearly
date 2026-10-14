export interface PurchaseResponse {
  purchase_id: number;
  wish_id: number;
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

export interface CreatePurchaseRequest {
  wish_id: number;
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

export interface UpdatePurchaseRequest {
  amount: number;
  purchased_at: string;
  store: string | null;
  memo: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_URL = `${API_BASE_URL}/api/purchases`;

export async function fetchPurchases(): Promise<PurchaseResponse[]> {
  const response = await fetch(API_URL, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("구매 기록 목록 조회에 실패했습니다.");
  }

  return (await response.json()) as PurchaseResponse[];
}

export async function createPurchase(
  data: CreatePurchaseRequest,
): Promise<PurchaseResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("구매 기록 등록에 실패했습니다.");
  }

  return (await response.json()) as PurchaseResponse;
}

export async function fetchPurchaseByWishId(
  wishId: number,
): Promise<PurchaseResponse | null> {
  const response = await fetch(`${API_URL}/wish/${wishId}`, {
    credentials: "include",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("구매 기록 조회에 실패했습니다.");
  }

  return (await response.json()) as PurchaseResponse;
}

export async function updatePurchase(
  wishId: number,
  data: UpdatePurchaseRequest,
): Promise<PurchaseResponse> {
  const response = await fetch(`${API_URL}/wish/${wishId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("구매 기록 수정에 실패했습니다.");
  }

  return (await response.json()) as PurchaseResponse;
}

export async function deletePurchase(wishId: number): Promise<void> {
  const response = await fetch(`${API_URL}/wish/${wishId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("구매 기록 삭제에 실패했습니다.");
  }
}

export type WishCategory = "BEAUTY" | "FASHION" | "LIFESTYLE" | "OTHER";

export type WishStatus = "WANT" | "CONSIDERING" | "BOUGHT";

export interface WishResponse {
  wish_id: number;
  user_id: number;
  name: string;
  category: WishCategory;
  status: WishStatus;
  expected_price: number;
  is_favorite: number | boolean;
  created_at: string;
}

export interface WishDetailResponse extends WishResponse {
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface CreateWishRequest {
  name: string;
  category: WishCategory;
  status: WishStatus;
  expected_price: number;
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface CreateWishResponse extends CreateWishRequest {
  wish_id: number;
}

export interface UpdateWishRequest {
  name?: string;
  category?: WishCategory;
  expected_price?: number;
  planned_date?: string | null;
  purchase_link?: string | null;
  memo?: string | null;
  status?: WishStatus;
  is_favorite?: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_URL = `${API_BASE_URL}/api/wishes`;

export async function fetchWishes(): Promise<WishResponse[]> {
  const response = await fetch(API_URL, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("위시리스트 조회에 실패했습니다.");
  }

  return (await response.json()) as WishResponse[];
}

export async function fetchWishById(
  wishId: number,
): Promise<WishDetailResponse> {
  const response = await fetch(`${API_URL}/${wishId}`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("상품 상세 조회에 실패했습니다.");
  }

  return (await response.json()) as WishDetailResponse;
}

export async function createWish(
  data: CreateWishRequest,
): Promise<CreateWishResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("상품 등록에 실패했습니다.");
  }

  return (await response.json()) as CreateWishResponse;
}

export async function updateWish(
  wishId: number,
  data: UpdateWishRequest,
): Promise<WishDetailResponse> {
  const response = await fetch(`${API_URL}/${wishId}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("상품 수정에 실패했습니다.");
  }

  return (await response.json()) as WishDetailResponse;
}

export async function deleteWish(wishId: number): Promise<void> {
  const response = await fetch(`${API_URL}/${wishId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("상품 삭제에 실패했습니다.");
  }
}

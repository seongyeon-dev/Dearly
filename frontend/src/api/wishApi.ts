export interface WishResponse {
  wish_id: number;
  user_id: number;
  name: string;
  category: "BEAUTY" | "FASHION" | "LIFESTYLE" | "OTHER";
  status: "WANT" | "CONSIDERING" | "BOUGHT";
  expected_price: number;
  is_favorite: number | boolean;
}

export interface WishDetailResponse extends WishResponse {
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface CreateWishRequest {
  name: string;
  category: "BEAUTY" | "FASHION" | "LIFESTYLE" | "OTHER";
  status: "WANT" | "CONSIDERING" | "BOUGHT";
  expected_price: number;
  planned_date: string | null;
  purchase_link: string | null;
  memo: string | null;
}

export interface CreateWishResponse extends CreateWishRequest {
  wish_id: number;
}

export interface UpdateWishRequest {
  expected_price?: number;
  planned_date?: string | null;
  purchase_link?: string | null;
  memo?: string | null;
  status?: "WANT" | "CONSIDERING" | "BOUGHT";
}

export async function fetchWishes(): Promise<WishResponse[]> {
  const response = await fetch("http://localhost:3000/api/wishes");

  if (!response.ok) {
    throw new Error("위시리스트 조회에 실패했습니다.");
  }

  return (await response.json()) as WishResponse[];
}

export async function fetchWishById(
  wishId: number,
): Promise<WishDetailResponse> {
  const response = await fetch(`http://localhost:3000/api/wishes/${wishId}`);

  if (!response.ok) {
    throw new Error("상품 상세 조회에 실패했습니다.");
  }

  return (await response.json()) as WishDetailResponse;
}

export async function createWish(
  data: CreateWishRequest,
): Promise<CreateWishResponse> {
  const response = await fetch("http://localhost:3000/api/wishes", {
    method: "POST",
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
  const response = await fetch(`http://localhost:3000/api/wishes/${wishId}`, {
    method: "PATCH",
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
  const response = await fetch(`http://localhost:3000/api/wishes/${wishId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("상품 삭제에 실패했습니다.");
  }
}

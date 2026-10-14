
const SERVER_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:3000"
).replace(/\/$/, "");

const API_BASE_URL = `${
  import.meta.env.PROD ? "" : SERVER_BASE_URL
}/api/wishes`;

export interface WishImageResponse {
  image_id: number;
  wish_id: number;
  image_url: string;
  sort_order: number;
  created_at: string;
}

export interface WishImagesResponse {
  images: WishImageResponse[];
}

export interface UploadWishImageResponse {
  message: string;
  image_id: number;
  image_url: string;
  sort_order: number;
}

export interface DeleteWishImageResponse {
  message: string;
}

export async function fetchWishImages(
  wishId: number,
): Promise<WishImageResponse[]> {
  const response = await fetch(`${API_BASE_URL}/${wishId}/images`, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("상품 이미지 조회에 실패했습니다.");
  }

  const data = (await response.json()) as WishImagesResponse;

  return data.images;
}

export async function uploadWishImage(
  wishId: number,
  file: File,
  sortOrder: number,
): Promise<UploadWishImageResponse> {
  const formData = new FormData();

  formData.append("image", file);
  formData.append("sort_order", String(sortOrder));

  const response = await fetch(`${API_BASE_URL}/${wishId}/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("상품 이미지 업로드에 실패했습니다.");
  }

  return (await response.json()) as UploadWishImageResponse;
}

export async function deleteWishImage(
  wishId: number,
  imageId: number,
): Promise<void> {
  const response = await fetch(
    `${API_BASE_URL}/${wishId}/images/${imageId}`,
    {
      method: "DELETE",
      credentials: "include",
    },
  );

  if (!response.ok) {
    throw new Error("상품 이미지 삭제에 실패했습니다.");
  }
}

export function getWishImageUrl(imageUrl: string): string {
  if (
    imageUrl.startsWith("http://") ||
    imageUrl.startsWith("https://")
  ) {
    return imageUrl;
  }

  return `${SERVER_BASE_URL}${
    imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
  }`;
}

import { useEffect, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";

import type { WishStatus, WishStatusClass } from "../../types/wish";
import { fetchWishImages, getWishImageUrl } from "../../api/wishImageApi";

import "./WishlistCard.css";

type WishlistCardProps = {
  productId?: number;
  image?: string;
  imageUrl?: string | null;
  name: string;
  price: string;
  status: WishStatus;
  statusClass: WishStatusClass;
  isFavorite?: boolean;
  onFavoriteToggle?: (productId: number) => void | Promise<void>;
  favoriteLoading?: boolean;
};

function WishlistCard({
  productId,
  image,
  imageUrl,
  name,
  price,
  status,
  statusClass,
  isFavorite = false,
  onFavoriteToggle,
  favoriteLoading = false,
}: WishlistCardProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  useEffect(() => {
    if (imageUrl || productId === undefined) {
      setUploadedImage(null);
      return;
    }

    let cancelled = false;

    setUploadedImage(null);

    const loadImage = async () => {
      try {
        const images = await fetchWishImages(productId);

        if (cancelled) return;

        if (images.length === 0) {
          setUploadedImage(null);
          return;
        }

        const sortedImages = [...images].sort(
          (a, b) => a.sort_order - b.sort_order,
        );

        const firstImage = sortedImages[0];

        setUploadedImage(getWishImageUrl(firstImage.image_url));
      } catch (error) {
        if (cancelled) return;

        console.error("상품 이미지 불러오기 실패:", error);
        setUploadedImage(null);
      }
    };

    void loadImage();

    return () => {
      cancelled = true;
    };
  }, [productId, imageUrl]);

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (productId === undefined || !onFavoriteToggle || favoriteLoading) {
      return;
    }

    void onFavoriteToggle(productId);
  };

  const displayImage = imageUrl || uploadedImage || image;

  return (
    <article className="wishlist-card">
      <div className="wishlist-image">
        {displayImage ? (
          <img src={displayImage} alt={name} />
        ) : (
          <span className="image-placeholder">이미지</span>
        )}

        <button
          type="button"
          className={`heart-button ${isFavorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          disabled={
            productId === undefined || !onFavoriteToggle || favoriteLoading
          }
          aria-label={isFavorite ? "관심 상품 해제" : "관심 상품 등록"}
          aria-pressed={isFavorite}
        >
          <Heart
            className="heart-icon"
            size={18}
            strokeWidth={1.5}
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="wishlist-info">
        <h3>{name}</h3>

        <strong>{price}</strong>

        <span className={`wishlist-status ${statusClass}`}>{status} ›</span>
      </div>
    </article>
  );
}

export default WishlistCard;

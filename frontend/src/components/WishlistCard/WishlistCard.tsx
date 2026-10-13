import { useEffect, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";

import type { WishStatus, WishStatusClass } from "../../types/wish";
import { isFavorite, toggleFavorite } from "../../utils/favoriteStorage";
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
};

function WishlistCard({
  productId,
  image,
  imageUrl,
  name,
  price,
  status,
  statusClass,
}: WishlistCardProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const [favorite, setFavorite] = useState(() =>
    productId !== undefined ? isFavorite(productId) : false,
  );

  useEffect(() => {
    if (imageUrl) {
      setUploadedImage(null);
      return;
    }

    if (productId === undefined) {
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

  useEffect(() => {
    const updateFavorite = () => {
      setFavorite(productId !== undefined ? isFavorite(productId) : false);
    };

    updateFavorite();

    window.addEventListener("dearly-favorites-updated", updateFavorite);
    window.addEventListener("storage", updateFavorite);

    return () => {
      window.removeEventListener("dearly-favorites-updated", updateFavorite);
      window.removeEventListener("storage", updateFavorite);
    };
  }, [productId]);

  const handleFavoriteClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (productId === undefined) {
      return;
    }

    try {
      const updatedFavorite = toggleFavorite(productId);
      setFavorite(updatedFavorite);
    } catch (error) {
      console.error("관심 상품 저장 실패:", error);
      alert("관심 상품 저장에 실패했습니다.");
    }
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
          className={`heart-button ${favorite ? "active" : ""}`}
          onClick={handleFavoriteClick}
          disabled={productId === undefined}
          aria-label={favorite ? "관심 상품 해제" : "관심 상품 등록"}
          aria-pressed={favorite}
        >
          <Heart
            className="heart-icon"
            size={18}
            strokeWidth={1.5}
            fill={favorite ? "currentColor" : "none"}
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

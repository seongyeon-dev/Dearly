import { useEffect, useState, type MouseEvent } from "react";
import { Heart } from "lucide-react";

import type { WishStatus, WishStatusClass } from "../../types/wish";
import { isFavorite, toggleFavorite } from "../../utils/favoriteStorage";

import "./WishlistCard.css";

type WishlistCardProps = {
  productId?: number;
  image?: string;
  name: string;
  price: string;
  status: WishStatus;
  statusClass: WishStatusClass;
};

function loadProductImage(productId: number): Promise<File | null> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 2);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }

      if (!database.objectStoreNames.contains("profiles")) {
        database.createObjectStore("profiles");
      }
    };

    request.onerror = () => {
      reject(new Error("이미지 데이터베이스를 열 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;
      const transaction = database.transaction("products", "readonly");
      const store = transaction.objectStore("products");
      const getRequest = store.get(productId);

      getRequest.onsuccess = () => {
        const result: unknown = getRequest.result;

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0] instanceof File
        ) {
          resolve(result[0]);
        } else {
          resolve(null);
        }
      };

      getRequest.onerror = () => {
        reject(new Error("상품 이미지를 읽을 수 없습니다."));
      };

      transaction.oncomplete = () => {
        database.close();
      };

      transaction.onerror = () => {
        database.close();
        reject(new Error("이미지 조회에 실패했습니다."));
      };
    };
  });
}

function WishlistCard({
  productId,
  image,
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
    if (productId === undefined) {
      return;
    }

    let cancelled = false;
    let imageUrl: string | null = null;

    const loadImage = async () => {
      try {
        const file = await loadProductImage(productId);

        if (cancelled || !file) {
          return;
        }

        imageUrl = URL.createObjectURL(file);
        setUploadedImage(imageUrl);
      } catch (error) {
        console.error("상품 이미지 불러오기 실패:", error);
      }
    };

    void loadImage();

    return () => {
      cancelled = true;

      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [productId]);

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

  const displayImage = uploadedImage ?? image;

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

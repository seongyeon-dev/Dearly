import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import type { Purchase } from "../../../types/purchase";

import "./PurchaseItem.css";

type PurchaseItemProps = Purchase & {
  image?: string;
};

function PurchaseItem({
  wishId,
  image,
  name,
  category,
  date,
  price,
}: PurchaseItemProps) {
  const navigate = useNavigate();

  const [productImage, setProductImage] = useState<string | null>(
    image ?? null,
  );

  useEffect(() => {
    let isActive = true;
    let objectUrl: string | null = null;
    let database: IDBDatabase | null = null;

    setProductImage(image ?? null);

    const request = indexedDB.open("dearly-images", 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products");
      }
    };

    request.onsuccess = () => {
      database = request.result;

      if (!isActive) {
        database.close();
        return;
      }

      const transaction = database.transaction("products", "readonly");

      const store = transaction.objectStore("products");
      const getRequest = store.get(wishId);

      getRequest.onsuccess = () => {
        if (!isActive) return;

        const images = getRequest.result;

        if (
          Array.isArray(images) &&
          images.length > 0 &&
          images[0] instanceof Blob
        ) {
          objectUrl = URL.createObjectURL(images[0]);
          setProductImage(objectUrl);
        }
      };

      transaction.oncomplete = () => {
        database?.close();
        database = null;
      };

      transaction.onerror = () => {
        database?.close();
        database = null;
      };
    };

    request.onerror = () => {
      console.error("상품 이미지를 불러오지 못했습니다.");
    };

    return () => {
      isActive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      database?.close();
    };
  }, [wishId, image]);

  const handleClick = () => {
    navigate(`/wishlist/${wishId}`);
  };

  return (
    <button type="button" className="purchase-item" onClick={handleClick}>
      <div className="purchase-image">
        {productImage ? (
          <img src={productImage} alt={name} />
        ) : (
          <span>이미지</span>
        )}
      </div>

      <div className="purchase-info">
        <h3>{name}</h3>

        <div className="purchase-meta">
          <span>{category}</span>
          <span className="purchase-divider">|</span>
          <span>{date}</span>
        </div>
      </div>

      <strong className="purchase-price">{price}</strong>
    </button>
  );
}

export default PurchaseItem;

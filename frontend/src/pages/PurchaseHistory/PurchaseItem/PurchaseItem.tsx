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

    const request = indexedDB.open("dearly-images", 2);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains("products")) {
        db.createObjectStore("products");
      }

      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles");
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      database = db;

      if (!isActive) {
        db.close();
        database = null;
        return;
      }

      if (!db.objectStoreNames.contains("products")) {
        console.error("상품 이미지 저장소가 없습니다.");
        db.close();
        database = null;
        return;
      }

      const transaction = db.transaction("products", "readonly");
      const store = transaction.objectStore("products");
      const getRequest = store.get(wishId);

      getRequest.onsuccess = () => {
        if (!isActive) {
          return;
        }

        const result: unknown = getRequest.result;

        if (
          Array.isArray(result) &&
          result.length > 0 &&
          result[0] instanceof Blob
        ) {
          objectUrl = URL.createObjectURL(result[0]);
          setProductImage(objectUrl);
        }
      };

      getRequest.onerror = () => {
        console.error("상품 이미지 조회에 실패했습니다.");
      };

      transaction.oncomplete = () => {
        db.close();

        if (database === db) {
          database = null;
        }
      };

      transaction.onerror = () => {
        console.error("상품 이미지 트랜잭션 오류");
        db.close();

        if (database === db) {
          database = null;
        }
      };
    };

    request.onerror = () => {
      console.error(
        "상품 이미지 데이터베이스를 열지 못했습니다.",
        request.error,
      );
    };

    return () => {
      isActive = false;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }

      if (database) {
        database.close();
        database = null;
      }
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

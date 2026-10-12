import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  WishCategory,
  WishStatus,
  WishStatusClass,
} from "../../../types/wish";
import { saveWishlistProduct } from "../../../utils/wishlistStorage";

import "./ProductForm.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

type ProductFormProps = {
  images: File[];
};

const statusMap: Record<
  ProductStatus,
  { status: WishStatus; statusClass: WishStatusClass }
> = {
  WANT: {
    status: "사고 싶어요",
    statusClass: "want",
  },
  CONSIDERING: {
    status: "고민 중",
    statusClass: "considering",
  },
  BOUGHT: {
    status: "샀어요",
    statusClass: "bought",
  },
};

function saveProductImages(productId: number, images: File[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }
    };

    request.onerror = () => {
      reject(new Error("이미지 데이터베이스를 열 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;

      const transaction = database.transaction("products", "readwrite");

      const store = transaction.objectStore("products");

      store.put(images, productId);

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(new Error("이미지 저장에 실패했습니다."));
      };

      transaction.onabort = () => {
        database.close();
        reject(new Error("이미지 저장이 취소되었습니다."));
      };
    };
  });
}

function ProductForm({ images }: ProductFormProps) {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState<WishCategory>("BEAUTY");
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState<ProductStatus>("WANT");
  const [plannedDate, setPlannedDate] = useState("");
  const [purchaseLink, setPurchaseLink] = useState("");
  const [memo, setMemo] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    if (isSaving) {
      return;
    }

    const numericPrice = Number(price);

    if (!name.trim()) {
      alert("상품명을 입력해주세요.");
      return;
    }

    if (
      !price.trim() ||
      !Number.isSafeInteger(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("올바른 가격을 입력해주세요.");
      return;
    }

    if (purchaseLink.trim()) {
      try {
        const url = new URL(purchaseLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        alert("구매 링크는 http:// 또는 https:// 주소로 입력해주세요.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const savedProduct = saveWishlistProduct({
        name: name.trim(),
        category,
        price: `${numericPrice.toLocaleString("ko-KR")}원`,
        status: statusMap[status].status,
        statusClass: statusMap[status].statusClass,
      });

      const productDetails = {
        plannedDate,
        expectedPrice: numericPrice,
        purchaseLink: purchaseLink.trim(),
        memo,
      };

      localStorage.setItem(
        `dearly-product-detail-${savedProduct.id}`,
        JSON.stringify({
          details: productDetails,
          status,
          purchaseData: null,
        }),
      );

      if (images.length > 0) {
        await saveProductImages(savedProduct.id, images);
      }

      alert("상품이 추가되었습니다!");
      navigate("/wishlist");
    } catch (error) {
      console.error("상품 등록 실패:", error);
      alert("상품 저장 중 문제가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="product-form">
      <div className="form-field">
        <label>
          상품명 <span>*</span>
        </label>

        <input
          type="text"
          placeholder="상품명을 입력하세요."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="form-field">
        <label>
          카테고리 <span>*</span>
        </label>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as WishCategory)}
        >
          <option value="BEAUTY">뷰티</option>
          <option value="FASHION">패션</option>
          <option value="LIFESTYLE">라이프스타일</option>
          <option value="OTHER">기타</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>
            예상 가격 <span>*</span>
          </label>

          <div className="price-input">
            <input
              type="number"
              min="1"
              step="1"
              placeholder="금액을 입력하세요."
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />

            <span>원</span>
          </div>
        </div>

        <div className="form-field">
          <label>
            상태 <span>*</span>
          </label>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
          >
            <option value="WANT">사고 싶어요</option>
            <option value="CONSIDERING">고민 중</option>
            <option value="BOUGHT">샀어요</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-field">
          <label>구매 예정일</label>

          <div className="date-input">
            <input
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <label>구매 링크 (선택)</label>

          <input
            type="url"
            placeholder="https://"
            value={purchaseLink}
            onChange={(e) => setPurchaseLink(e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label>메모 (선택)</label>

        <div className="memo-input">
          <textarea
            maxLength={300}
            placeholder="상품에 대한 메모를 입력하세요."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />

          <span className="memo-count">{memo.length}/300</span>
        </div>
      </div>

      <div className="form-buttons">
        <button
          type="button"
          className="cancel-button"
          onClick={() => navigate("/wishlist")}
          disabled={isSaving}
        >
          취소
        </button>

        <button
          type="button"
          className="submit-button"
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? "저장 중..." : "상품 추가하기"}
        </button>
      </div>
    </section>
  );
}

export default ProductForm;

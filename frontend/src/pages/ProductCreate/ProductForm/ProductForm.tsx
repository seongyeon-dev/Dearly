import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type { WishCategory } from "../../../types/wish";
import { createWish } from "../../../api/wishApi";
import { uploadWishImage } from "../../../api/wishImageApi";
import { createPurchase } from "../../../api/purchaseApi";

import PurchaseModal, {
  type PurchaseData,
} from "../../../components/PurchaseModal/PurchaseModal";

import "./ProductForm.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

type ProductFormProps = {
  images: File[];
};

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
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const validateForm = (): boolean => {
    const numericPrice = Number(price);

    if (!name.trim()) {
      alert("상품명을 입력해주세요.");
      return false;
    }

    if (
      !price.trim() ||
      !Number.isSafeInteger(numericPrice) ||
      numericPrice <= 0
    ) {
      alert("올바른 가격을 입력해주세요.");
      return false;
    }

    if (purchaseLink.trim()) {
      try {
        const url = new URL(purchaseLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        alert("구매 링크는 http:// 또는 https:// 주소로 입력해주세요.");
        return false;
      }
    }

    return true;
  };

  const saveProduct = async (purchaseData: PurchaseData | null) => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);

    let savedProductId: number | null = null;

    try {
      const numericPrice = Number(price);

      const savedProduct = await createWish({
        name: name.trim(),
        category,
        status: purchaseData ? "WANT" : status,
        expected_price: numericPrice,
        planned_date: plannedDate || null,
        purchase_link: purchaseLink.trim() || null,
        memo: memo.trim() || null,
      });

      savedProductId = savedProduct.wish_id;

      for (let index = 0; index < images.length; index++) {
        await uploadWishImage(savedProductId, images[index], index + 1);
      }

      if (purchaseData) {
        await createPurchase({
          wish_id: savedProductId,
          amount: purchaseData.amount,
          purchased_at: purchaseData.date,
          store: purchaseData.store || null,
          memo: purchaseData.memo || null,
        });
      }

      setIsPurchaseModalOpen(false);

      alert("상품이 추가되었습니다!");

      navigate("/wishlist");
    } catch (error) {
      console.error("상품 등록 실패:", error);

      if (savedProductId !== null) {
        alert(
          "상품은 MySQL에 등록되었지만 이미지 또는 구매 기록 저장에 문제가 발생했습니다. 위시리스트를 확인해주세요.",
        );
      } else {
        alert("상품 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = () => {
    if (isSaving || !validateForm()) {
      return;
    }

    if (status === "BOUGHT") {
      setIsPurchaseModalOpen(true);
      return;
    }

    void saveProduct(null);
  };

  const handlePurchaseSave = (data: PurchaseData) => {
    void saveProduct(data);
  };

  return (
    <>
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

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        productName={name.trim()}
        productPrice={Number(price) || 0}
        onClose={() => {
          if (!isSaving) {
            setIsPurchaseModalOpen(false);
          }
        }}
        onSave={handlePurchaseSave}
      />
    </>
  );
}

export default ProductForm;

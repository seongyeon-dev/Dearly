import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { WishCategory } from "../../types/wish";
import {
  fetchWishById,
  updateWish,
  deleteWish,
  type WishDetailResponse,
} from "../../api/wishApi";

import ProductImages from "./ProductImages/ProductImages";
import ProductInfo from "./ProductInfo/ProductInfo";

import PurchaseModal, {
  type PurchaseData,
} from "../../components/PurchaseModal/PurchaseModal";

import { getPurchases } from "../../utils/purchaseStorage";

import "./ProductDetail.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

export type ProductDetails = {
  plannedDate: string;
  expectedPrice: string;
  purchaseLink: string;
  memo: string;
};

const categoryNames: Record<WishCategory, string> = {
  BEAUTY: "뷰티",
  FASHION: "패션",
  LIFESTYLE: "라이프스타일",
  OTHER: "기타",
};

function ProductDetail() {
  const navigate = useNavigate();
  const { wishId } = useParams<{ wishId: string }>();

  const productId = Number(wishId);

  const [productInfo, setProductInfo] = useState<WishDetailResponse | null>(
    null,
  );

  const [details, setDetails] = useState<ProductDetails>({
    plannedDate: "",
    expectedPrice: "",
    purchaseLink: "",
    memo: "",
  });

  const [status, setStatus] = useState<ProductStatus>("WANT");

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [purchaseRecord, setPurchaseRecord] = useState<PurchaseData | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setIsLoading(true);
      setLoadError("");
      setProductInfo(null);

      if (
        !wishId ||
        !/^[1-9]\d*$/.test(wishId) ||
        !Number.isSafeInteger(productId)
      ) {
        setLoadError("올바르지 않은 상품 주소입니다.");
        setIsLoading(false);
        return;
      }

      try {
        const data = await fetchWishById(productId);

        if (cancelled) {
          return;
        }

        setProductInfo(data);
        setStatus(data.status);

        setDetails({
          plannedDate: data.planned_date ? data.planned_date.slice(0, 10) : "",
          expectedPrice: String(data.expected_price),
          purchaseLink: data.purchase_link ?? "",
          memo: data.memo ?? "",
        });

        const savedPurchase = getPurchases().find(
          (purchase) => purchase.wishId === data.wish_id,
        );

        setPurchaseRecord(
          savedPurchase
            ? {
                amount: savedPurchase.amount,
                date: savedPurchase.date,
                store: savedPurchase.store,
                memo: savedPurchase.memo,
              }
            : null,
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("상품 상세 조회 실패:", error);
        setLoadError("상품 정보를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [wishId, productId]);

  const handleSaveEdit = async () => {
    if (!productInfo || isSaving || isDeleting) {
      return;
    }

    const price = Number(details.expectedPrice);

    if (
      details.expectedPrice.trim() === "" ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      alert("예상 가격을 올바르게 입력해주세요.");
      return;
    }

    if (details.memo.length > 300) {
      alert("메모는 300자 이내로 입력해주세요.");
      return;
    }

    if (details.purchaseLink.trim()) {
      try {
        const url = new URL(details.purchaseLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        alert("구매 링크는 http:// 또는 https://로 시작해야 합니다.");
        return;
      }
    }

    setIsSaving(true);

    try {
      const updatedProduct = await updateWish(productInfo.wish_id, {
        expected_price: price,
        planned_date: details.plannedDate || null,
        purchase_link: details.purchaseLink.trim() || null,
        memo: details.memo || null,
      });

      setProductInfo(updatedProduct);
      setStatus(updatedProduct.status);

      setDetails({
        plannedDate: updatedProduct.planned_date
          ? updatedProduct.planned_date.slice(0, 10)
          : "",
        expectedPrice: String(updatedProduct.expected_price),
        purchaseLink: updatedProduct.purchase_link ?? "",
        memo: updatedProduct.memo ?? "",
      });

      alert("상품 정보가 수정되었습니다!");
    } catch (error) {
      console.error("상품 수정 실패:", error);
      alert("상품 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (_nextStatus: ProductStatus) => {
    alert("상태 변경은 구매 기록 API 연결 후 사용할 수 있습니다.");
  };

  const handleDelete = async () => {
    if (!productInfo || isDeleting || isSaving) {
      return;
    }

    const confirmed = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteWish(productInfo.wish_id);

      alert("상품이 삭제되었습니다.");

      navigate("/wishlist", { replace: true });
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePurchaseSave = (_data: PurchaseData) => {
    alert("구매 기록 저장은 MySQL API 연결 후 사용할 수 있습니다.");
    setIsPurchaseModalOpen(false);
  };

  if (isLoading) {
    return (
      <main className="product-detail">
        <div className="detail-container">
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </main>
    );
  }

  if (loadError || !productInfo) {
    return (
      <main className="product-detail">
        <div className="detail-container">
          <h1>{loadError || "상품을 찾을 수 없습니다."}</h1>

          <button type="button" onClick={() => navigate("/wishlist")}>
            위시리스트로 돌아가기
          </button>
        </div>
      </main>
    );
  }

  const productPrice = Number(productInfo.expected_price);
  const productCategory = categoryNames[productInfo.category];

  return (
    <main className="product-detail">
      <div className="detail-container">
        <div className="detail-top">
          <button
            type="button"
            className="detail-back"
            onClick={() => navigate("/wishlist")}
          >
            <ArrowLeft size={18} strokeWidth={1.7} />
            <span>위시리스트로 돌아가기</span>
          </button>

          <div className="detail-actions">
            <button
              type="button"
              className="edit-button"
              onClick={handleSaveEdit}
              disabled={isSaving || isDeleting}
            >
              {isSaving ? "저장 중..." : "수정"}
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
              disabled={isSaving || isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>

        <div className="detail-content">
          <ProductImages productId={productInfo.wish_id} />

          <ProductInfo
            name={productInfo.name}
            price={productPrice}
            category={productCategory}
            status={status}
            onStatusChange={handleStatusChange}
            purchaseData={purchaseRecord}
            details={details}
            onDetailsChange={setDetails}
          />
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        productName={productInfo.name}
        productPrice={productPrice}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handlePurchaseSave}
      />
    </main>
  );
}

export default ProductDetail;

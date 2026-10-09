import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import ProductImages from "./ProductImages/ProductImages";
import ProductInfo from "./ProductInfo/ProductInfo";
import PurchaseModal, {
  type PurchaseData,
} from "../../components/PurchaseModal/PurchaseModal";
import "./ProductDetail.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

export type ProductDetails = {
  plannedDate: string;
  expectedPrice: string;
  purchaseLink: string;
  memo: string;
};

const initialDetails: ProductDetails = {
  plannedDate: "2026-10-15",
  expectedPrice: "13000",
  purchaseLink: "https://example.com",
  memo: "색이 생각보다 예쁘고 요즘 제일 자주 손이 가는 틴트. 세일하면 바로 사야지!",
};

const STORAGE_KEY = "dearly-product-detail-1";

type StoredProduct = {
  details: ProductDetails;
  status: ProductStatus;
  purchaseData: PurchaseData | null;
};

const initialProduct: StoredProduct = {
  details: initialDetails,
  status: "WANT",
  purchaseData: null,
};

function loadProduct(): StoredProduct {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return initialProduct;
    }

    const parsed = JSON.parse(saved) as StoredProduct;

    if (!parsed.details || !parsed.status) {
      return initialProduct;
    }

    return {
      details: {
        ...initialDetails,
        ...parsed.details,
      },
      status: parsed.status,
      purchaseData: parsed.purchaseData ?? null,
    };
  } catch {
    return initialProduct;
  }
}

function ProductDetail() {
  const navigate = useNavigate();

  const [product, setProduct] = useState<StoredProduct>(loadProduct);
  const [details, setDetails] = useState<ProductDetails>(product.details);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const saveProduct = (nextProduct: StoredProduct) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProduct));
      setProduct(nextProduct);
      return true;
    } catch {
      alert("저장에 실패했습니다. 브라우저 저장 공간을 확인해 주세요.");
      return false;
    }
  };

  const handleSaveEdit = () => {
    const price = Number(details.expectedPrice);

    if (
      details.expectedPrice.trim() === "" ||
      !Number.isSafeInteger(price) ||
      price < 0
    ) {
      alert("예상 가격을 올바르게 입력해 주세요.");
      return;
    }

    if (details.purchaseLink.trim()) {
      try {
        const url = new URL(details.purchaseLink);

        if (url.protocol !== "https:" && url.protocol !== "http:") {
          throw new Error("Invalid protocol");
        }
      } catch {
        alert("구매 링크는 http:// 또는 https://로 시작해야 합니다.");
        return;
      }
    }

    const updatedProduct: StoredProduct = {
      ...product,
      details: { ...details },
    };

    if (saveProduct(updatedProduct)) {
      alert("상품 정보가 수정되었습니다.");
    }
  };

  const handleStatusChange = (nextStatus: ProductStatus) => {
    if (nextStatus === "BOUGHT" && !product.purchaseData) {
      setIsPurchaseModalOpen(true);
      return;
    }

    saveProduct({
      ...product,
      status: nextStatus,
    });
  };

  const handlePurchaseSave = (data: PurchaseData) => {
    const updatedProduct: StoredProduct = {
      ...product,
      status: "BOUGHT",
      purchaseData: data,
    };

    if (saveProduct(updatedProduct)) {
      setIsPurchaseModalOpen(false);
    }
  };

  const handleDelete = () => {
    const confirmed = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmed) return;

    try {
      localStorage.removeItem(STORAGE_KEY);
      alert("상품이 삭제되었습니다.");
      navigate("/wishlist");
    } catch {
      alert("상품 삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

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
            >
              수정
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
            >
              삭제
            </button>
          </div>
        </div>

        <div className="detail-content">
          <ProductImages />

          <ProductInfo
            status={product.status}
            onStatusChange={handleStatusChange}
            purchaseData={product.purchaseData}
            details={details}
            onDetailsChange={setDetails}
          />
        </div>
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        productName="롬앤 쥬시래스팅 틴트"
        productPrice={13000}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handlePurchaseSave}
      />
    </main>
  );
}

export default ProductDetail;

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import ProductImages from "./ProductImages/ProductImages";
import ProductInfo from "./ProductInfo/ProductInfo";
import PurchaseModal, {
  type PurchaseData,
} from "../../components/PurchaseModal/PurchaseModal";

import {
  getPurchases,
  savePurchase,
  deletePurchase,
} from "../../utils/purchaseStorage";

import "./ProductDetail.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

export type ProductDetails = {
  plannedDate: string;
  expectedPrice: string;
  purchaseLink: string;
  memo: string;
};

type StoredProduct = {
  details: ProductDetails;
  status: ProductStatus;
  purchaseData: PurchaseData | null;
};

type ProductItem = {
  id: number;
  name: string;
  price: number;
  category: string;
};

const products: ProductItem[] = [
  {
    id: 1,
    name: "롬앤 쥬시래스팅 틴트",
    price: 13000,
    category: "뷰티",
  },
  {
    id: 2,
    name: "에스트라 아토베리어 크림",
    price: 32000,
    category: "뷰티",
  },
  {
    id: 3,
    name: "나이키 에어포스 1",
    price: 139000,
    category: "패션",
  },
  {
    id: 4,
    name: "클리오 킬커버 쿠션",
    price: 32000,
    category: "뷰티",
  },
  {
    id: 5,
    name: "무인양품 테이블 조명",
    price: 59000,
    category: "라이프스타일",
  },
  {
    id: 6,
    name: "폴로 케이블 니트",
    price: 169000,
    category: "패션",
  },
];

function createInitialProduct(id: number, price: number): StoredProduct {
  return {
    details: {
      plannedDate: id === 1 ? "2026-10-15" : "",
      expectedPrice: String(price),
      purchaseLink: "",
      memo:
        id === 1
          ? "색이 생각보다 예쁘고 요즘 제일 자주 손이 가는 틴트. 세일하면 바로 사야지!"
          : "",
    },
    status: "WANT",
    purchaseData: null,
  };
}

function loadProduct(id: number, price: number): StoredProduct {
  const initialProduct = createInitialProduct(id, price);

  try {
    const saved = localStorage.getItem(`dearly-product-detail-${id}`);

    if (!saved) {
      return initialProduct;
    }

    const parsed = JSON.parse(saved) as Partial<StoredProduct>;

    if (!parsed.details || !parsed.status) {
      return initialProduct;
    }

    const validStatus =
      parsed.status === "WANT" ||
      parsed.status === "CONSIDERING" ||
      parsed.status === "BOUGHT";

    if (!validStatus) {
      return initialProduct;
    }

    return {
      details: {
        ...initialProduct.details,
        ...parsed.details,
      },
      status: parsed.status,
      purchaseData: parsed.purchaseData ?? null,
    };
  } catch {
    return initialProduct;
  }
}

function getDeletedProductIds(): number[] {
  try {
    const saved = localStorage.getItem("dearly-deleted-products");

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is number => typeof id === "number" && Number.isInteger(id),
    );
  } catch {
    return [];
  }
}

function ProductDetail() {
  const navigate = useNavigate();

  const { wishId } = useParams<{ wishId: string }>();

  const productId = Number(wishId);

  const deletedProductIds = getDeletedProductIds();

  const productInfo = products.find(
    (item) => item.id === productId && !deletedProductIds.includes(item.id),
  );

  const [product, setProduct] = useState<StoredProduct>(() =>
    loadProduct(productId, productInfo?.price ?? 0),
  );

  const [details, setDetails] = useState<ProductDetails>(product.details);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  useEffect(() => {
    if (!productInfo) {
      return;
    }

    const loadedProduct = loadProduct(productInfo.id, productInfo.price);

    setProduct(loadedProduct);
    setDetails(loadedProduct.details);
    setIsPurchaseModalOpen(false);
  }, [productId, productInfo]);

  useEffect(() => {
    if (!productInfo || product.status !== "BOUGHT" || !product.purchaseData) {
      return;
    }

    const alreadySaved = getPurchases().some(
      (purchase) => purchase.wishId === productInfo.id,
    );

    if (alreadySaved) {
      return;
    }

    const success = savePurchase({
      wishId: productInfo.id,
      name: productInfo.name,
      category: productInfo.category,
      amount: product.purchaseData.amount,
      date: product.purchaseData.date,
      store: product.purchaseData.store,
      memo: product.purchaseData.memo,
    });

    if (!success) {
      console.error("구매 기록 저장에 실패했습니다.");
    }
  }, [product, productInfo]);

  const saveProduct = (nextProduct: StoredProduct): boolean => {
    if (!productInfo) {
      return false;
    }

    try {
      localStorage.setItem(
        `dearly-product-detail-${productInfo.id}`,
        JSON.stringify(nextProduct),
      );

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
      details: {
        ...details,
      },
    };

    if (saveProduct(updatedProduct)) {
      alert("상품 정보가 수정되었습니다.");
    }
  };

  const handleStatusChange = (nextStatus: ProductStatus) => {
    if (!productInfo) {
      return;
    }

    if (nextStatus === "BOUGHT" && !product.purchaseData) {
      setIsPurchaseModalOpen(true);
      return;
    }

    if (nextStatus !== "BOUGHT") {
      const deleted = deletePurchase(productInfo.id);

      if (!deleted) {
        alert("구매 기록 변경에 실패했습니다.");
        return;
      }
    } else if (product.purchaseData) {
      const saved = savePurchase({
        wishId: productInfo.id,
        name: productInfo.name,
        category: productInfo.category,
        amount: product.purchaseData.amount,
        date: product.purchaseData.date,
        store: product.purchaseData.store,
        memo: product.purchaseData.memo,
      });

      if (!saved) {
        alert("구매 기록 저장에 실패했습니다.");
        return;
      }
    }

    saveProduct({
      ...product,
      status: nextStatus,
    });
  };

  const handlePurchaseSave = (data: PurchaseData) => {
    if (!productInfo) {
      return;
    }

    const saved = savePurchase({
      wishId: productInfo.id,
      name: productInfo.name,
      category: productInfo.category,
      amount: data.amount,
      date: data.date,
      store: data.store,
      memo: data.memo,
    });

    if (!saved) {
      alert("구매 기록 저장에 실패했습니다.");
      return;
    }

    const updatedProduct: StoredProduct = {
      ...product,
      status: "BOUGHT",
      purchaseData: data,
    };

    if (saveProduct(updatedProduct)) {
      setIsPurchaseModalOpen(false);
    } else {
      deletePurchase(productInfo.id);
    }
  };

  const handleDelete = () => {
    if (!productInfo) {
      return;
    }

    const confirmed = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    try {
      const previousDeletedIds = getDeletedProductIds();

      const updatedDeletedIds = [
        ...new Set([...previousDeletedIds, productInfo.id]),
      ];

      localStorage.setItem(
        "dearly-deleted-products",
        JSON.stringify(updatedDeletedIds),
      );

      const deleted = deletePurchase(productInfo.id);

      if (!deleted) {
        localStorage.setItem(
          "dearly-deleted-products",
          JSON.stringify(previousDeletedIds),
        );

        alert("구매 기록 삭제에 실패했습니다.");
        return;
      }

      localStorage.removeItem(`dearly-product-detail-${productInfo.id}`);

      alert("상품이 삭제되었습니다.");

      navigate("/wishlist");
    } catch {
      alert("상품 삭제에 실패했습니다. 다시 시도해 주세요.");
    }
  };

  if (!productInfo) {
    return (
      <main className="product-detail">
        <div className="detail-container">
          <h1>상품을 찾을 수 없습니다.</h1>

          <button type="button" onClick={() => navigate("/wishlist")}>
            위시리스트로 돌아가기
          </button>
        </div>
      </main>
    );
  }

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
            name={productInfo.name}
            price={productInfo.price}
            category={productInfo.category}
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
        productName={productInfo.name}
        productPrice={productInfo.price}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSave={handlePurchaseSave}
      />
    </main>
  );
}

export default ProductDetail;

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { WishCategory } from "../../types/wish";
import { getWishlistProducts } from "../../utils/wishlistStorage";

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

type LegacyStoredProduct = Partial<StoredProduct> & Partial<ProductDetails>;

const categoryNames: Record<WishCategory, string> = {
  BEAUTY: "뷰티",
  FASHION: "패션",
  LIFESTYLE: "라이프스타일",
  OTHER: "기타",
};

function parsePrice(price: string): number {
  return Number(price.replace(/[^\d]/g, ""));
}

function isProductStatus(value: unknown): value is ProductStatus {
  return value === "WANT" || value === "CONSIDERING" || value === "BOUGHT";
}

function createInitialProduct(
  id: number,
  price: number,
  initialStatus: ProductStatus,
): StoredProduct {
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
    status: initialStatus,
    purchaseData: null,
  };
}

function loadProduct(
  id: number,
  price: number,
  initialStatus: ProductStatus,
): StoredProduct {
  const initialProduct = createInitialProduct(id, price, initialStatus);

  try {
    const saved = localStorage.getItem(`dearly-product-detail-${id}`);

    if (!saved) {
      return initialProduct;
    }

    const parsed = JSON.parse(saved) as LegacyStoredProduct;

    if (typeof parsed !== "object" || parsed === null) {
      return initialProduct;
    }

    const savedDetails = parsed.details ?? {
      plannedDate: parsed.plannedDate ?? "",
      expectedPrice: parsed.expectedPrice ?? String(price),
      purchaseLink: parsed.purchaseLink ?? "",
      memo: parsed.memo ?? "",
    };

    return {
      details: {
        ...initialProduct.details,
        ...savedDetails,
        expectedPrice: String(
          savedDetails.expectedPrice ?? initialProduct.details.expectedPrice,
        ),
      },
      status: isProductStatus(parsed.status) ? parsed.status : initialStatus,
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

function deleteProductImages(productId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("dearly-images", 1);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains("products")) {
        database.createObjectStore("products");
      }
    };

    request.onerror = () => {
      reject(new Error("이미지 저장소를 열 수 없습니다."));
    };

    request.onsuccess = () => {
      const database = request.result;

      let transaction: IDBTransaction;

      try {
        transaction = database.transaction("products", "readwrite");

        const store = transaction.objectStore("products");
        store.delete(productId);
      } catch (error) {
        database.close();
        reject(error);
        return;
      }

      transaction.oncomplete = () => {
        database.close();
        resolve();
      };

      transaction.onerror = () => {
        database.close();
        reject(new Error("상품 이미지 삭제에 실패했습니다."));
      };

      transaction.onabort = () => {
        database.close();
        reject(new Error("상품 이미지 삭제가 취소되었습니다."));
      };
    };
  });
}

function ProductDetail() {
  const navigate = useNavigate();
  const { wishId } = useParams<{ wishId: string }>();

  const productId = Number(wishId);

  const productInfo = useMemo(() => {
    const deletedProductIds = getDeletedProductIds();

    return getWishlistProducts().find(
      (item) => item.id === productId && !deletedProductIds.includes(item.id),
    );
  }, [productId]);

  const productPrice = productInfo ? parsePrice(productInfo.price) : 0;

  const productCategory = productInfo
    ? categoryNames[productInfo.category]
    : "";

  const initialStatus: ProductStatus =
    productInfo?.statusClass === "bought"
      ? "BOUGHT"
      : productInfo?.statusClass === "considering"
        ? "CONSIDERING"
        : "WANT";

  const [product, setProduct] = useState<StoredProduct>(() =>
    loadProduct(productId, productPrice, initialStatus),
  );

  const [details, setDetails] = useState<ProductDetails>(product.details);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  const [purchaseRecord, setPurchaseRecord] = useState(
    () =>
      getPurchases().find((purchase) => purchase.wishId === productId) ?? null,
  );

  useEffect(() => {
    if (!productInfo) {
      return;
    }

    const loadedProduct = loadProduct(
      productInfo.id,
      productPrice,
      initialStatus,
    );

    setProduct(loadedProduct);
    setDetails(loadedProduct.details);
    setIsPurchaseModalOpen(false);

    setPurchaseRecord(
      getPurchases().find((purchase) => purchase.wishId === productInfo.id) ??
        null,
    );
  }, [productId, productInfo, productPrice, initialStatus]);

  useEffect(() => {
    if (!productInfo || product.status !== "BOUGHT" || !product.purchaseData) {
      return;
    }

    const existingPurchase = getPurchases().find(
      (purchase) => purchase.wishId === productInfo.id,
    );

    if (existingPurchase) {
      setPurchaseRecord(existingPurchase);
      return;
    }

    const success = savePurchase({
      wishId: productInfo.id,
      name: productInfo.name,
      category: productCategory,
      amount: product.purchaseData.amount,
      date: product.purchaseData.date,
      store: product.purchaseData.store,
      memo: product.purchaseData.memo,
    });

    if (success) {
      setPurchaseRecord(
        getPurchases().find((purchase) => purchase.wishId === productInfo.id) ??
          null,
      );
    } else {
      console.error("구매 기록 저장에 실패했습니다.");
    }
  }, [product, productInfo, productCategory]);

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

    if (nextStatus === "BOUGHT" && !purchaseRecord && !product.purchaseData) {
      setIsPurchaseModalOpen(true);
      return;
    }

    if (nextStatus !== "BOUGHT") {
      const deleted = deletePurchase(productInfo.id);

      if (!deleted) {
        alert("구매 기록 변경에 실패했습니다.");
        return;
      }

      setPurchaseRecord(null);
    } else if (product.purchaseData) {
      const saved = savePurchase({
        wishId: productInfo.id,
        name: productInfo.name,
        category: productCategory,
        amount: product.purchaseData.amount,
        date: product.purchaseData.date,
        store: product.purchaseData.store,
        memo: product.purchaseData.memo,
      });

      if (!saved) {
        alert("구매 기록 저장에 실패했습니다.");
        return;
      }

      setPurchaseRecord(
        getPurchases().find((purchase) => purchase.wishId === productInfo.id) ??
          null,
      );
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
      category: productCategory,
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
      setPurchaseRecord(
        getPurchases().find((purchase) => purchase.wishId === productInfo.id) ??
          null,
      );

      setIsPurchaseModalOpen(false);
    } else {
      deletePurchase(productInfo.id);
      setPurchaseRecord(null);
    }
  };

  const handleDelete = async () => {
    if (!productInfo || isDeleting) {
      return;
    }

    const confirmed = window.confirm("정말 이 상품을 삭제하시겠습니까?");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteProductImages(productInfo.id);

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
    } catch (error) {
      console.error("상품 삭제 실패:", error);

      alert("상품 삭제에 실패했습니다. 다시 시도해 주세요.");
    } finally {
      setIsDeleting(false);
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
              disabled={isDeleting}
            >
              수정
            </button>

            <button
              type="button"
              className="delete-button"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "삭제 중..." : "삭제"}
            </button>
          </div>
        </div>

        <div className="detail-content">
          <ProductImages productId={productInfo.id} />

          <ProductInfo
            name={productInfo.name}
            price={productPrice}
            category={productCategory}
            status={product.status}
            onStatusChange={handleStatusChange}
            purchaseData={
              purchaseRecord
                ? {
                    amount: purchaseRecord.amount,
                    date: purchaseRecord.date,
                    store: purchaseRecord.store,
                    memo: purchaseRecord.memo,
                  }
                : null
            }
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

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import type { WishCategory } from "../../types/wish";

import {
  fetchWishById,
  updateWish,
  deleteWish,
  type WishDetailResponse,
} from "../../api/wishApi";

import {
  createPurchase,
  fetchPurchaseByWishId,
  updatePurchase,
  deletePurchase,
} from "../../api/purchaseApi";

import ProductImages from "./ProductImages/ProductImages";
import type { ProductImagesHandle } from "./ProductImages/ProductImages";
import ProductInfo from "./ProductInfo/ProductInfo";

import PurchaseModal, {
  type PurchaseData,
} from "../../components/PurchaseModal/PurchaseModal";

import "./ProductDetail.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";
type PurchaseModalMode = "create" | "edit";

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

const categoryCodes: Record<string, WishCategory> = {
  뷰티: "BEAUTY",
  패션: "FASHION",
  라이프스타일: "LIFESTYLE",
  기타: "OTHER",
};

function toProductDetails(product: WishDetailResponse): ProductDetails {
  return {
    plannedDate: product.planned_date ? product.planned_date.slice(0, 10) : "",
    expectedPrice: String(product.expected_price),
    purchaseLink: product.purchase_link ?? "",
    memo: product.memo ?? "",
  };
}

function ProductDetail() {
  const navigate = useNavigate();
  const { wishId } = useParams<{ wishId: string }>();

  const productId = Number(wishId);
  const productImagesRef = useRef<ProductImagesHandle>(null);

  const [productInfo, setProductInfo] = useState<WishDetailResponse | null>(
    null,
  );

  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("뷰티");

  const [details, setDetails] = useState<ProductDetails>({
    plannedDate: "",
    expectedPrice: "",
    purchaseLink: "",
    memo: "",
  });

  const [status, setStatus] = useState<ProductStatus>("WANT");

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPurchaseSaving, setIsPurchaseSaving] = useState(false);
  const [isPurchaseDeleting, setIsPurchaseDeleting] = useState(false);

  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);

  const [purchaseModalMode, setPurchaseModalMode] =
    useState<PurchaseModalMode>("create");

  const [purchaseRecord, setPurchaseRecord] = useState<PurchaseData | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setIsLoading(true);
      setLoadError("");
      setProductInfo(null);
      setPurchaseRecord(null);
      setIsEditing(false);
      setIsPurchaseModalOpen(false);
      setPurchaseModalMode("create");

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

        if (cancelled) return;

        setProductInfo(data);
        setProductName(data.name);
        setProductCategory(categoryNames[data.category]);
        setStatus(data.status);
        setDetails(toProductDetails(data));

        const savedPurchase = await fetchPurchaseByWishId(data.wish_id);

        if (cancelled) return;

        setPurchaseRecord(
          savedPurchase
            ? {
                amount: savedPurchase.amount,
                date: savedPurchase.purchased_at.slice(0, 10),
                store: savedPurchase.store ?? "",
                memo: savedPurchase.memo ?? "",
              }
            : null,
        );
      } catch (error) {
        if (cancelled) return;

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

  const resetProductFields = () => {
    if (!productInfo) return;

    setProductName(productInfo.name);
    setProductCategory(categoryNames[productInfo.category]);
    setStatus(productInfo.status);
    setDetails(toProductDetails(productInfo));
  };

  const handleStartEdit = () => {
    if (
      !productInfo ||
      isSaving ||
      isDeleting ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isPurchaseModalOpen
    ) {
      return;
    }

    resetProductFields();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (isSaving || isPurchaseSaving || isPurchaseDeleting) {
      return;
    }

    productImagesRef.current?.cancel();

    resetProductFields();
    setIsEditing(false);
  };

  const validateProduct = (): boolean => {
    if (!productName.trim()) {
      alert("상품명을 입력해주세요.");
      return false;
    }

    if (productName.trim().length > 150) {
      alert("상품명은 150자 이내로 입력해주세요.");
      return false;
    }

    if (!categoryCodes[productCategory]) {
      alert("카테고리를 선택해주세요.");
      return false;
    }

    const price = Number(details.expectedPrice);

    if (
      details.expectedPrice.trim() === "" ||
      !Number.isSafeInteger(price) ||
      price <= 0
    ) {
      alert("예상 가격을 올바르게 입력해주세요.");
      return false;
    }

    if (details.memo.length > 300) {
      alert("메모는 300자 이내로 입력해주세요.");
      return false;
    }

    if (details.purchaseLink.trim()) {
      try {
        const url = new URL(details.purchaseLink.trim());

        if (!["http:", "https:"].includes(url.protocol)) {
          throw new Error("Invalid URL");
        }
      } catch {
        alert("구매 링크는 http:// 또는 https://로 시작해야 합니다.");
        return false;
      }
    }

    return true;
  };

  const handleSaveEdit = async () => {
    if (
      !productInfo ||
      !isEditing ||
      isSaving ||
      isDeleting ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isPurchaseModalOpen
    ) {
      return;
    }

    if (!validateProduct()) return;

    if (status === "BOUGHT" && !purchaseRecord) {
      setPurchaseModalMode("create");
      setIsPurchaseModalOpen(true);
      return;
    }

    setIsSaving(true);

    let updatedProduct: WishDetailResponse;

    try {
      updatedProduct = await updateWish(productInfo.wish_id, {
        name: productName.trim(),
        category: categoryCodes[productCategory],
        status,
        expected_price: Number(details.expectedPrice),
        planned_date: details.plannedDate || null,
        purchase_link: details.purchaseLink.trim() || null,
        memo: details.memo.trim() || null,
      });
    } catch (error) {
      console.error("상품 수정 실패:", error);
      alert("상품 정보 수정에 실패했습니다. 다시 시도해주세요.");
      setIsSaving(false);
      return;
    }

    setProductInfo(updatedProduct);
    setProductName(updatedProduct.name);
    setProductCategory(categoryNames[updatedProduct.category]);
    setStatus(updatedProduct.status);
    setDetails(toProductDetails(updatedProduct));

    try {
      if (!productImagesRef.current) {
        throw new Error("이미지 편집 기능을 찾을 수 없습니다.");
      }

      await productImagesRef.current.save();

      setIsEditing(false);
      alert("상품 정보와 이미지가 수정되었습니다!");
    } catch (error) {
      console.error("상품 이미지 저장 실패:", error);
      alert(
        "상품 정보는 저장되었지만 이미지 저장에 실패했습니다. 이미지 변경 사항을 다시 저장해주세요.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = (nextStatus: ProductStatus) => {
    if (!isEditing || isSaving || isDeleting) {
      return;
    }

    setStatus(nextStatus);
  };

  const handleDelete = async () => {
    if (
      !productInfo ||
      isDeleting ||
      isSaving ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isPurchaseModalOpen
    ) {
      return;
    }

    const confirmed = window.confirm(
      "정말 이 상품을 삭제하시겠습니까?\n삭제한 상품은 복구할 수 없습니다.",
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteWish(productInfo.wish_id);

      alert("상품이 삭제되었습니다.");

      navigate("/wishlist", {
        replace: true,
      });
    } catch (error) {
      console.error("상품 삭제 실패:", error);
      alert("상품 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePurchaseEdit = () => {
    if (
      !productInfo ||
      !purchaseRecord ||
      isEditing ||
      isSaving ||
      isDeleting ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isPurchaseModalOpen
    ) {
      return;
    }

    setPurchaseModalMode("edit");
    setIsPurchaseModalOpen(true);
  };

  const handlePurchaseDelete = async () => {
    if (
      !productInfo ||
      !purchaseRecord ||
      isEditing ||
      isSaving ||
      isDeleting ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isPurchaseModalOpen
    ) {
      return;
    }

    const confirmed = window.confirm(
      "구매 기록을 삭제하시겠습니까?\n삭제한 기록은 복구할 수 없습니다.",
    );

    if (!confirmed) return;

    setIsPurchaseDeleting(true);

    try {
      await deletePurchase(productInfo.wish_id);

      setPurchaseRecord(null);
      setPurchaseModalMode("create");

      alert("구매 기록이 삭제되었습니다!");
    } catch (error) {
      console.error("구매 기록 삭제 실패:", error);
      alert("구매 기록 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsPurchaseDeleting(false);
    }
  };

  const handlePurchaseSave = async (data: PurchaseData) => {
    if (
      !productInfo ||
      isPurchaseSaving ||
      isPurchaseDeleting ||
      isSaving ||
      isDeleting
    ) {
      return;
    }

    const amount = Number(data.amount);

    if (!Number.isSafeInteger(amount) || amount < 0 || !data.date) {
      throw new Error("구매 금액과 날짜를 확인해주세요.");
    }

    setIsPurchaseSaving(true);

    try {
      if (purchaseModalMode === "edit") {
        if (!purchaseRecord) {
          throw new Error("수정할 구매 기록이 없습니다.");
        }

        const updatedPurchase = await updatePurchase(productInfo.wish_id, {
          amount,
          purchased_at: data.date,
          store: data.store.trim() || null,
          memo: data.memo.trim() || null,
        });

        setPurchaseRecord({
          amount: updatedPurchase.amount,
          date: updatedPurchase.purchased_at.slice(0, 10),
          store: updatedPurchase.store ?? "",
          memo: updatedPurchase.memo ?? "",
        });

        setIsPurchaseModalOpen(false);

        alert("구매 기록이 수정되었습니다!");
      } else {
        if (purchaseRecord) {
          throw new Error("이미 구매 기록이 등록되어 있습니다.");
        }

        const savedPurchase = await createPurchase({
          wish_id: productInfo.wish_id,
          amount,
          purchased_at: data.date,
          store: data.store.trim() || null,
          memo: data.memo.trim() || null,
        });

        setPurchaseRecord({
          amount: savedPurchase.amount,
          date: savedPurchase.purchased_at.slice(0, 10),
          store: savedPurchase.store ?? "",
          memo: savedPurchase.memo ?? "",
        });

        setStatus("BOUGHT");

        setProductInfo((prev) => (prev ? { ...prev, status: "BOUGHT" } : prev));

        setIsPurchaseModalOpen(false);

        alert(
          isEditing
            ? "구매 기록이 저장되었습니다. 상품 정보도 저장해주세요."
            : "구매 기록이 저장되었습니다!",
        );
      }
    } catch (error) {
      console.error("구매 기록 저장 실패:", error);
      throw error;
    } finally {
      setIsPurchaseSaving(false);
    }
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
            {isEditing ? (
              <>
                <button
                  type="button"
                  className="edit-cancel-button"
                  onClick={handleCancelEdit}
                  disabled={isSaving || isPurchaseSaving || isPurchaseDeleting}
                >
                  취소
                </button>

                <button
                  type="button"
                  className="edit-save-button"
                  onClick={handleSaveEdit}
                  disabled={
                    isSaving ||
                    isDeleting ||
                    isPurchaseSaving ||
                    isPurchaseDeleting ||
                    isPurchaseModalOpen
                  }
                >
                  {isSaving ? "저장 중..." : "저장하기"}
                </button>
              </>
            ) : (
              <button
                type="button"
                className="edit-button"
                onClick={handleStartEdit}
                disabled={
                  isSaving ||
                  isDeleting ||
                  isPurchaseSaving ||
                  isPurchaseDeleting ||
                  isPurchaseModalOpen
                }
              >
                <Pencil size={15} strokeWidth={1.8} />
                상품 수정
              </button>
            )}
          </div>
        </div>

        <div className="detail-content">
          <ProductImages
            ref={productImagesRef}
            productId={productInfo.wish_id}
            isEditing={isEditing}
          />

          <ProductInfo
            name={productName}
            onNameChange={setProductName}
            price={productPrice}
            category={productCategory}
            onCategoryChange={setProductCategory}
            status={status}
            onStatusChange={handleStatusChange}
            isEditing={isEditing}
            purchaseData={purchaseRecord}
            onPurchaseEdit={handlePurchaseEdit}
            onPurchaseDelete={handlePurchaseDelete}
            isPurchaseDeleting={isPurchaseDeleting}
            details={details}
            onDetailsChange={setDetails}
          />
        </div>

        {isEditing && (
          <div className="product-delete-section">
            <button
              type="button"
              className="product-delete-button"
              onClick={handleDelete}
              disabled={
                isDeleting ||
                isSaving ||
                isPurchaseSaving ||
                isPurchaseDeleting ||
                isPurchaseModalOpen
              }
            >
              <Trash2 size={16} />
              {isDeleting ? "삭제 중..." : "상품 삭제"}
            </button>
          </div>
        )}
      </div>

      <PurchaseModal
        isOpen={isPurchaseModalOpen}
        productName={productName}
        productPrice={Number(details.expectedPrice) || 0}
        mode={purchaseModalMode}
        initialData={purchaseModalMode === "edit" ? purchaseRecord : null}
        onClose={() => {
          if (!isPurchaseSaving) {
            setIsPurchaseModalOpen(false);
          }
        }}
        onSave={handlePurchaseSave}
      />
    </main>
  );
}

export default ProductDetail;

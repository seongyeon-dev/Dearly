
import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CircleDollarSign,
  Ellipsis,
  FileText,
  Pencil,
  Store,
  Tag,
  Trash2,
} from "lucide-react";

import type { PurchaseData } from "../../../components/PurchaseModal/PurchaseModal";
import type { ProductDetails } from "../ProductDetail";

import "./ProductInfo.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

type ProductInfoProps = {
  name: string;
  onNameChange: (name: string) => void;
  price: number;
  category: string;
  onCategoryChange: (category: string) => void;
  status: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
  isEditing: boolean;
  purchaseData: PurchaseData | null;
  onPurchaseEdit: () => void;
  onPurchaseDelete: () => void;
  isPurchaseDeleting?: boolean;
  details: ProductDetails;
  onDetailsChange: (details: ProductDetails) => void;
};

const statusLabels: Record<ProductStatus, string> = {
  WANT: "사고 싶어요",
  CONSIDERING: "고민 중",
  BOUGHT: "샀어요",
};

const statusOptions: ProductStatus[] = [
  "WANT",
  "CONSIDERING",
  "BOUGHT",
];

const categoryOptions = ["뷰티", "패션", "라이프스타일", "기타"];

function ProductInfo({
  name,
  onNameChange,
  price,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  isEditing,
  purchaseData,
  onPurchaseEdit,
  onPurchaseDelete,
  isPurchaseDeleting = false,
  details,
  onDetailsChange,
}: ProductInfoProps) {
  const [isPurchaseMenuOpen, setIsPurchaseMenuOpen] = useState(false);
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);

  const purchaseMenuRef = useRef<HTMLDivElement>(null);
  const statusMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isPurchaseMenuOpen && !isStatusMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        purchaseMenuRef.current &&
        !purchaseMenuRef.current.contains(target)
      ) {
        setIsPurchaseMenuOpen(false);
      }

      if (
        statusMenuRef.current &&
        !statusMenuRef.current.contains(target)
      ) {
        setIsStatusMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPurchaseMenuOpen(false);
        setIsStatusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isPurchaseMenuOpen, isStatusMenuOpen]);

  useEffect(() => {
    if (!isEditing) {
      setIsStatusMenuOpen(false);
      setIsPurchaseMenuOpen(false);
    }
  }, [isEditing]);

  const updateField = (field: keyof ProductDetails, value: string) => {
    onDetailsChange({
      ...details,
      [field]: value,
    });
  };

  const handleStatusSelect = (nextStatus: ProductStatus) => {
    onStatusChange(nextStatus);
    setIsStatusMenuOpen(false);
  };

  const handlePurchaseEdit = () => {
    setIsPurchaseMenuOpen(false);
    onPurchaseEdit();
  };

  const handlePurchaseDelete = () => {
    setIsPurchaseMenuOpen(false);
    onPurchaseDelete();
  };

  const displayPrice =
    status === "BOUGHT" && purchaseData
      ? purchaseData.amount
      : price;

  const formatPrice = (value: number) =>
    `${value.toLocaleString("ko-KR")}원`;

  const formatDate = (value: string) =>
    value ? value.replaceAll("-", ".") : "-";

  return (
    <section className="detail-info">
      <div className="detail-title">
        {isEditing ? (
          <div className="product-edit-basic">
            <input
              type="text"
              className="product-edit-name"
              aria-label="상품명"
              value={name}
              onChange={(event) => onNameChange(event.target.value)}
              placeholder="상품명을 입력해 주세요."
              maxLength={150}
            />

            <div className="detail-input-wrap">
              <input
                type="number"
                aria-label="예상 가격"
                min="0"
                step="1"
                value={details.expectedPrice}
                onChange={(event) =>
                  updateField("expectedPrice", event.target.value)
                }
              />
              <span>원</span>
            </div>

            <div className="product-edit-selects">
              <div
                className="custom-status-wrapper"
                ref={statusMenuRef}
              >
                <button
                  type="button"
                  className={`custom-status-trigger custom-status-${status.toLowerCase()}`}
                  aria-label="상품 상태 선택"
                  aria-haspopup="listbox"
                  aria-expanded={isStatusMenuOpen}
                  onClick={() =>
                    setIsStatusMenuOpen((prev) => !prev)
                  }
                >
                  <span>{statusLabels[status]}</span>
                  <ChevronDown
                    size={16}
                    className={isStatusMenuOpen ? "is-open" : ""}
                  />
                </button>

                {isStatusMenuOpen && (
                  <div
                    className="custom-status-dropdown"
                    role="listbox"
                    aria-label="상품 상태"
                  >
                    {statusOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="option"
                        aria-selected={status === option}
                        className={`custom-status-option custom-status-option-${option.toLowerCase()} ${
                          status === option ? "is-selected" : ""
                        }`}
                        onClick={() => handleStatusSelect(option)}
                      >
                        <span>{statusLabels[option]}</span>

                        {status === option && <Check size={15} />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <select
                className="product-edit-category"
                aria-label="카테고리"
                value={category}
                onChange={(event) =>
                  onCategoryChange(event.target.value)
                }
              >
                {!categoryOptions.includes(category) && (
                  <option value={category}>{category}</option>
                )}

                {categoryOptions.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>
            <h1>{name}</h1>

            <strong>{formatPrice(displayPrice)}</strong>

            <div className="detail-title-meta">
              <span
                className={`detail-status detail-status-${status.toLowerCase()}`}
              >
                {statusLabels[status]}
              </span>

              <span className="detail-category">
                <Tag size={15} />
                {category}
              </span>
            </div>
          </>
        )}
      </div>

      {purchaseData && (
        <div className="purchase-section">
          <div className="purchase-section-header">
            <h2>
              <CalendarDays size={19} />
              구매 기록
            </h2>

            <div
              className="purchase-menu-wrapper"
              ref={purchaseMenuRef}
            >
              <button
                type="button"
                className="purchase-menu-trigger"
                aria-label="구매 기록 메뉴"
                aria-haspopup="menu"
                aria-expanded={isPurchaseMenuOpen}
                disabled={isPurchaseDeleting || isEditing}
                onClick={() =>
                  setIsPurchaseMenuOpen((prev) => !prev)
                }
              >
                <Ellipsis size={20} />
              </button>

              {isPurchaseMenuOpen && !isEditing && (
                <div
                  className="purchase-dropdown-menu"
                  role="menu"
                >
                  <button
                    type="button"
                    role="menuitem"
                    className="purchase-menu-item"
                    onClick={handlePurchaseEdit}
                  >
                    <Pencil size={16} />
                    구매 기록 수정
                  </button>

                  <button
                    type="button"
                    role="menuitem"
                    className="purchase-menu-item purchase-menu-delete"
                    onClick={handlePurchaseDelete}
                    disabled={isPurchaseDeleting}
                  >
                    <Trash2 size={16} />
                    {isPurchaseDeleting
                      ? "삭제 중..."
                      : "구매 기록 삭제"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="purchase-record-card">
            <div className="purchase-record-item">
              <CircleDollarSign size={18} />

              <div>
                <span>구매 금액</span>

                {isEditing ? (
                  <input
                    type="number"
                    aria-label="구매 금액"
                    value={purchaseData.amount}
                    readOnly
                  />
                ) : (
                  <strong>
                    {formatPrice(purchaseData.amount)}
                  </strong>
                )}
              </div>
            </div>

            <div className="purchase-record-item">
              <CalendarDays size={18} />

              <div>
                <span>구매 날짜</span>

                {isEditing ? (
                  <input
                    type="date"
                    aria-label="구매 날짜"
                    value={purchaseData.date}
                    readOnly
                  />
                ) : (
                  <strong>
                    {formatDate(purchaseData.date)}
                  </strong>
                )}
              </div>
            </div>

            <div className="purchase-record-item">
              <Store size={18} />

              <div>
                <span>구매처</span>

                {isEditing ? (
                  <input
                    type="text"
                    aria-label="구매처"
                    value={purchaseData.store}
                    readOnly
                  />
                ) : (
                  <strong>{purchaseData.store || "-"}</strong>
                )}
              </div>
            </div>

            <div className="purchase-record-item">
              <FileText size={18} />

              <div>
                <span>메모</span>

                {isEditing ? (
                  <textarea
                    aria-label="구매 메모"
                    value={purchaseData.memo}
                    readOnly
                    rows={2}
                  />
                ) : (
                  <strong>{purchaseData.memo || "-"}</strong>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="product-information-section">
        <div className="product-information-header">
          <h2>
            <FileText size={19} />
            상품 정보
          </h2>
        </div>

        {isEditing ? (
          <div className="product-information-fields">
            <div className="detail-field">
              <label htmlFor="expected-price">
                예상 가격
              </label>

              <div className="detail-input-wrap">
                <input
                  id="expected-price"
                  type="number"
                  min="0"
                  step="1"
                  value={details.expectedPrice}
                  onChange={(event) =>
                    updateField(
                      "expectedPrice",
                      event.target.value,
                    )
                  }
                />
                <span>원</span>
              </div>
            </div>

            <div className="detail-field">
              <label htmlFor="planned-date">
                구매 예정일
              </label>

              <input
                id="planned-date"
                type="date"
                value={details.plannedDate}
                onChange={(event) =>
                  updateField(
                    "plannedDate",
                    event.target.value,
                  )
                }
              />
            </div>

            <div className="detail-field">
              <label htmlFor="purchase-link">
                구매 링크
              </label>

              <input
                id="purchase-link"
                type="url"
                value={details.purchaseLink}
                onChange={(event) =>
                  updateField(
                    "purchaseLink",
                    event.target.value,
                  )
                }
                placeholder="https://"
              />
            </div>

            <div className="detail-field">
              <label htmlFor="product-memo">
                메모
              </label>

              <div className="detail-memo-edit">
                <textarea
                  id="product-memo"
                  value={details.memo}
                  onChange={(event) =>
                    updateField("memo", event.target.value)
                  }
                  maxLength={300}
                  rows={4}
                  placeholder="메모를 입력해 주세요."
                />

                <span>
                  {details.memo.length}/300
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="product-information-readonly">
            <div className="product-readonly-row">
              <span>예상 가격</span>
              <strong>
                {details.expectedPrice
                  ? formatPrice(
                      Number(details.expectedPrice),
                    )
                  : "-"}
              </strong>
            </div>

            <div className="product-readonly-row">
              <span>구매 예정일</span>
              <strong>
                {formatDate(details.plannedDate)}
              </strong>
            </div>

            <div className="product-readonly-row">
              <span>구매 링크</span>

              {details.purchaseLink ? (
                <a
                  href={details.purchaseLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {details.purchaseLink}
                </a>
              ) : (
                <strong>-</strong>
              )}
            </div>

            <div className="product-readonly-row">
              <span>메모</span>
              <strong>{details.memo || "-"}</strong>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default ProductInfo;

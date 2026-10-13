import { useEffect, useState } from "react";
import { X, CalendarDays } from "lucide-react";
import "./PurchaseModal.css";

export type PurchaseData = {
  amount: number;
  date: string;
  store: string;
  memo: string;
};

type PurchaseModalProps = {
  isOpen: boolean;
  productName: string;
  productPrice: number;
  mode?: "create" | "edit";
  initialData?: PurchaseData | null;
  onClose: () => void;
  onSave: (data: PurchaseData) => void | Promise<void>;
};

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function PurchaseModal({
  isOpen,
  productName,
  productPrice,
  mode = "create",
  initialData = null,
  onClose,
  onSave,
}: PurchaseModalProps) {
  const [amount, setAmount] = useState(String(productPrice));
  const [date, setDate] = useState("");
  const [store, setStore] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && initialData) {
      setAmount(String(initialData.amount));
      setDate(initialData.date);
      setStore(initialData.store);
      setMemo(initialData.memo);
    } else {
      setAmount(String(productPrice));
      setDate(getTodayDate());
      setStore("");
      setMemo("");
    }

    setError("");
    setIsSaving(false);
  }, [isOpen, mode, initialData, productPrice]);

  useEffect(() => {
    if (!isOpen || isSaving) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSaving, onClose]);

  if (!isOpen) return null;

  const isEditMode = mode === "edit";

  const handleClose = () => {
    if (isSaving) return;
    onClose();
  };

  const handleSave = async () => {
    if (isSaving) return;

    const purchaseAmount = Number(amount);

    if (
      !amount.trim() ||
      !Number.isSafeInteger(purchaseAmount) ||
      purchaseAmount < 0
    ) {
      setError("올바른 구매 금액을 입력해 주세요.");
      return;
    }

    if (!date) {
      setError("구매 날짜를 선택해 주세요.");
      return;
    }

    if (store.trim().length > 150) {
      setError("구매처는 150자 이내로 입력해 주세요.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      await onSave({
        amount: purchaseAmount,
        date,
        store: store.trim(),
        memo: memo.trim(),
      });
    } catch (error) {
      console.error("구매 기록 저장 실패:", error);
      setError("구매 기록을 저장하지 못했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="purchase-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <div
        className="purchase-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
      >
        <div className="purchase-modal-header">
          <div>
            <h2 id="purchase-modal-title">
              {isEditMode ? "구매 기록 수정" : "구매 기록 추가"}
            </h2>

            <p>
              {isEditMode
                ? "구매한 상품의 정보를 수정해 보세요."
                : "구매한 상품의 정보를 기록해 보세요."}
            </p>
          </div>

          <button
            type="button"
            className="purchase-modal-close"
            onClick={handleClose}
            disabled={isSaving}
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="purchase-modal-product">
          <span className="purchase-modal-product-label">구매 상품</span>
          <strong>{productName}</strong>
          <span>{productPrice.toLocaleString("ko-KR")}원</span>
        </div>

        <div className="purchase-modal-body">
          <div className="purchase-modal-field">
            <label htmlFor="purchase-amount">
              구매 금액 <span className="purchase-required">*</span>
            </label>

            <div className="purchase-modal-input-wrap">
              <input
                id="purchase-amount"
                type="number"
                min="0"
                step="1"
                value={amount}
                disabled={isSaving}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setError("");
                }}
                placeholder="구매 금액을 입력하세요"
              />
              <span>원</span>
            </div>
          </div>

          <div className="purchase-modal-field">
            <label htmlFor="purchase-date">
              구매 날짜 <span className="purchase-required">*</span>
            </label>

            <div className="purchase-modal-input-wrap">
              <input
                id="purchase-date"
                type="date"
                value={date}
                disabled={isSaving}
                onChange={(event) => {
                  setDate(event.target.value);
                  setError("");
                }}
              />
              <CalendarDays size={18} className="purchase-date-icon" />
            </div>
          </div>

          <div className="purchase-modal-field">
            <label htmlFor="purchase-store">
              구매처 <span className="purchase-optional">(선택)</span>
            </label>

            <input
              id="purchase-store"
              type="text"
              value={store}
              disabled={isSaving}
              onChange={(event) => {
                setStore(event.target.value);
                setError("");
              }}
              placeholder="예: 올리브영 온라인몰"
              maxLength={100}
            />
          </div>

          <div className="purchase-modal-field">
            <label htmlFor="purchase-memo">
              구매 메모 <span className="purchase-optional">(선택)</span>
            </label>

            <textarea
              id="purchase-memo"
              value={memo}
              disabled={isSaving}
              onChange={(event) => setMemo(event.target.value)}
              placeholder="구매할 때의 생각을 간단히 기록해 보세요."
              maxLength={300}
              rows={3}
            />

            <span className="purchase-modal-count">{memo.length}/300</span>
          </div>

          {error && (
            <p className="purchase-modal-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="purchase-modal-footer">
          <button
            type="button"
            className="purchase-modal-cancel"
            onClick={handleClose}
            disabled={isSaving}
          >
            취소
          </button>

          <button
            type="button"
            className="purchase-modal-save"
            onClick={() => void handleSave()}
            disabled={isSaving}
          >
            {isSaving ? "저장 중..." : isEditMode ? "수정하기" : "저장하기"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseModal;

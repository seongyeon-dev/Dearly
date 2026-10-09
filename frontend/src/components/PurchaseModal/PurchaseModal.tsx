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
  onClose: () => void;
  onSave: (data: PurchaseData) => void;
};

function PurchaseModal({
  isOpen,
  productName,
  productPrice,
  onClose,
  onSave,
}: PurchaseModalProps) {
  const [amount, setAmount] = useState(String(productPrice));
  const [date, setDate] = useState("");
  const [store, setStore] = useState("");
  const [memo, setMemo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    setAmount(String(productPrice));
    setDate(new Date().toLocaleDateString("en-CA"));
    setStore("");
    setMemo("");
    setError("");
  }, [isOpen, productPrice]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
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

    setError("");

    onSave({
      amount: purchaseAmount,
      date,
      store: store.trim(),
      memo: memo.trim(),
    });
  };

  return (
    <div
      className="purchase-modal-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
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
            <h2 id="purchase-modal-title">구매 기록 추가</h2>
            <p>구매한 상품의 정보를 기록해 보세요.</p>
          </div>

          <button
            type="button"
            className="purchase-modal-close"
            onClick={onClose}
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
              onChange={(event) => setStore(event.target.value)}
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
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className="purchase-modal-save"
            onClick={handleSave}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default PurchaseModal;

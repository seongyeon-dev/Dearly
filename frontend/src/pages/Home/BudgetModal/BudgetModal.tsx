import { useEffect, useState } from "react";
import { X } from "lucide-react";

import "./BudgetModal.css";

type BudgetModalProps = {
  isOpen: boolean;
  budget: number;
  month: string;
  onClose: () => void;
  onSave: (budget: number) => void;
};

function BudgetModal({
  isOpen,
  budget,
  month,
  onClose,
  onSave,
}: BudgetModalProps) {
  const [inputBudget, setInputBudget] = useState(String(budget));
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setInputBudget(String(budget));
      setError("");
    }
  }, [isOpen, budget]);

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

  const formattedMonth = `${month.slice(0, 4)}년 ${Number(month.slice(5))}월`;

  const previewBudget = Number(inputBudget);

  const handleSave = () => {
    if (
      inputBudget.trim() === "" ||
      !Number.isSafeInteger(previewBudget) ||
      previewBudget < 0
    ) {
      setError("0원 이상의 올바른 예산을 입력해 주세요.");
      return;
    }

    onSave(previewBudget);
  };

  return (
    <div className="budget-modal-overlay" onClick={onClose}>
      <div
        className="budget-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="budget-modal-header">
          <h2 id="budget-modal-title">월 예산 설정</h2>

          <button
            type="button"
            className="budget-modal-close"
            onClick={onClose}
            aria-label="닫기"
          >
            <X size={20} strokeWidth={1.7} />
          </button>
        </div>

        <p className="budget-modal-description">
          이번 달 사용할 예산을 설정해 주세요.
        </p>

        <div className="budget-modal-field">
          <label htmlFor="budget-month">설정 월</label>

          <input
            id="budget-month"
            type="text"
            value={formattedMonth}
            readOnly
          />
        </div>

        <div className="budget-modal-field">
          <label htmlFor="budget-amount">월 예산</label>

          <div className="budget-modal-input-wrap">
            <input
              id="budget-amount"
              type="number"
              min="0"
              step="1"
              value={inputBudget}
              onChange={(event) => {
                setInputBudget(event.target.value);
                setError("");
              }}
              placeholder="예산을 입력하세요"
              aria-invalid={Boolean(error)}
            />
            <span>원</span>
          </div>

          {error && (
            <p className="budget-modal-error" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="budget-modal-preview">
          <span>설정할 월 예산</span>

          <strong>
            {Number.isFinite(previewBudget) && previewBudget >= 0
              ? previewBudget.toLocaleString("ko-KR")
              : "0"}
            원
          </strong>
        </div>

        <div className="budget-modal-info">
          월 예산을 변경하면 남은 예산과 사용률에 자동으로 반영됩니다.
        </div>

        <div className="budget-modal-actions">
          <button
            type="button"
            className="budget-modal-cancel"
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className="budget-modal-save"
            onClick={handleSave}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default BudgetModal;

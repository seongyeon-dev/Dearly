import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, CreditCard, CircleDollarSign } from "lucide-react";

import BudgetModal from "../BudgetModal/BudgetModal";

import "./MonthlySummary.css";

function MonthlySummary() {
  const navigate = useNavigate();

  const [budget, setBudget] = useState(500000);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const spentAmount = 327000;
  const month = "2026-10";

  const remainingBudget = budget - spentAmount;

  const usedPercent = budget > 0 ? Math.round((spentAmount / budget) * 100) : 0;

  const remainingPercent = budget > 0 ? Math.max(0, 100 - usedPercent) : 0;

  const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

  return (
    <>
      <div className="monthly-card">
        <div className="monthly-header">
          <div>
            <h2>10월의 소비</h2>
            <p>2026.10.01 - 2026.10.31</p>
          </div>

          <button
            type="button"
            className="monthly-more-button"
            onClick={() => navigate("/statistics")}
          >
            전체보기 ›
          </button>
        </div>

        <div className="monthly-stats">
          <div className="stat-item">
            <div className="stat-icon">
              <ShoppingBag size={24} strokeWidth={1.6} />
            </div>

            <div className="stat-text">
              <div className="budget-label">
                <span>총 예산</span>

                <button
                  type="button"
                  className="budget-edit-button"
                  onClick={() => setIsModalOpen(true)}
                >
                  예산 수정
                </button>
              </div>

              <strong>{formatPrice(budget)}</strong>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <CreditCard size={24} strokeWidth={1.6} />
            </div>

            <div className="stat-text">
              <span>사용 금액</span>
              <strong>{formatPrice(spentAmount)}</strong>
              <small>{usedPercent}% 사용</small>
            </div>
          </div>

          <div className="stat-item remaining">
            <div className="stat-icon">
              <CircleDollarSign size={24} strokeWidth={1.6} />
            </div>

            <div className="stat-text">
              <span>남은 예산</span>
              <strong>{formatPrice(remainingBudget)}</strong>
              <small>
                {remainingBudget < 0
                  ? "예산 초과"
                  : `${remainingPercent}% 남음`}
              </small>
            </div>
          </div>
        </div>

        <div className="budget-progress">
          <div className="progress-row">
            <div className="progress-bar">
              <div
                className="progress-value"
                style={{
                  width: `${Math.min(100, usedPercent)}%`,
                }}
              />
            </div>

            <strong>{usedPercent}%</strong>
          </div>

          <p>
            {formatPrice(spentAmount)} / {formatPrice(budget)}
          </p>
        </div>
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        budget={budget}
        month={month}
        onClose={() => setIsModalOpen(false)}
        onSave={(newBudget) => {
          setBudget(newBudget);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}

export default MonthlySummary;

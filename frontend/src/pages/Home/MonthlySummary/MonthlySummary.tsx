
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, CreditCard, CircleDollarSign } from "lucide-react";

import BudgetModal from "../BudgetModal/BudgetModal";
import { getMonthlyTotal } from "../../../utils/purchaseStorage";

import "./MonthlySummary.css";

type MonthlySummaryProps = {
  selectedMonth?: string;
};

const DEFAULT_BUDGET = 500000;

function getCurrentMonth(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function getSavedBudget(month: string): number {
  try {
    const savedBudget = localStorage.getItem(`dearly-budget-${month}`);

    if (savedBudget === null) {
      return DEFAULT_BUDGET;
    }

    const parsedBudget = Number(savedBudget);

    if (Number.isFinite(parsedBudget) && parsedBudget >= 0) {
      return parsedBudget;
    }

    return DEFAULT_BUDGET;
  } catch {
    return DEFAULT_BUDGET;
  }
}

function MonthlySummary({ selectedMonth }: MonthlySummaryProps) {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  const month = selectedMonth || getCurrentMonth();

  const [yearString, monthString] = month.split("-");

  const year = Number(yearString);
  const monthNumber = Number(monthString);

  const lastDay = new Date(year, monthNumber, 0).getDate();

  const startDate = `${yearString}.${monthString}.01`;
  const endDate = `${yearString}.${monthString}.${String(lastDay).padStart(
    2,
    "0",
  )}`;

  const budget = budgets[month] ?? getSavedBudget(month);

  const spentAmount = getMonthlyTotal(month);

  const remainingBudget = budget - spentAmount;

  const usedPercent =
    budget > 0 ? Math.round((spentAmount / budget) * 100) : 0;

  const remainingPercent =
    budget > 0 ? Math.max(0, 100 - usedPercent) : 0;

  const formatPrice = (price: number) =>
    `${price.toLocaleString("ko-KR")}원`;

  const handleSaveBudget = (newBudget: number) => {
    try {
      localStorage.setItem(`dearly-budget-${month}`, String(newBudget));
    } catch {
      alert("예산을 저장하지 못했습니다.");
      return;
    }

    setBudgets((previous) => ({
      ...previous,
      [month]: newBudget,
    }));

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="monthly-card">
        <div className="monthly-header">
          <div>
            <h2>{monthNumber}월의 소비</h2>
            <p>
              {startDate} - {endDate}
            </p>
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
        key={month}
        isOpen={isModalOpen}
        budget={budget}
        month={month}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBudget}
      />
    </>
  );
}

export default MonthlySummary;

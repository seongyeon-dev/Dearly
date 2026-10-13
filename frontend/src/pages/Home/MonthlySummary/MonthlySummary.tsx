import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, CreditCard, CircleDollarSign } from "lucide-react";

import BudgetModal from "../BudgetModal/BudgetModal";
import { fetchPurchases } from "../../../api/purchaseApi";
import { fetchBudget, saveBudget } from "../../../api/budgetApi";

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

function MonthlySummary({ selectedMonth }: MonthlySummaryProps) {
  const navigate = useNavigate();

  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [spentAmount, setSpentAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [budgetLoading, setBudgetLoading] = useState(true);
  const [budgetError, setBudgetError] = useState("");

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

  const budget = budgets[month] ?? DEFAULT_BUDGET;

  useEffect(() => {
    let cancelled = false;

    async function loadMonthlyData() {
      setIsLoading(true);
      setBudgetLoading(true);
      setLoadError("");
      setBudgetError("");
      setSpentAmount(0);

      try {
        const [purchasesResult, budgetResult] = await Promise.allSettled([
          fetchPurchases(),
          fetchBudget(month),
        ]);

        if (cancelled) return;

        if (purchasesResult.status === "fulfilled") {
          const monthlyTotal = purchasesResult.value
            .filter((purchase) => purchase.purchased_at.startsWith(month))
            .reduce((total, purchase) => total + Number(purchase.amount), 0);

          setSpentAmount(monthlyTotal);
        } else {
          console.error("월별 소비 금액 조회 실패:", purchasesResult.reason);
          setLoadError("소비 금액을 불러오지 못했습니다.");
        }

        if (budgetResult.status === "fulfilled") {
          setBudgets((previous) => ({
            ...previous,
            [month]: budgetResult.value?.limit_amount ?? DEFAULT_BUDGET,
          }));
        } else {
          console.error("예산 조회 실패:", budgetResult.reason);
          setBudgetError("예산을 불러오지 못했습니다.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          setBudgetLoading(false);
        }
      }
    }

    void loadMonthlyData();

    return () => {
      cancelled = true;
    };
  }, [month]);

  const remainingBudget = budget - spentAmount;

  const usedPercent = budget > 0 ? Math.round((spentAmount / budget) * 100) : 0;

  const remainingPercent = budget > 0 ? Math.max(0, 100 - usedPercent) : 0;

  const formatPrice = (price: number) => `${price.toLocaleString("ko-KR")}원`;

  const handleSaveBudget = async (newBudget: number) => {
    try {
      const savedBudget = await saveBudget({
        month,
        amount: newBudget,
      });

      setBudgets((previous) => ({
        ...previous,
        [month]: savedBudget.limit_amount,
      }));

      setBudgetError("");
      setIsModalOpen(false);
    } catch (error) {
      console.error("예산 저장 실패:", error);
      alert("예산을 저장하지 못했습니다.");
    }
  };

  const hasError = Boolean(loadError || budgetError);
  const loading = isLoading || budgetLoading;

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
                  disabled={budgetLoading || Boolean(budgetError)}
                >
                  예산 수정
                </button>
              </div>

              <strong>
                {budgetLoading
                  ? "불러오는 중..."
                  : budgetError || formatPrice(budget)}
              </strong>
            </div>
          </div>

          <div className="stat-item">
            <div className="stat-icon">
              <CreditCard size={24} strokeWidth={1.6} />
            </div>

            <div className="stat-text">
              <span>사용 금액</span>
              <strong>
                {isLoading
                  ? "불러오는 중..."
                  : loadError || formatPrice(spentAmount)}
              </strong>

              {!isLoading && !loadError && <small>{usedPercent}% 사용</small>}
            </div>
          </div>

          <div className="stat-item remaining">
            <div className="stat-icon">
              <CircleDollarSign size={24} strokeWidth={1.6} />
            </div>

            <div className="stat-text">
              <span>남은 예산</span>
              <strong>
                {loading
                  ? "불러오는 중..."
                  : loadError || budgetError || formatPrice(remainingBudget)}
              </strong>

              {!loading && !hasError && (
                <small>
                  {remainingBudget < 0
                    ? "예산 초과"
                    : `${remainingPercent}% 남음`}
                </small>
              )}
            </div>
          </div>
        </div>

        <div className="budget-progress">
          <div className="progress-row">
            <div className="progress-bar">
              <div
                className="progress-value"
                style={{
                  width:
                    loading || hasError
                      ? "0%"
                      : `${Math.min(100, Math.max(0, usedPercent))}%`,
                }}
              />
            </div>

            <strong>{loading || hasError ? "-" : `${usedPercent}%`}</strong>
          </div>

          <p>
            {loading
              ? "예산 정보를 불러오는 중..."
              : loadError ||
                budgetError ||
                `${formatPrice(spentAmount)} / ${formatPrice(budget)}`}
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

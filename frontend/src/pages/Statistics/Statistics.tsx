import { useEffect, useState } from "react";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import { fetchPurchases } from "../../api/purchaseApi";
import { fetchWishes } from "../../api/wishApi";
import type { CategorySpendingData } from "../../types/statistics";

import CategorySpending from "./CategorySpending/CategorySpending";
import MonthlyChart from "./MonthlyChart/MonthlyChart";

import "./Statistics.css";

const categoryList = [
  { name: "뷰티", code: "BEAUTY", className: "beauty" },
  { name: "패션", code: "FASHION", className: "fashion" },
  { name: "라이프스타일", code: "LIFESTYLE", className: "lifestyle" },
  { name: "기타", code: "OTHER", className: "other" },
];

type MonthlySpendingItem = {
  month: number;
  amount: number;
  categories: CategorySpendingData[];
};

function createEmptyMonthlySpending(): MonthlySpendingItem[] {
  return Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    amount: 0,
    categories: categoryList.map((category) => ({
      name: category.name,
      className: category.className,
      amount: 0,
      percentage: 0,
    })),
  }));
}

function Statistics() {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const [monthlySpending, setMonthlySpending] = useState<MonthlySpendingItem[]>(
    createEmptyMonthlySpending,
  );

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadStatistics() {
      setIsLoading(true);
      setLoadError("");
      setMonthlySpending(createEmptyMonthlySpending());

      try {
        const [purchases, wishes] = await Promise.all([
          fetchPurchases(),
          fetchWishes(),
        ]);

        if (cancelled) return;

        const wishMap = new Map(wishes.map((wish) => [wish.wish_id, wish]));

        const yearlyPurchases = purchases.filter((purchase) =>
          purchase.purchased_at.startsWith(`${selectedYear}-`),
        );

        const calculatedMonthlySpending = Array.from(
          { length: 12 },
          (_, index) => {
            const month = index + 1;

            const monthKey = `${selectedYear}-${String(month).padStart(
              2,
              "0",
            )}`;

            const monthPurchases = yearlyPurchases.filter((purchase) =>
              purchase.purchased_at.startsWith(monthKey),
            );

            const amount = monthPurchases.reduce(
              (total, purchase) => total + Number(purchase.amount),
              0,
            );

            const categories: CategorySpendingData[] = categoryList.map(
              (category) => {
                const categoryAmount = monthPurchases
                  .filter((purchase) => {
                    const wish = wishMap.get(purchase.wish_id);

                    return wish?.category === category.code;
                  })
                  .reduce(
                    (total, purchase) => total + Number(purchase.amount),
                    0,
                  );

                return {
                  name: category.name,
                  className: category.className,
                  amount: categoryAmount,
                  percentage:
                    amount > 0
                      ? Math.round((categoryAmount / amount) * 100)
                      : 0,
                };
              },
            );

            return {
              month,
              amount,
              categories,
            };
          },
        );

        setMonthlySpending(calculatedMonthlySpending);
      } catch (error) {
        if (cancelled) return;

        console.error("소비 통계 조회 실패:", error);

        setLoadError("소비 통계를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadStatistics();

    return () => {
      cancelled = true;
    };
  }, [selectedYear]);

  const selectedMonthData = monthlySpending.find(
    (item) => item.month === selectedMonth,
  );

  const categorySpending = selectedMonthData?.categories ?? [];

  const totalSpending = selectedMonthData?.amount ?? 0;

  const selectedMonthKey = `${selectedYear}-${String(selectedMonth).padStart(
    2,
    "0",
  )}`;

  return (
    <main className="statistics">
      <div className="statistics-container">
        <div className="statistics-header">
          <div>
            <h1>나의 소비 통계</h1>
            <p>한눈에 보는 소비 패턴을 확인해보세요.</p>
          </div>

          <select
            className="statistics-year"
            value={selectedYear}
            onChange={(event) => setSelectedYear(event.target.value)}
          >
            <option value="2026">2026년</option>
            <option value="2025">2025년</option>
            <option value="2024">2024년</option>
          </select>
        </div>

        <div className="statistics-months">
          {monthlySpending.map((item) => (
            <button
              key={item.month}
              type="button"
              className={`statistics-month ${
                selectedMonth === item.month ? "active" : ""
              }`}
              onClick={() => setSelectedMonth(item.month)}
            >
              {item.month}월
            </button>
          ))}
        </div>

        {isLoading ? (
          <p>소비 통계를 불러오는 중입니다...</p>
        ) : loadError ? (
          <p>{loadError}</p>
        ) : (
          <>
            <MonthlyChart
              monthlySpending={monthlySpending}
              selectedMonth={selectedMonth}
              onMonthChange={setSelectedMonth}
            />

            <div className="category-statistics">
              <CategorySpending
                selectedMonth={selectedMonth}
                categories={categorySpending}
                totalSpending={totalSpending}
              />

              <div className="category-chart-wrapper">
                <CategoryChart selectedMonth={selectedMonthKey} />
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default Statistics;

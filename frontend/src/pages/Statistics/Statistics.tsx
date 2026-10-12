import { useState } from "react";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import type { CategorySpendingData } from "../../types/statistics";
import { getMonthlyPurchases } from "../../utils/purchaseStorage";

import CategorySpending from "./CategorySpending/CategorySpending";
import MonthlyChart from "./MonthlyChart/MonthlyChart";

import "./Statistics.css";

const categoryList = [
  { name: "뷰티", className: "beauty" },
  { name: "패션", className: "fashion" },
  { name: "라이프스타일", className: "lifestyle" },
  { name: "기타", className: "other" },
];

function Statistics() {
  const today = new Date();

  const [selectedYear, setSelectedYear] = useState(String(today.getFullYear()));

  const [selectedMonth, setSelectedMonth] = useState(today.getMonth() + 1);

  const monthlySpending = Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const monthKey = `${selectedYear}-${String(month).padStart(2, "0")}`;

    const purchases = getMonthlyPurchases(monthKey);

    const amount = purchases.reduce(
      (total, purchase) => total + purchase.amount,
      0,
    );

    const categories: CategorySpendingData[] = categoryList.map((category) => {
      const categoryAmount = purchases
        .filter((purchase) => purchase.category === category.name)
        .reduce((total, purchase) => total + purchase.amount, 0);

      return {
        name: category.name,
        className: category.className,
        amount: categoryAmount,
        percentage:
          amount > 0 ? Math.round((categoryAmount / amount) * 100) : 0,
      };
    });

    return {
      month,
      amount,
      categories,
    };
  });

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
      </div>
    </main>
  );
}

export default Statistics;

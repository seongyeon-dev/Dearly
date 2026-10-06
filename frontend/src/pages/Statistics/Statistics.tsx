import { useState } from "react";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import type { CategorySpendingData } from "../../types/statistics";
import CategorySpending from "./CategorySpending/CategorySpending";
import MonthlyChart from "./MonthlyChart/MonthlyChart";
import { monthlySpending } from "./statisticsData";

import "./Statistics.css";

function Statistics() {
  const [selectedYear, setSelectedYear] = useState("2026");
  const [selectedMonth, setSelectedMonth] = useState(10);

  const selectedMonthData =
    monthlySpending.find((item) => item.month === selectedMonth) ??
    monthlySpending[0];

  const categorySpending = selectedMonthData.categories;

  const totalSpending = categorySpending.reduce(
    (total, category) => total + category.amount,
    0,
  );

  const yearlyTotalSpending = monthlySpending.reduce(
    (total, month) => total + month.amount,
    0,
  );

  const yearlyCategoryAmounts = monthlySpending.reduce(
    (totals, month) => {
      month.categories.forEach((category) => {
        totals[category.className] =
          (totals[category.className] ?? 0) + category.amount;
      });

      return totals;
    },
    {} as Record<string, number>,
  );

  const yearlyCategories: CategorySpendingData[] = [
    {
      name: "뷰티",
      amount: yearlyCategoryAmounts.beauty ?? 0,
      percentage:
        yearlyTotalSpending > 0
          ? Math.round(
              ((yearlyCategoryAmounts.beauty ?? 0) / yearlyTotalSpending) * 100,
            )
          : 0,
      className: "beauty",
    },
    {
      name: "패션",
      amount: yearlyCategoryAmounts.fashion ?? 0,
      percentage:
        yearlyTotalSpending > 0
          ? Math.round(
              ((yearlyCategoryAmounts.fashion ?? 0) / yearlyTotalSpending) *
                100,
            )
          : 0,
      className: "fashion",
    },
    {
      name: "라이프스타일",
      amount: yearlyCategoryAmounts.lifestyle ?? 0,
      percentage:
        yearlyTotalSpending > 0
          ? Math.round(
              ((yearlyCategoryAmounts.lifestyle ?? 0) / yearlyTotalSpending) *
                100,
            )
          : 0,
      className: "lifestyle",
    },
    {
      name: "기타",
      amount: yearlyCategoryAmounts.other ?? 0,
      percentage:
        yearlyTotalSpending > 0
          ? Math.round(
              ((yearlyCategoryAmounts.other ?? 0) / yearlyTotalSpending) * 100,
            )
          : 0,
      className: "other",
    },
  ];

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
            <CategoryChart
              categories={yearlyCategories}
              totalSpending={yearlyTotalSpending}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

export default Statistics;

import { getMonthlyPurchases } from "../../utils/purchaseStorage";

import "./CategoryChart.css";

type Category = {
  name: string;
  amount: number;
  percentage: number;
  className: string;
};

type CategoryChartProps = {
  selectedMonth: string;
};

const categoryNames = [
  { name: "뷰티", className: "beauty", color: "var(--color-primary)" },
  { name: "패션", className: "fashion", color: "#ef91ad" },
  { name: "라이프스타일", className: "lifestyle", color: "#c8a9ed" },
  { name: "기타", className: "other", color: "#e8c9d5" },
];

function CategoryChart({ selectedMonth }: CategoryChartProps) {
  const purchases = getMonthlyPurchases(selectedMonth);

  const totalSpending = purchases.reduce(
    (total, purchase) => total + purchase.amount,
    0,
  );

  const categories: Category[] = categoryNames.map((category) => {
    const amount = purchases
      .filter((purchase) => purchase.category === category.name)
      .reduce((total, purchase) => total + purchase.amount, 0);

    const percentage = totalSpending > 0 ? (amount / totalSpending) * 100 : 0;

    return {
      name: category.name,
      amount,
      percentage,
      className: category.className,
    };
  });

  let currentPercentage = 0;

  const gradientParts = categories.map((category, index) => {
    const start = currentPercentage;
    const end = start + category.percentage;

    currentPercentage = end;

    return `${categoryNames[index].color} ${start}% ${end}%`;
  });

  const donutBackground =
    totalSpending > 0
      ? `conic-gradient(${gradientParts.join(", ")})`
      : "var(--color-primary-bg)";

  return (
    <section className="category-chart-card">
      <h2>카테고리별 소비 비율</h2>

      <div className="category-chart-content">
        <div className="category-donut" style={{ background: donutBackground }}>
          <div className="category-donut-center">
            <span className="category-donut-label">총 소비</span>

            <strong className="category-donut-total">
              {totalSpending.toLocaleString("ko-KR")}원
            </strong>
          </div>
        </div>

        <div className="category-chart-legend">
          {categories.map((category) => (
            <div className="category-chart-legend-item" key={category.name}>
              <div className="category-chart-label">
                <span className={`category-chart-dot ${category.className}`} />
                <span>{category.name}</span>
              </div>

              <strong>{Math.round(category.percentage)}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryChart;

import "./CategoryChart.css";

type Category = {
  name: string;
  amount: number;
  percentage: number;
  className: string;
};

type CategoryChartProps = {
  categories?: Category[];
  totalSpending?: number;
};

const defaultCategories: Category[] = [
  {
    name: "뷰티",
    amount: 677000,
    percentage: 40,
    className: "beauty",
  },
  {
    name: "패션",
    amount: 472000,
    percentage: 28,
    className: "fashion",
  },
  {
    name: "라이프스타일",
    amount: 345000,
    percentage: 21,
    className: "lifestyle",
  },
  {
    name: "기타",
    amount: 178000,
    percentage: 11,
    className: "other",
  },
];

function CategoryChart({
  categories = defaultCategories,
  totalSpending,
}: CategoryChartProps) {
  const total =
    totalSpending ??
    categories.reduce((sum, category) => sum + category.amount, 0);

  const hasSpending = total > 0;

  const beautyPercentage = categories[0]?.percentage ?? 0;
  const fashionPercentage = categories[1]?.percentage ?? 0;
  const lifestylePercentage = categories[2]?.percentage ?? 0;

  const beautyEnd = beautyPercentage;
  const fashionEnd = beautyEnd + fashionPercentage;
  const lifestyleEnd = fashionEnd + lifestylePercentage;

  const donutBackground = hasSpending
    ? `conic-gradient(
        var(--color-primary) 0% ${beautyEnd}%,
        #ef91ad ${beautyEnd}% ${fashionEnd}%,
        #c8a9ed ${fashionEnd}% ${lifestyleEnd}%,
        #e8c9d5 ${lifestyleEnd}% 100%
      )`
    : "var(--color-primary-bg)";

  return (
    <section className="category-chart-card">
      <h2>카테고리별 소비 비율</h2>

      <div className="category-chart-content">
        <div className="category-donut" style={{ background: donutBackground }}>
          <div className="category-donut-center">
            <span className="category-donut-label">총 소비</span>

            <strong className="category-donut-total">
              {total.toLocaleString()}원
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

              <strong>{category.percentage}%</strong>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default CategoryChart;

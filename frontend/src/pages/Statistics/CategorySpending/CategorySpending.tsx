import "./CategorySpending.css";

type Category = {
  name: string;
  amount: number;
  percentage: number;
  className: string;
};

type CategorySpendingProps = {
  selectedMonth: number;
  categories: Category[];
  totalSpending: number;
};

function CategorySpending({
  selectedMonth,
  categories,
  totalSpending,
}: CategorySpendingProps) {
  return (
    <section className="category-spending-card">
      <h2>{selectedMonth}월 카테고리별 소비 금액</h2>

      <div className="category-spending-list">
        {categories.map((category) => (
          <div className="category-spending-item" key={category.name}>
            <span className="category-name">{category.name}</span>

            <div className="category-progress">
              <div
                className={`category-progress-bar ${category.className}`}
                style={{
                  width: `${category.percentage}%`,
                }}
              />
            </div>

            <strong>{category.amount.toLocaleString()}원</strong>
          </div>
        ))}
      </div>

      <div className="category-total">
        <span>총 소비 금액</span>

        <strong>{totalSpending.toLocaleString()}원</strong>
      </div>
    </section>
  );
}

export default CategorySpending;

import { useEffect, useState } from "react";

import { fetchPurchases } from "../../api/purchaseApi";
import { fetchWishes } from "../../api/wishApi";

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
  {
    name: "뷰티",
    code: "BEAUTY",
    className: "beauty",
    color: "var(--color-primary)",
  },
  {
    name: "패션",
    code: "FASHION",
    className: "fashion",
    color: "#ef91ad",
  },
  {
    name: "라이프스타일",
    code: "LIFESTYLE",
    className: "lifestyle",
    color: "#c8a9ed",
  },
  {
    name: "기타",
    code: "OTHER",
    className: "other",
    color: "#e8c9d5",
  },
];

function CategoryChart({ selectedMonth }: CategoryChartProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalSpending, setTotalSpending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadCategorySpending() {
      setIsLoading(true);
      setLoadError("");
      setCategories([]);
      setTotalSpending(0);

      try {
        const [purchases, wishes] = await Promise.all([
          fetchPurchases(),
          fetchWishes(),
        ]);

        if (cancelled) return;

        const wishMap = new Map(wishes.map((wish) => [wish.wish_id, wish]));

        const monthlyPurchases = purchases.filter((purchase) =>
          purchase.purchased_at.startsWith(selectedMonth),
        );

        const total = monthlyPurchases.reduce(
          (sum, purchase) => sum + Number(purchase.amount),
          0,
        );

        const calculatedCategories = categoryNames.map((category) => {
          const amount = monthlyPurchases
            .filter((purchase) => {
              const wish = wishMap.get(purchase.wish_id);

              return wish?.category === category.code;
            })
            .reduce((sum, purchase) => sum + Number(purchase.amount), 0);

          return {
            name: category.name,
            amount,
            percentage: total > 0 ? (amount / total) * 100 : 0,
            className: category.className,
          };
        });

        setTotalSpending(total);
        setCategories(calculatedCategories);
      } catch (error) {
        if (cancelled) return;

        console.error("카테고리별 소비 조회 실패:", error);
        setLoadError("소비 통계를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadCategorySpending();

    return () => {
      cancelled = true;
    };
  }, [selectedMonth]);

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
              {isLoading
                ? "불러오는 중..."
                : loadError || `${totalSpending.toLocaleString("ko-KR")}원`}
            </strong>
          </div>
        </div>

        <div className="category-chart-legend">
          {categories.length > 0 ? (
            categories.map((category) => (
              <div className="category-chart-legend-item" key={category.name}>
                <div className="category-chart-label">
                  <span
                    className={`category-chart-dot ${category.className}`}
                  />
                  <span>{category.name}</span>
                </div>

                <strong>{Math.round(category.percentage)}%</strong>
              </div>
            ))
          ) : (
            <p>
              {isLoading
                ? "소비 통계를 불러오는 중..."
                : loadError || "소비 내역이 없습니다."}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default CategoryChart;

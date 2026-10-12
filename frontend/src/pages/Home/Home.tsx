import { useState } from "react";
import { useNavigate } from "react-router-dom";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import MonthSelector from "../../components/MonthSelector/MonthSelector";
import WishlistCard from "../../components/WishlistCard/WishlistCard";
import type { Wish } from "../../types/wish";
import { getWishlistProducts } from "../../utils/wishlistStorage";
import MonthlySummary from "./MonthlySummary/MonthlySummary";

import "./Home.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

const statusMap: Record<ProductStatus, Pick<Wish, "status" | "statusClass">> = {
  WANT: {
    status: "사고 싶어요",
    statusClass: "want",
  },
  CONSIDERING: {
    status: "고민 중",
    statusClass: "considering",
  },
  BOUGHT: {
    status: "샀어요",
    statusClass: "bought",
  },
};

function isProductStatus(value: unknown): value is ProductStatus {
  return value === "WANT" || value === "CONSIDERING" || value === "BOUGHT";
}

function getDeletedProductIds(): number[] {
  try {
    const saved = localStorage.getItem("dearly-deleted-products");

    if (!saved) {
      return [];
    }

    const parsed: unknown = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(
      (id): id is number => typeof id === "number" && Number.isInteger(id),
    );
  } catch {
    return [];
  }
}

function getRecentWishlistItems(): Wish[] {
  const deletedIds = getDeletedProductIds();

  return getWishlistProducts()
    .filter((item) => !deletedIds.includes(item.id))
    .map((item): Wish => {
      try {
        const saved = localStorage.getItem(`dearly-product-detail-${item.id}`);

        if (!saved) {
          return item;
        }

        const parsed: unknown = JSON.parse(saved);

        if (
          typeof parsed !== "object" ||
          parsed === null ||
          !("status" in parsed) ||
          !isProductStatus(parsed.status)
        ) {
          return item;
        }

        return {
          ...item,
          ...statusMap[parsed.status],
        };
      } catch {
        return item;
      }
    })
    .sort((a, b) => b.id - a.id)
    .slice(0, 4);
}

function getCurrentMonth(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(
    2,
    "0",
  )}`;
}

function Home() {
  const navigate = useNavigate();

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const recentWishlistItems = getRecentWishlistItems();

  return (
    <main className="home">
      <div className="home-container">
        <section className="home-header">
          <div>
            <h1>Home</h1>
            <p>나의 위시와 소비를 한눈에 확인해보세요</p>
          </div>

          <MonthSelector value={selectedMonth} onChange={setSelectedMonth} />
        </section>

        <section className="dashboard-summary">
          <MonthlySummary selectedMonth={selectedMonth} />

          <CategoryChart selectedMonth={selectedMonth} />
        </section>

        <section className="recent-wishlist">
          <div className="wishlist-header">
            <h2>최근 추가한 위시 상품</h2>

            <button
              type="button"
              className="wishlist-more-button"
              onClick={() => navigate("/wishlist")}
            >
              더보기 ›
            </button>
          </div>

          <div className="wishlist-grid">
            {recentWishlistItems.length > 0 ? (
              recentWishlistItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(`/wishlist/${item.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <WishlistCard
                    productId={item.id}
                    name={item.name}
                    price={item.price}
                    status={item.status}
                    statusClass={item.statusClass}
                  />
                </div>
              ))
            ) : (
              <p>등록된 위시 상품이 없습니다.</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;

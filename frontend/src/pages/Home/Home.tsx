import { useNavigate } from "react-router-dom";

import CategoryChart from "../../components/CategoryChart/CategoryChart";
import WishlistCard from "../../components/WishlistCard/WishlistCard";
import type { Wish } from "../../types/wish";
import MonthlySummary from "./MonthlySummary/MonthlySummary";

import "./Home.css";

const wishlistItems: Wish[] = [
  {
    id: 1,
    name: "롬앤 쥬시래스팅 틴트",
    price: "13,000원",
    category: "BEAUTY",
    status: "사고 싶어요",
    statusClass: "want",
  },
  {
    id: 2,
    name: "에스트라 아토베리어 크림",
    price: "32,000원",
    category: "BEAUTY",
    status: "고민 중",
    statusClass: "considering",
  },
  {
    id: 3,
    name: "나이키 에어포스 1",
    price: "139,000원",
    category: "FASHION",
    status: "샀어요",
    statusClass: "bought",
  },
  {
    id: 4,
    name: "무인양품 테이블 조명",
    price: "59,000원",
    category: "LIFESTYLE",
    status: "사고 싶어요",
    statusClass: "want",
  },
];

function Home() {
  const navigate = useNavigate();

  return (
    <main className="home">
      <div className="home-container">
        <section className="home-header">
          <div>
            <h1>Home</h1>
            <p>나의 위시와 소비를 한눈에 확인해보세요</p>
          </div>

          <select className="month-select" defaultValue="2026-10">
            <option value="2026-10">2026년 10월</option>
            <option value="2026-09">2026년 9월</option>
            <option value="2026-08">2026년 8월</option>
          </select>
        </section>

        <section className="dashboard-summary">
          <MonthlySummary />
          <CategoryChart />
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
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item.id}
                name={item.name}
                price={item.price}
                status={item.status}
                statusClass={item.statusClass}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default Home;

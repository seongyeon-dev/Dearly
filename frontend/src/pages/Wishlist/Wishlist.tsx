import { Grid2X2, List } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import WishlistCard from "../../components/WishlistCard/WishlistCard";
import "./Wishlist.css";

const wishlistItems = [
  {
    id: 1,
    name: "롬앤 쥬시래스팅 틴트",
    price: "13,000원",
    status: "사고 싶어요",
    statusClass: "want" as const,
  },
  {
    id: 2,
    name: "에스트라 아토베리어 크림",
    price: "32,000원",
    status: "고민 중",
    statusClass: "considering" as const,
  },
  {
    id: 3,
    name: "나이키 에어포스 1",
    price: "139,000원",
    status: "샀어요",
    statusClass: "bought" as const,
  },
  {
    id: 4,
    name: "클리오 킬커버 쿠션",
    price: "32,000원",
    status: "고민 중",
    statusClass: "considering" as const,
  },
  {
    id: 5,
    name: "무인양품 테이블 조명",
    price: "59,000원",
    status: "사고 싶어요",
    statusClass: "want" as const,
  },
  {
    id: 6,
    name: "폴로 케이블 니트",
    price: "169,000원",
    status: "사고 싶어요",
    statusClass: "want" as const,
  },
];

function Wishlist() {
  const navigate = useNavigate();

  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  return (
    <main className="wishlist-page">
      <div className="wishlist-container">
        <section className="wishlist-page-header">
          <div>
            <h1>My Wishlist</h1>
            <p>사고 싶은 것들을 모아보세요.</p>
          </div>

          <button
            type="button"
            className="add-wish-button"
            onClick={() => navigate("/wishlist/new")}
          >
            + 상품 추가하기
          </button>
        </section>

        <section className="wishlist-toolbar">
          <select className="wishlist-sort" defaultValue="latest">
            <option value="latest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="price-low">낮은 가격순</option>
            <option value="price-high">높은 가격순</option>
          </select>

          <div className="view-buttons">
            <button
              type="button"
              className={viewType === "grid" ? "active" : ""}
              onClick={() => setViewType("grid")}
              aria-label="그리드 보기"
            >
              <Grid2X2 size={16} strokeWidth={1.5} />
            </button>

            <button
              type="button"
              className={viewType === "list" ? "active" : ""}
              onClick={() => setViewType("list")}
              aria-label="리스트 보기"
            >
              <List size={17} strokeWidth={1.5} />
            </button>
          </div>
        </section>

        <section
          className={`wishlist-items ${viewType === "list" ? "list-view" : ""}`}
        >
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="wishlist-card-link"
              onClick={() => navigate(`/wishlist/${item.id}`)}
            >
              <WishlistCard
                name={item.name}
                price={item.price}
                status={item.status}
                statusClass={item.statusClass}
              />
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

export default Wishlist;

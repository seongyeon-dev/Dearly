import type { Purchase } from "../../types/purchase";

import PurchaseItem from "./PurchaseItem/PurchaseItem";
import PurchaseSummary from "./PurchaseSummary/PurchaseSummary";

import "./PurchaseHistory.css";

const purchaseItems: Purchase[] = [
  {
    wishId: 1,
    name: "롬앤 쥬시래스팅 틴트",
    category: "뷰티",
    date: "2026.09.30",
    price: "13,000원",
  },
  {
    wishId: 2,
    name: "에스트라 아토베리어 크림",
    category: "뷰티",
    date: "2026.09.28",
    price: "32,000원",
  },
  {
    wishId: 3,
    name: "나이키 에어포스 1",
    category: "패션",
    date: "2026.09.20",
    price: "139,000원",
  },
  {
    wishId: 4,
    name: "무인양품 테이블 조명",
    category: "라이프스타일",
    date: "2026.09.15",
    price: "59,000원",
  },
];

function PurchaseHistory() {
  return (
    <main className="purchase-history">
      <div className="purchase-container">
        <div className="purchase-header">
          <div>
            <h1>소비 기록</h1>
            <p>구매한 상품과 소비 내역을 확인해보세요.</p>
          </div>

          <select className="purchase-month" defaultValue="2026-10">
            <option value="2026-10">2026년 10월</option>
            <option value="2026-09">2026년 9월</option>
            <option value="2026-08">2026년 8월</option>
          </select>
        </div>

        <PurchaseSummary />

        <section className="purchase-list-section">
          <div className="purchase-list-header">
            <h2>구매 내역</h2>
          </div>

          <div className="purchase-list">
            {purchaseItems.map((item) => (
              <PurchaseItem
                key={item.wishId}
                wishId={item.wishId}
                name={item.name}
                category={item.category}
                date={item.date}
                price={item.price}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PurchaseHistory;

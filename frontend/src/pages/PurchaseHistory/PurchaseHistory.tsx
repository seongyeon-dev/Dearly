
import { useState } from "react";

import MonthSelector from "../../components/MonthSelector/MonthSelector";

import {
  getMonthlyPurchases,
  getMonthlyTotal,
} from "../../utils/purchaseStorage";

import PurchaseItem from "./PurchaseItem/PurchaseItem";
import PurchaseSummary from "./PurchaseSummary/PurchaseSummary";

import "./PurchaseHistory.css";

function getCurrentMonth(): string {
  const today = new Date();

  return `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;
}

function PurchaseHistory() {
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth);

  const filteredPurchases = getMonthlyPurchases(selectedMonth);

  const totalAmount = getMonthlyTotal(selectedMonth);

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString("ko-KR")}원`;
  };

  const formatDate = (date: string): string => {
    return date.replaceAll("-", ".");
  };

  return (
    <main className="purchase-history">
      <div className="purchase-container">
        <div className="purchase-header">
          <div>
            <h1>소비 기록</h1>
            <p>구매한 상품과 소비 내역을 확인해보세요.</p>
          </div>

          <MonthSelector
            value={selectedMonth}
            onChange={setSelectedMonth}
          />
        </div>

        <PurchaseSummary
          totalAmount={totalAmount}
          purchaseCount={filteredPurchases.length}
        />

        <section className="purchase-list-section">
          <div className="purchase-list-header">
            <h2>구매 내역</h2>
          </div>

          <div className="purchase-list">
            {filteredPurchases.length > 0 ? (
              filteredPurchases.map((item) => (
                <PurchaseItem
                  key={item.wishId}
                  wishId={item.wishId}
                  name={item.name}
                  category={item.category}
                  date={formatDate(item.date)}
                  price={formatPrice(item.amount)}
                />
              ))
            ) : (
              <p className="purchase-empty-message">
                선택한 달의 구매 내역이 없습니다.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default PurchaseHistory;

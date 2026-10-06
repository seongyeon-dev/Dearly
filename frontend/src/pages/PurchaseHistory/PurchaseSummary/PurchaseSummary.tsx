import { CreditCard, ShoppingBag } from "lucide-react";

import "./PurchaseSummary.css";

function PurchaseSummary() {
  return (
    <section className="purchase-summary">
      <div className="purchase-summary-item">
        <div className="summary-icon">
          <CreditCard size={22} strokeWidth={1.7} />
        </div>

        <div className="summary-info">
          <span>이번 달 소비 금액</span>
          <strong>327,000원</strong>
        </div>
      </div>

      <div className="purchase-summary-divider" />

      <div className="purchase-summary-item">
        <div className="summary-icon">
          <ShoppingBag size={22} strokeWidth={1.7} />
        </div>

        <div className="summary-info">
          <span>구매한 상품</span>
          <strong>4개</strong>
        </div>
      </div>
    </section>
  );
}

export default PurchaseSummary;

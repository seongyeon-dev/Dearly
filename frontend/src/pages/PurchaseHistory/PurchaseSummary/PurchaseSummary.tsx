
import { CreditCard, ShoppingBag } from "lucide-react";

import "./PurchaseSummary.css";

type PurchaseSummaryProps = {
  totalAmount: number;
  purchaseCount: number;
};

function PurchaseSummary({
  totalAmount,
  purchaseCount,
}: PurchaseSummaryProps) {
  const formatPrice = (price: number) =>
    `${price.toLocaleString("ko-KR")}원`;

  return (
    <section className="purchase-summary">
      <div className="purchase-summary-item">
        <div className="summary-icon">
          <CreditCard size={22} strokeWidth={1.7} />
        </div>

        <div className="summary-info">
          <span>선택한 달의 소비 금액</span>
          <strong>{formatPrice(totalAmount)}</strong>
        </div>
      </div>

      <div className="purchase-summary-divider" />

      <div className="purchase-summary-item">
        <div className="summary-icon">
          <ShoppingBag size={22} strokeWidth={1.7} />
        </div>

        <div className="summary-info">
          <span>구매한 상품</span>
          <strong>{purchaseCount}개</strong>
        </div>
      </div>
    </section>
  );
}

export default PurchaseSummary;

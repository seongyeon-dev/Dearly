import { ExternalLink } from "lucide-react";
import { useState } from "react";

import PurchaseForm from "../PurchaseForm/PurchaseForm";
import "./ProductInfo.css";

function ProductInfo() {
  const [status, setStatus] = useState("WANT");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");

  return (
    <section className="detail-info">
      <div className="detail-title">
        <h1>롬앤 쥬시래스팅 틴트</h1>
        <strong>13,000원</strong>
        <span className="detail-category">뷰티</span>
      </div>

      <div className="detail-field">
        <label>상태</label>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          <option value="WANT">사고 싶어요</option>
          <option value="CONSIDERING">고민 중</option>
          <option value="BOUGHT">샀어요</option>
        </select>
      </div>

      {status === "BOUGHT" && (
        <PurchaseForm
          purchasePrice={purchasePrice}
          purchaseDate={purchaseDate}
          onPurchasePriceChange={setPurchasePrice}
          onPurchaseDateChange={setPurchaseDate}
        />
      )}

      <div className="detail-field">
        <label>구매 예정일</label>

        <div className="detail-value">2026.10.15</div>
      </div>

      <div className="detail-field">
        <label>예상 가격</label>

        <div className="detail-value">13,000원</div>
      </div>

      <div className="detail-field">
        <label>구매 링크</label>

        <a
          className="detail-link"
          href="https://example.com"
          target="_blank"
          rel="noreferrer"
        >
          <span>구매 사이트 보기</span>
          <ExternalLink size={14} strokeWidth={1.5} />
        </a>
      </div>

      <div className="detail-field">
        <label>메모</label>

        <div className="detail-memo">
          <p>
            색이 생각보다 예쁘고 요즘 제일 자주 손이 가는 틴트. 세일하면 바로
            사야지!
          </p>

          <span>39/300</span>
        </div>
      </div>
    </section>
  );
}

export default ProductInfo;

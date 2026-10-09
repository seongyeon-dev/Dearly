import type { PurchaseData } from "../../../components/PurchaseModal/PurchaseModal";
import type { ProductDetails } from "../ProductDetail";
import "./ProductInfo.css";

type ProductStatus = "WANT" | "CONSIDERING" | "BOUGHT";

type ProductInfoProps = {
  status: ProductStatus;
  onStatusChange: (status: ProductStatus) => void;
  purchaseData: PurchaseData | null;
  details: ProductDetails;
  onDetailsChange: (details: ProductDetails) => void;
};

function ProductInfo({
  status,
  onStatusChange,
  purchaseData,
  details,
  onDetailsChange,
}: ProductInfoProps) {
  const updateField = (field: keyof ProductDetails, value: string) => {
    onDetailsChange({
      ...details,
      [field]: value,
    });
  };

  return (
    <section className="detail-info">
      <div className="detail-title">
        <h1>롬앤 쥬시래스팅 틴트</h1>
        <strong>13,000원</strong>
        <span className="detail-category">뷰티</span>
      </div>

      <div className="detail-field">
        <label htmlFor="product-status">상태</label>

        <select
          id="product-status"
          value={status}
          onChange={(event) =>
            onStatusChange(event.target.value as ProductStatus)
          }
        >
          <option value="WANT">사고 싶어요</option>
          <option value="CONSIDERING">고민 중</option>
          <option value="BOUGHT">샀어요</option>
        </select>
      </div>

      {status === "BOUGHT" && purchaseData && (
        <>
          <div className="detail-field">
            <label>실제 구매 금액</label>
            <div className="detail-value">
              {purchaseData.amount.toLocaleString("ko-KR")}원
            </div>
          </div>

          <div className="detail-field">
            <label>구매 날짜</label>
            <div className="detail-value">
              {purchaseData.date.replaceAll("-", ".")}
            </div>
          </div>

          {purchaseData.store && (
            <div className="detail-field">
              <label>구매처</label>
              <div className="detail-value">{purchaseData.store}</div>
            </div>
          )}

          {purchaseData.memo && (
            <div className="detail-field">
              <label>구매 메모</label>
              <div className="detail-memo">
                <p>{purchaseData.memo}</p>
                <span>{purchaseData.memo.length}/300</span>
              </div>
            </div>
          )}
        </>
      )}

      <div className="detail-field">
        <label htmlFor="planned-date">구매 예정일</label>
        <input
          id="planned-date"
          type="date"
          value={details.plannedDate}
          onChange={(event) => updateField("plannedDate", event.target.value)}
        />
      </div>

      <div className="detail-field">
        <label htmlFor="expected-price">예상 가격</label>
        <input
          id="expected-price"
          type="number"
          min="0"
          step="1"
          value={details.expectedPrice}
          onChange={(event) => updateField("expectedPrice", event.target.value)}
        />
      </div>

      <div className="detail-field">
        <label htmlFor="purchase-link">구매 링크</label>
        <input
          id="purchase-link"
          type="url"
          value={details.purchaseLink}
          onChange={(event) => updateField("purchaseLink", event.target.value)}
          placeholder="https://"
        />
      </div>

      <div className="detail-field">
        <label htmlFor="product-memo">메모</label>
        <div className="detail-memo-edit">
          <textarea
            id="product-memo"
            value={details.memo}
            onChange={(event) => updateField("memo", event.target.value)}
            maxLength={300}
            rows={4}
            placeholder="메모를 입력해 주세요."
          />
          <span>{details.memo.length}/300</span>
        </div>
      </div>
    </section>
  );
}

export default ProductInfo;

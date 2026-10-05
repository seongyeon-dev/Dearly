import "./PurchaseForm.css";

type PurchaseFormProps = {
  purchasePrice: string;
  purchaseDate: string;
  onPurchasePriceChange: (purchasePrice: string) => void;
  onPurchaseDateChange: (purchaseDate: string) => void;
};

function PurchaseForm({
  purchasePrice,
  purchaseDate,
  onPurchasePriceChange,
  onPurchaseDateChange,
}: PurchaseFormProps) {
  return (
    <div className="purchase-fields">
      <div className="purchase-field">
        <label>
          실제 구매 가격 <span>*</span>
        </label>

        <div className="purchase-price">
          <input
            type="number"
            value={purchasePrice}
            onChange={(event) => onPurchasePriceChange(event.target.value)}
            placeholder="실제 구매 가격을 입력하세요."
          />

          <span>원</span>
        </div>
      </div>

      <div className="purchase-field">
        <label>
          구매 날짜 <span>*</span>
        </label>

        <input
          type="date"
          value={purchaseDate}
          onChange={(event) => onPurchaseDateChange(event.target.value)}
        />
      </div>
    </div>
  );
}

export default PurchaseForm;

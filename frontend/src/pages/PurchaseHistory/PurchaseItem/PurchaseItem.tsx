import { useNavigate } from "react-router-dom";

import type { Purchase } from "../../../types/purchase";

import "./PurchaseItem.css";

type PurchaseItemProps = Purchase & {
  image?: string;
};

function PurchaseItem({
  wishId,
  image,
  name,
  category,
  date,
  price,
}: PurchaseItemProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/wishlist/${wishId}`);
  };

  return (
    <button type="button" className="purchase-item" onClick={handleClick}>
      <div className="purchase-image">
        {image ? <img src={image} alt={name} /> : <span>이미지</span>}
      </div>

      <div className="purchase-info">
        <h3>{name}</h3>

        <div className="purchase-meta">
          <span>{category}</span>
          <span className="purchase-divider">|</span>
          <span>{date}</span>
        </div>
      </div>

      <strong className="purchase-price">{price}</strong>
    </button>
  );
}

export default PurchaseItem;

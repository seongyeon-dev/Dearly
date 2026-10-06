import "./PurchaseItem.css";

type PurchaseItemProps = {
  image?: string;
  name: string;
  category: string;
  date: string;
  price: string;
};

function PurchaseItem({
  image,
  name,
  category,
  date,
  price,
}: PurchaseItemProps) {
  return (
    <article className="purchase-item">
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
    </article>
  );
}

export default PurchaseItem;

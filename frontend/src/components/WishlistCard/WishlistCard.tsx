import { Heart } from "lucide-react";

import "./WishlistCard.css";

type WishlistCardProps = {
  image?: string;
  name: string;
  price: string;
  status: string;
  statusClass: "want" | "considering" | "bought";
};

function WishlistCard({
  image,
  name,
  price,
  status,
  statusClass,
}: WishlistCardProps) {
  return (
    <article className="wishlist-card">
      <div className="wishlist-image">
        {image ? (
          <img src={image} alt={name} />
        ) : (
          <span className="image-placeholder">이미지</span>
        )}

        <Heart className="heart-icon" size={18} strokeWidth={1.5} />
      </div>

      <div className="wishlist-info">
        <h3>{name}</h3>

        <strong>{price}</strong>

        <span className={`wishlist-status ${statusClass}`}>{status} ›</span>
      </div>
    </article>
  );
}

export default WishlistCard;

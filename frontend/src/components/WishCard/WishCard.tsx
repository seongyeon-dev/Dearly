import { useNavigate } from "react-router-dom";
import styles from "./WishCard.module.css";

type Wish = {
  id: number;
  name: string;
  price: number;
  status: string;
};

type WishCardProps = {
  wish: Wish;
};

function WishCard({ wish }: WishCardProps) {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/wishlist/${wish.id}`);
  };

  return (
    <article
      className={styles.card}
      onClick={handleCardClick}
    >
      <div className={styles.imageArea}>
        <button
          className={styles.heartButton}
          onClick={(e) => e.stopPropagation()}
        >
          ♡
        </button>

        <span>이미지</span>
      </div>

      <div className={styles.cardContent}>
        <p className={styles.cardName}>
          {wish.name}
        </p>

        <p className={styles.price}>
          {wish.price.toLocaleString()}원
        </p>

        <button
          className={styles.statusButton}
          onClick={(e) => e.stopPropagation()}
        >
          {wish.status}
          <span>⌄</span>
        </button>
      </div>
    </article>
  );
}

export default WishCard;
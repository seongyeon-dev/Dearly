import styles from "./ReviewCard.module.css";
import type { Review } from "../../../types/review";

type ReviewCardProps = {
  review: Review;
  onClick: (reviewId: number) => void;
};

function ReviewCard({ review, onClick }: ReviewCardProps) {
  return (
    <article
      className={styles.reviewCard}
      onClick={() => onClick(review.id)}
    >
      <div className={styles.productImage}>
        <span>상품 이미지</span>
      </div>

      <div className={styles.cardContent}>
        <span className={styles.category}>
          {review.category}
        </span>

        <h2>{review.title}</h2>

        <p className={styles.productName}>
          {review.productName}
        </p>

        <strong className={styles.price}>
          {review.price.toLocaleString()}원
        </strong>

        <div className={styles.rating}>
          <div>
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star}>
                {star <= review.rating ? "★" : "☆"}
              </span>
            ))}
          </div>

          <strong>{review.rating}.0</strong>
        </div>

        <p className={styles.reviewPreview}>
          {review.content}
        </p>

        <span className={styles.date}>
          {review.createdAt}
        </span>
      </div>
    </article>
  );
}

export default ReviewCard;
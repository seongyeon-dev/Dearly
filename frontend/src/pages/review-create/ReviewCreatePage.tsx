import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./ReviewCreatePage.module.css";
import ReviewProductInfo from "./ReviewProductInfo/ReviewProductInfo";
import ReviewImageUpload from "./ReviewImageUpload/ReviewImageUpload";

function ReviewCreatePage() {
  const navigate = useNavigate();

  const [rating, setRating] = useState(4);
  const [content, setContent] = useState("");

  return (
    <main className={styles.page}>
      <section className={styles.reviewContainer}>
        <div className={styles.pageHeader}>
          <button
            className={styles.backButton}
            onClick={() => navigate(-1)}
          >
            ←
          </button>

          <h1>구매 후기 작성</h1>
        </div>

        <ReviewProductInfo />

        <div className={styles.formGroup}>
          <span className={styles.label}>별점</span>

          <div className={styles.rating}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className={
                  star <= rating
                    ? styles.activeStar
                    : styles.star
                }
                onClick={() => setRating(star)}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <div className={styles.reviewHeader}>
            <label htmlFor="reviewContent">
              리뷰 내용
            </label>

            <span>{content.length} / 500</span>
          </div>

          <textarea
            id="reviewContent"
            value={content}
            maxLength={500}
            placeholder="사용해본 후기를 자세히 적어주세요!"
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <ReviewImageUpload />

        <div className={styles.buttonArea}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => navigate(-1)}
          >
            취소
          </button>

          <button
            type="button"
            className={styles.submitButton}
          >
            등록하기
          </button>
        </div>
      </section>
    </main>
  );
}

export default ReviewCreatePage;
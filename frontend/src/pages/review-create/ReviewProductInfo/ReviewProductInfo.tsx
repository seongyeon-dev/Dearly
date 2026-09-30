import styles from "./ReviewProductInfo.module.css";

function ReviewProductInfo() {
  return (
    <div className={styles.productInfo}>
      <div className={styles.productImage}>
        상품 이미지
      </div>

      <div className={styles.productText}>
        <span className={styles.category}>뷰티</span>
        <h2>롬앤 쥬시래스팅 틴트</h2>
        <strong>13,000원</strong>
      </div>
    </div>
  );
}

export default ReviewProductInfo;
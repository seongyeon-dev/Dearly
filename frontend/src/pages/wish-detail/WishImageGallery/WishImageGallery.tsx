import styles from "./WishImageGallery.module.css";

function WishImageGallery() {
  return (
    <div className={styles.imageSection}>
      <div className={styles.mainImage}>
        <span>상품 이미지</span>
      </div>

      <div className={styles.thumbnailList}>
        <button>이미지</button>
        <button>이미지</button>
        <button>이미지</button>
      </div>
    </div>
  );
}

export default WishImageGallery;
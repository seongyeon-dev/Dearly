import styles from "./ReviewImageUpload.module.css";

function ReviewImageUpload() {
  return (
    <div className={styles.imageUpload}>
      <span className={styles.label}>
        사진 첨부 <span className={styles.optional}>(선택)</span>
      </span>

      <div className={styles.imageList}>
        <button
          type="button"
          className={styles.imageUploadButton}
        >
          <span>＋</span>
          <small>사진 추가</small>
        </button>
      </div>
    </div>
  );
}

export default ReviewImageUpload;
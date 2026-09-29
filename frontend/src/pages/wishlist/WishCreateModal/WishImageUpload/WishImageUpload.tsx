import styles from "./WishImageUpload.module.css";

function WishImageUpload() {
  return (
    <div className={styles.imageSection}>
      <label className={styles.imageUpload}>
        <input
          type="file"
          accept="image/png, image/jpeg"
        />

        <span className={styles.cameraIcon}>📷</span>
        <strong>이미지 추가</strong>
        <p>JPG, PNG / 최대 5MB</p>
      </label>
    </div>
  );
}

export default WishImageUpload;
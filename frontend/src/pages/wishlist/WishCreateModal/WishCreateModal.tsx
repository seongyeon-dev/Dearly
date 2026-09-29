import WishImageUpload from "./WishImageUpload/WishImageUpload";
import styles from "./WishCreateModal.module.css";

type WishCreateModalProps = {
  onClose: () => void;
};

function WishCreateModal({ onClose }: WishCreateModalProps) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>상품 추가하기</h2>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.imageSection}>
            <label className={styles.imageUpload}>
              <input type="file" accept="image/png, image/jpeg" />

              <span className={styles.cameraIcon}>📷</span>
              <strong>이미지 추가</strong>
              <p>JPG, PNG / 최대 5MB</p>
            </label>
          </div>

          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label htmlFor="productName">상품명</label>
              <input
                id="productName"
                type="text"
                placeholder="상품명을 입력하세요"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="price">가격</label>

              <div className={styles.priceInput}>
                <input
                  id="price"
                  type="number"
                  placeholder="가격을 입력하세요"
                />
                <span>원</span>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">카테고리</label>

              <select id="category" defaultValue="BEAUTY">
                <option value="BEAUTY">뷰티</option>
                <option value="FASHION">패션</option>
                <option value="LIFESTYLE">라이프스타일</option>
                <option value="OTHER">기타</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <span className={styles.label}>구매 상태</span>

              <div className={styles.statusOptions}>
                <label>
                  <input
                    type="radio"
                    name="status"
                    value="WANT"
                    defaultChecked
                  />
                  사고 싶어요
                </label>

                <label>
                  <input
                    type="radio"
                    name="status"
                    value="CONSIDERING"
                  />
                  고민 중
                </label>

                <label>
                  <input
                    type="radio"
                    name="status"
                    value="BOUGHT"
                  />
                  샀어요
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="purchaseUrl">구매 링크</label>
              <input
                id="purchaseUrl"
                type="url"
                placeholder="https://..."
              />
            </div>

            <div className={styles.formGroup}>
              <div className={styles.memoHeader}>
                <label htmlFor="memo">메모</label>
                <span>0 / 200</span>
              </div>

              <textarea
                id="memo"
                maxLength={200}
                placeholder="이 제품을 추가한 이유를 적어보세요"
              />
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={onClose}
          >
            취소
          </button>

          <button
            type="button"
            className={styles.submitButton}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishCreateModal;
import styles from "./WishDetailForm.module.css";

function WishDetailForm() {
  return (
    <div className={styles.infoSection}>
      <div className={styles.titleArea}>
        <span className={styles.category}>뷰티</span>
        <h1>롬앤 쥬시래스팅 틴트</h1>
        <strong>13,000원</strong>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.label}>구매 상태</span>

        <div className={styles.statusOptions}>
          <label>
            <input
              type="radio"
              name="status"
              value="WANT"
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
              defaultChecked
            />
            샀어요
          </label>
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
        <label htmlFor="purchaseUrl">구매 링크</label>

        <input
          id="purchaseUrl"
          type="url"
          defaultValue="https://romand.co.kr"
        />
      </div>

      <div className={styles.formGroup}>
        <div className={styles.memoHeader}>
          <label htmlFor="memo">메모</label>
          <span>28 / 200</span>
        </div>

        <textarea
          id="memo"
          maxLength={200}
          defaultValue="색상이 예뻐서 구매하고 싶었던 제품"
        />
      </div>

      <div className={styles.buttonArea}>
        <button className={styles.deleteButton}>
          삭제하기
        </button>

        <div>
          <button className={styles.editButton}>
            수정하기
          </button>

          <button className={styles.reviewButton}>
            구매 후기 작성
          </button>
        </div>
      </div>
    </div>
  );
}

export default WishDetailForm;
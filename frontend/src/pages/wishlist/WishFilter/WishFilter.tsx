import styles from "./WishFilter.module.css";

function WishFilter() {
  return (
    <section className={styles.filterArea}>
      <div className={styles.categories}>
        <button className={styles.activeCategory}>전체 (6)</button>
        <button>뷰티 (3)</button>
        <button>패션 (1)</button>
        <button>라이프스타일 (1)</button>
        <button>기타 (1)</button>
      </div>

      <div className={styles.viewOptions}>
        <select>
          <option>최신순</option>
          <option>오래된순</option>
          <option>가격 낮은순</option>
          <option>가격 높은순</option>
        </select>

        <button className={styles.viewButton}>▦</button>
        <button className={styles.viewButton}>☷</button>
      </div>
    </section>
  );
}

export default WishFilter;
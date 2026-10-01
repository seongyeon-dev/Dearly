import styles from "./CategoryFilter.module.css";

function CategoryFilter() {
  return (
    <div className={styles.categories}>
      <button type="button" className={styles.activeCategory}>
        전체
      </button>
      <button type="button">뷰티</button>
      <button type="button">패션</button>
      <button type="button">라이프스타일</button>
      <button type="button">기타</button>
    </div>
  );
}

export default CategoryFilter;
import styles from "./WishFilter.module.css";
import CategoryFilter from "../../../components/CategoryFilter/CategoryFilter";

function WishFilter() {
  return (
    <section className={styles.filterArea}>
      <CategoryFilter />

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
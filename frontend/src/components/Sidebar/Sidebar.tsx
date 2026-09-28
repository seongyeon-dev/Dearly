import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const categories = [
  { name: "전체", value: "all" },
  { name: "뷰티", value: "BEAUTY" },
  { name: "패션", value: "FASHION" },
  { name: "라이프스타일", value: "LIFESTYLE" },
  { name: "기타", value: "OTHER" },
];

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      {/* 프로필 */}
      <NavLink to="/profile" className={styles.profile}>
        <div className={styles.avatar}>🎀</div>
        <h2>Dearly, Me</h2>
        <p>나의 위시리스트</p>
      </NavLink>

      {/* 메뉴 */}
      <nav className={styles.navigation}>
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? `${styles.menu} ${styles.active}` : styles.menu
          }
        >
          <span>⌂</span> 홈
        </NavLink>

        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            isActive ? `${styles.menu} ${styles.active}` : styles.menu
          }
        >
          <span>♡</span> 위시리스트
        </NavLink>

        <NavLink
          to="/reviews"
          className={({ isActive }) =>
            isActive ? `${styles.menu} ${styles.active}` : styles.menu
          }
        >
          <span>✎</span> 구매 후기
        </NavLink>
      </nav>

      {/* 카테고리 */}
      <div className={styles.categorySection}>
        <h3>카테고리</h3>

        <div className={styles.categoryList}>
          {categories.map((category) => (
            <NavLink
              key={category.value}
              to={`/wishlist?category=${category.value}`}
              className={styles.categoryItem}
            >
              {category.name}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
import styles from "./Sidebar.module.css";

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar}>🎀</div>

        <h2>Dearly, Me</h2>
        <p>나의 위시리스트</p>
      </div>

      <nav className={styles.navigation}>
        <a href="/" className={styles.active}>
          Home
        </a>

        <a href="/wishlist">
          My Wishlist
        </a>

        <a href="/profile">
          Profile
        </a>
      </nav>
    </aside>
  );
}

export default Sidebar;
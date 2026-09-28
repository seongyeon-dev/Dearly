import styles from "./Sidebar.module.css";

function Sidebar() {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.profile}>
        <div className={styles.avatar}>🎀</div>

        <h2>Dearly, Me</h2>
        <p>나의 작은 취향 공간</p>
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
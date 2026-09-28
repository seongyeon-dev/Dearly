import styles from "./Header.module.css";

function Header() {
  return (
    <header className={styles.header}>
      <span className={styles.logo}>Dearly</span>

      <div className={styles.actions}>
        <span className={styles.greeting}>나만의 취향 공간</span>
      </div>
    </header>
  );
}

export default Header;
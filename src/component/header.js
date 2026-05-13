import styles from "./header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.headerSquare} />
        <div className={styles.logo}>Rasses Location</div>
      </div>
      <nav className={styles.nav}>
        <div className={styles.language}>
          <img src="/globe.svg" alt="Language" />
        </div>
        <a href="/activities">
          <img src="/activities.svg" alt="Activities" />
        </a>
      </nav>
    </header>
  );
}
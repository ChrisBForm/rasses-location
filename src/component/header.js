import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className="logo">Rasses Location</div>
      <nav>
        <div className="language">Language</div>
        <a href="/activities">Activities Logo</a>
      </nav>
    </header>
  );
}
import styles from "./header.module.css";
import Link from "next/link";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.headerSquare}>
          <img src="/Logo.svg" alt="Rasses Location Logo" />
        </div>
        <div className={styles.logo}>
          <Link href="/">Rasses Location</Link>
        </div>
      </div>
      <nav className={styles.nav}>
        <Link href="/manuals">
          <img src="/manual.svg" alt="Manuals" />
        </Link>
        <div className={styles.language}>
          <img src="/globe.svg" alt="Language" />
        </div>
        <Link href="/activities">
          <img src="/activities.svg" alt="Activities" />
        </Link>
      </nav>
    </header>
  );
}
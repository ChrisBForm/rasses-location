"use client";
import { usePathname } from "next/navigation";
import styles from "./footer.module.css"
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <footer className={`${styles.footer} ${isAdmin ? styles.admin : ""}`}>
      <div className={styles.footerSquare}>
        <img src="/Logo.svg" alt="Rasses Location Logo" />
      </div>
      <div className={styles.footerInfo}>
        <div className={styles.footerText}>Company Infos</div>
        <div className={styles.footerText}>Useful links</div>
        <div className={styles.footerText}>
          Address<br />Phone<br />E-mail<br />Links
        </div>
      </div>
      <Link className={styles.adminLogin} href="/admin">
        Admin
      </Link>
    </footer>
  );
}
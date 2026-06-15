"use client";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const t = useTranslations("Admin");

  return (
    <aside className={`${styles.sidebar} ${isAdmin ? styles.admin : ""}`}>
      <nav className={styles.nav}>
        <Link href="/admin">{t('dashboard')}</Link>
        <Link href="/admin/pages">{t('pages')}</Link>
        <Link href="/admin/database">{t('db')}</Link>
      </nav>
    </aside>
  );
}

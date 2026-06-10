"use client";
import { usePathname } from "next/navigation";
import styles from "./sidebar.module.css";
import Link from "next/link";

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <aside className={`${styles.sidebar} ${isAdmin ? styles.admin : ""}`}>
      <nav className={styles.nav}>
        <Link href="/admin">Dashboard</Link>
        <Link href="/admin/pages">Pages</Link>
        <Link href="/admin/database">Database</Link>
      </nav>
    </aside>
  );
}

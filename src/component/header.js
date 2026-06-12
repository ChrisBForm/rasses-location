"use client";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const locale = useLocale();

  const [menuOpen, setMenuOpen] = useState(false);

  const containerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function setLocaleCookie(l) {
    if (typeof document === "undefined") return;
    document.cookie = `site_lang=${l}; path=/; max-age=${60 * 60 * 24 * 365}`;
  }

  function selectLang(l) {
    setLocaleCookie(l);
    setMenuOpen(false);
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  }

  return (
    <header className={`${styles.header} ${isAdmin ? styles.admin : ""}`}>
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

        <div className={styles.language} ref={containerRef}>
          <button
            type="button"
            className={styles.langButton}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <img src="/globe.svg" alt="Language" />
            <span className={styles.langLabel}>{locale?.toUpperCase() ?? "EN"}</span>
          </button>

          {menuOpen && (
            <div className={styles.langMenu} role="menu">
              <button className={styles.langItem} role="menuitem" onClick={() => selectLang("en")}>English</button>
              <button className={styles.langItem} role="menuitem" onClick={() => selectLang("fr")}>Français</button>
            </div>
          )}
        </div>

        <Link href="/activities">
          <img src="/activities.svg" alt="Activities" />
        </Link>
      </nav>
    </header>
  );
}
"use client";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("EN");

  // read persisted language on mount to avoid hydration mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("site_lang");
      if (stored) setLang(stored);
    } catch {}

    function onStorage(e) {
      if (e.key === "site_lang") setLang(e.newValue || "EN");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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

  function selectLang(l) {
    setLang(l);
    try {
      localStorage.setItem("site_lang", l);
    } catch {}
    setMenuOpen(false);
    // Reload the page so the app can re-render with the new language
    try {
      if (typeof window !== "undefined") window.location.reload();
    } catch {}
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
            <span className={styles.langLabel}>{lang}</span>
          </button>

          {menuOpen && (
            <div className={styles.langMenu} role="menu">
              <button className={styles.langItem} role="menuitem" onClick={() => selectLang("EN")}>English</button>
              <button className={styles.langItem} role="menuitem" onClick={() => selectLang("FR")}>Français</button>
              <button className={styles.langItem} role="menuitem" onClick={() => selectLang("DE")}>Deutsch</button>
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
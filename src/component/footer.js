"use client";
import { usePathname } from "next/navigation";
import styles from "./footer.module.css";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

export default function Footer() {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");
  const t = useTranslations("Footer");
  const [isAdminUser, setIsAdminUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { setIsAdminUser(false); return; }
      const token = await firebaseUser.getIdTokenResult();
      setIsAdminUser(!!token.claims.admin);
    });
    return () => unsubscribe();
  }, []);

  const airbnbUrl = "https://www.airbnb.com/rooms/1651537185899331378";

  return (
    <footer className={`${styles.footer} ${isAdmin ? styles.admin : ""}`}>
      <div className={styles.footerSquare}>
        <img src="/Logo.svg" alt="Rasses Location Logo" />
      </div>

      <div className={styles.footerInfo}>
        <div className={styles.footerColumn}>
          <span className={styles.footerColumnTitle}>{t("address-title")}</span>
          <span className={styles.footerText}>{t("address-line1")}</span>
          <span className={styles.footerText}>{t("address-line2")}</span>
          <span className={styles.footerText}>{t("address-line3")}</span>
        </div>

        <div className={styles.footerColumn}>
          <span className={styles.footerColumnTitle}>{t("links-title")}</span>
          
            <a href={airbnbUrl}
            target="_blank"
            rel="noreferrer"
            className={styles.footerLink}
            >
              Airbnb
            </a>
        </div>
      </div>

      {isAdminUser && (
        <Link className={styles.adminLogin} href="/admin">
          Admin
        </Link>
      )}
    </footer>
  );
}
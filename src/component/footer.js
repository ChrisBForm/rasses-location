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
      if (!firebaseUser) {
        setIsAdminUser(false);
        return;
      }
      const token = await firebaseUser.getIdTokenResult();
      setIsAdminUser(!!token.claims.admin);
    });
    return () => unsubscribe();
  }, []);

  return (
    <footer className={`${styles.footer} ${isAdmin ? styles.admin : ""}`}>
      <div className={styles.footerSquare}>
        <img src="/Logo.svg" alt="Rasses Location Logo" />
      </div>
      <div className={styles.footerInfo}>
        <div className={styles.footerText}>{t("company")}</div>
        <div className={styles.footerText}>{t("link")}</div>
        <div className={styles.footerText}>
          Address<br />Phone<br />E-mail<br />Links
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
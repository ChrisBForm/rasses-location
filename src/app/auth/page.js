"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "./page.module.css";
import { auth } from "@/lib/firebase/config";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { useTranslations } from "next-intl";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Auth");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setError("");
    });
    return unsubscribe;
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (authError) {
      setError(authError.message.replace(/^Firebase:\s*/i, ""));
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setError("");
    try {
      await signOut(auth);
    } catch (signOutError) {
      setError(signOutError.message.replace(/^Firebase:\s*/i, ""));
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.heroTitle}>
            <span>{t('title')}</span>
            <h1>{t('sign-in')}</h1>
          </div>
          <p className={styles.heroText}>
            {t('sign-desc')}
          </p>
        </div>
        {user ? (
          <div className={styles.welcome}>
            <p className={styles.welcomeText}>
              {t('signed')}<strong>{user.email}</strong>.
            </p>
            <button className={styles.button} type="button" onClick={handleSignOut}>
              {t('sign-out')}
            </button>
            <Link className={styles.link} href="/">
              {t('home')}
            </Link>
          </div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="email">
                {t('email')}
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="password">
                {t('password')}
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
            </div>
            {error && <div className={styles.error}>{error}</div>}
            <button className={styles.button} type="submit" disabled={loading}>
              {loading ? t('signing-in') : t('sign-in')}
            </button>
            <Link className={styles.link} href="/">
              {t('home')}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
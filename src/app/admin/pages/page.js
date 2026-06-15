"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import Link from "next/link";
import { useTranslations } from "next-intl";

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export default function AdminPagesPage() {
    const { user, loading } = useRequireAuth();
    const [pages, setPages] = useState([]);
    const [pagesLoading, setPagesLoading] = useState(true);
    const [error, setError] = useState("");
    const t = useTranslations("Admin");

    useEffect(() => {
        const fetchPages = async () => {
            try {
                const response = await fetch("/api/pages");
                if (!response.ok) throw new Error("Failed to fetch pages");
                const data = await response.json();
                setPages(data);
            } catch (err) {
                console.error(err);
                setError("Unable to load pages");
            } finally {
                setPagesLoading(false);
            }
        };

        fetchPages();
    }, []);

    if (loading) {
        return <div className={styles.loading}>{t('loading')}...</div>;
    } else if (!user) {
        return <div className={styles.error}>{t('signed-in')}</div>;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>

                <div className={styles.header}>
                    <div>
                        <h1 className={styles.title}>{t('pages')}</h1>
                        <p className={styles.subtitle}>{pagesLoading ? "—" : pages.length} {t('nb-pages')}</p>
                    </div>
                </div>

                {error ? (
                    <div className={styles.error}>{error}</div>
                ) : pagesLoading ? (
                    <div className={styles.loading}>{t('loading-pages')}...</div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th className={styles.th}>{t('page-title')}</th>
                                    <th className={styles.th}>URL</th>
                                    <th className={styles.th}>{t('desc')}</th>
                                    <th className={styles.th}>{t('last-mod')}</th>
                                    <th className={`${styles.th} ${styles.thRight}`}>{t('actions')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pages.map((page, i) => (
                                    <tr key={page.id} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                                        <td className={styles.td}>
                                            <span className={styles.pageTitle}>{page.title}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.slug}>{page.slug}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.description}>{page.description}</span>
                                        </td>
                                        <td className={styles.td}>
                                            <span className={styles.date}>{formatDate(page.lastModified)}</span>
                                        </td>
                                        <td className={`${styles.td} ${styles.tdRight}`}>
                                            <div className={styles.actions}>
                                                <Link
                                                    href={page.slug}
                                                    target="_blank"
                                                    className={`${styles.btn} ${styles.btnView}`}
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

            </main>
        </div>
    );
}
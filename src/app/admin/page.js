"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAdmin from "@/hooks/useRequireAdmin";
import { storage } from "@/lib/firebase/config";
import { ref, listAll } from "firebase/storage";
import { useTranslations } from "next-intl";

export default function AdminPage() {
    const { user, loading } = useRequireAdmin();
    const [manualCount, setManualCount] = useState(0);
    const [houseImageCount, setHouseImageCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const t = useTranslations("Admin");

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                // Fetch manuals count
                const manualsRef = ref(storage, "manuals");
                const manualsList = await listAll(manualsRef);
                setManualCount(manualsList.items.length);

                // Fetch house images count
                const houseRef = ref(storage, "house");
                const houseList = await listAll(houseRef);
                setHouseImageCount(houseList.items.length);

            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if(loading) {
        return <div className={styles.loading}>{t('loading')}...</div>;
    } else if (!user) {
        return <div className={styles.error}>{t('signed-in')}</div>;
    }
    
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <section className={styles.analyticsSection} aria-labelledby="analytics-title">
                    <div className={styles.analyticsHeader}>
                        <div>
                            <span className={styles.analyticsEyebrow}>Site performance</span>
                            <h1 id="analytics-title" className={styles.analyticsTitle}>Site analytics</h1>
                            <p className={styles.analyticsDescription}>
                                A simple overview of your website tracking and content.
                            </p>
                        </div>
                    </div>
                    <div className={styles.analyticsGrid}>
                        <div className={styles.analyticsCard}>
                            <span className={styles.analyticsLabel}>Tracking status</span>
                            <strong>Active</strong>
                            <span>Vercel Web Analytics</span>
                        </div>
                        <div className={styles.analyticsCard}>
                            <span className={styles.analyticsLabel}>Tracked signal</span>
                            <strong>Page views</strong>
                            <span>Collected automatically</span>
                        </div>
                        <div className={styles.analyticsCard}>
                            <span className={styles.analyticsLabel}>Content inventory</span>
                            <strong>{statsLoading ? "—" : manualCount + houseImageCount}</strong>
                            <span>Manuals and house images</span>
                        </div>
                    </div>
                    <div className={styles.readableSummary}>
                        <div className={styles.statusMessage}>
                            <span className={styles.statusDot} />
                            <div>
                                <strong>Tracking is on</strong>
                                <p>Visitor page views are being collected automatically across the website.</p>
                            </div>
                        </div>
                        <div className={styles.contentBreakdown}>
                            <div>
                                <span>Manuals available</span>
                                <strong>{statsLoading ? "—" : manualCount}</strong>
                            </div>
                            <div>
                                <span>House images available</span>
                                <strong>{statsLoading ? "—" : houseImageCount}</strong>
                            </div>
                        </div>
                    </div>
                    <p className={styles.analyticsNote}>
                        Visitor totals are stored by the analytics service and are not available inside this admin page yet.
                    </p>
                </section>
            </main>
        </div>
    );
}
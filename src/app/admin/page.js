"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { storage } from "@/lib/firebase/config";
import { ref, listAll } from "firebase/storage";

export default function AdminPage() {
    const { user, loading } = useRequireAuth();
    const [manualCount, setManualCount] = useState(0);
    const [flowerCount, setFlowerCount] = useState(0);
    const [houseImageCount, setHouseImageCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [manuals, setManuals] = useState([]);

    useEffect(() => {
        if (!user) return;

        const fetchStats = async () => {
            try {
                // Fetch manuals count
                const manualsRef = ref(storage, "manuals");
                const manualsList = await listAll(manualsRef);
                setManualCount(manualsList.items.length);
                setManuals(manualsList.items.map(item => item.name));

                // Fetch house images count
                const houseRef = ref(storage, "house");
                const houseList = await listAll(houseRef);
                setHouseImageCount(houseList.items.length);

                // Fetch flowers count
                const response = await fetch("/api/flowers");
                const flowers = await response.json();
                setFlowerCount(flowers.length);
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setStatsLoading(false);
            }
        };

        fetchStats();
    }, [user]);

    if(loading) {
        return <div className={styles.loading}>Loading...</div>;
    } else if (!user) {
        return <div className={styles.error}>You must be signed in to view this page.</div>;
    }
    
    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.statsRow}>
                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                        <span className={styles.statLabel}>Manuals in library</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : manualCount}</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardPink}`}>
                        <span className={styles.statLabel}>House images</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : houseImageCount}</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardDarkPurple}`}>
                        <span className={styles.statLabel}>Marguerite flowers</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : flowerCount}</span>
                    </div>
                </div>
                <div className={styles.bottomRow}>
                    <div className={`${styles.panel} ${styles.panelMuted}`}>
                        <span className={styles.panelLabel}>Total content items: {statsLoading ? "—" : (manualCount + houseImageCount + flowerCount)}</span>
                    </div>
                    <div className={`${styles.panel} ${styles.panelTeal}`}>
                        <span className={styles.panelLabel}>Recently added: {manuals.length > 0 ? manuals[0].replace(/\.pdf$/i, "") : "—"}</span>
                    </div>
                </div>
            </main>
        </div>
    );
}
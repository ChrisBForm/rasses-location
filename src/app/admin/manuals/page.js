"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, listAll, deleteObject } from "firebase/storage";
import { useTranslations } from "next-intl";

export default function ManualsAdminPage() {
    const { user, loading } = useRequireAuth();
    const [manuals, setManuals] = useState([]);
    const [manualCount, setManualCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [pendingManuals, setPendingManuals] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletingManual, setDeletingManual] = useState("");
    const t = useTranslations("Admin");

    const fetchManuals = useCallback(async () => {
        if (!user) return;

        try {
            setStatsLoading(true);
            const manualsRef = ref(storage, "manuals");
            const manualsList = await listAll(manualsRef);
            const sortedManuals = manualsList.items.sort((a, b) => b.name.localeCompare(a.name));
            setManualCount(sortedManuals.length);
            setManuals(sortedManuals);
        } catch (error) {
            console.error("Error fetching manuals:", error);
        } finally {
            setStatsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (!user) return;
        fetchManuals();
    }, [user, fetchManuals]);

    const queueManuals = (files) => {
        if (!files || files.length === 0) return;

        const newManuals = Array.from(files)
            .filter((file) => file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"))
            .map((file) => ({
                id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                file,
                name: file.name.replace(/\.pdf$/i, ""),
            }));

        if (newManuals.length > 0) {
            setPendingManuals((current) => [...current, ...newManuals]);
        }
    };

    const handleUpload = async () => {
        if (pendingManuals.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            await user.getIdToken(true);

            let uploaded = 0;
            for (const manual of pendingManuals) {
                const baseName = manual.name.trim() || manual.file.name.replace(/\.pdf$/i, "");
                const safeName = baseName.replace(/[\\/:"*?<>|]+/g, "").trim() || "manual";
                const fileName = `${Date.now()}_${safeName}.pdf`;
                const fileRef = ref(storage, `manuals/${fileName}`);
                await uploadBytes(fileRef, manual.file);
                uploaded++;
                setUploadProgress(Math.round((uploaded / pendingManuals.length) * 100));
            }

            setPendingManuals([]);
            await fetchManuals();
            setUploadProgress(0);
        } catch (error) {
            console.error("Error uploading manuals:", error);
        } finally {
            setUploading(false);
        }
    };

    const updatePendingManualName = (id, value) => {
        setPendingManuals((current) =>
            current.map((manual) =>
                manual.id === id ? { ...manual, name: value } : manual
            )
        );
    };

    const removePendingManual = (id) => {
        setPendingManuals((current) => current.filter((manual) => manual.id !== id));
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        queueManuals(e.dataTransfer.files);
    };

    const handleFileInput = (e) => {
        queueManuals(e.target.files);
        e.target.value = null;
    };

    const deleteManual = async (manualName) => {
        const confirmed = window.confirm(
            t('confirm-delete-manual') || t('confirm-delete') || 'Delete this manual?'
        );
        if (!confirmed) return;

        setDeleteLoading(true);
        setDeletingManual(manualName);

        try {
            const manualRef = ref(storage, `manuals/${manualName}`);
            await deleteObject(manualRef);
            await fetchManuals();
        } catch (error) {
            console.error("Error deleting manual:", error);
        } finally {
            setDeleteLoading(false);
            setDeletingManual("");
        }
    };

    if (loading) {
        return <div className={styles.loading}>{t('loading')}...</div>;
    } else if (!user) {
        return <div className={styles.error}>{t('signed-in')}</div>;
    }

    return (
        <div className={styles.page}>
            <main className={styles.main}>
                <div className={styles.uploadSection}>
                    <div
                        className={`${styles.uploadBox} ${dragActive ? styles.dragActive : ""}`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input
                            type="file"
                            id="fileInput"
                            multiple
                            accept="application/pdf"
                            onChange={handleFileInput}
                            disabled={uploading}
                            className={styles.fileInput}
                        />
                        <label htmlFor="fileInput" className={styles.uploadLabel}>
                            {uploading ? (
                                <>
                                    <span className={styles.uploadProgress}>{uploadProgress}%</span>
                                    <p>{t('uploading') || 'Uploading...'}</p>
                                </>
                            ) : (
                                <>
                                    <span className={styles.uploadIcon}>📄</span>
                                    <p>{t('upload-manuals') || 'Drag and drop PDF manuals or click to select'}</p>
                                    <p className={styles.uploadHint}>{t('manual-hint') || 'Supported: PDF files up to 10MB'}</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {pendingManuals.length > 0 && (
                    <div className={styles.pendingList}>

                        <div className={styles.pendingHeading}>
                            <span>{t('pending-manuals') || 'Pending manuals'}</span>
                        </div>

                        {pendingManuals.map((manual) => (
                            <div key={manual.id} className={styles.pendingItem}>
                                <div>
                                    <label className={styles.pendingLabel} htmlFor={`manual-name-${manual.id}`}>
                                        {manual.file.name}
                                    </label>
                                    <input
                                        id={`manual-name-${manual.id}`}
                                        className={styles.pendingNameInput}
                                        type="text"
                                        value={manual.name}
                                        onChange={(e) => updatePendingManualName(manual.id, e.target.value)}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.removeButton}
                                    onClick={() => removePendingManual(manual.id)}
                                >
                                    {t('remove') || 'Remove'}
                                </button>
                                <button
                                    type="button"
                                    className={styles.uploadButton}
                                    onClick={handleUpload}
                                    disabled={uploading}
                                >
                                    {uploading ? `${t('uploading') || 'Uploading...'} (${uploadProgress}%)` : t('upload-selected') || 'Upload manual'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.statsRow}>
                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                        <span className={styles.statLabel}>{t('manuals-stat')}</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : manualCount}</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardPink}`}>
                        <span className={styles.statLabel}>{t('recent-manuals') || 'Recent manuals'}</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : Math.min(manualCount, 10)}</span>
                    </div>
                </div>

                <div className={`${styles.panel} ${styles.panelTeal}`}>
                    <h2 className={styles.panelTitle}>{t('recent-manuals') || 'Recent manuals'}</h2>
                    <div className={styles.imagesList}>
                        {manuals.length === 0 ? (
                            <p className={styles.emptyText}>{t('no-manuals') || 'No manuals uploaded yet'}</p>
                        ) : (
                            manuals.slice(0, 10).map((manual) => (
                                <div key={manual.name} className={styles.imageItem}>
                                    <span className={styles.imageName}>{manual.name}</span>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => deleteManual(manual.name)}
                                        disabled={uploading || deleteLoading}
                                    >
                                        {deletingManual === manual.name ? t('deleting') || 'Deleting...' : t('delete-manual') || 'Delete'}
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

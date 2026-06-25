"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { storage } from "@/lib/firebase/config";
import { ref, uploadBytes, listAll, deleteObject } from "firebase/storage";
import { useTranslations } from "next-intl";

export default function HouseImagesPage() {
    const { user, loading } = useRequireAuth();
    const [images, setImages] = useState([]);
    const [uploadedCount, setUploadedCount] = useState(0);
    const [statsLoading, setStatsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deletingImage, setDeletingImage] = useState("");
    const t = useTranslations("Admin");

    const fetchImages = async () => {
        if (!user) return;

        try {
            setStatsLoading(true);
            const houseRef = ref(storage, "house");
            const imagesList = await listAll(houseRef);
            setUploadedCount(imagesList.items.length);
            const sortedImages = imagesList.items.sort((a, b) => 
                b.name.localeCompare(a.name)
            );
            setImages(sortedImages);
        } catch (error) {
            console.error("Error fetching images:", error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch images list
    useEffect(() => {
        if (!user) return;
        fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    // Handle file upload
    const handleUpload = async (files) => {
        if (!files || files.length === 0) return;

        setUploading(true);
        setUploadProgress(0);

        try {
            await user.getIdToken(true);

            let uploaded = 0;
            for (const file of files) {
                // Validate file type
                if (!file.type.startsWith("image/")) {
                    console.warn(`Skipping non-image file: ${file.name}`);
                    continue;
                }

                const timestamp = Date.now();
                const fileName = `${timestamp}_${file.name}`;
                const fileRef = ref(storage, `house/${fileName}`);
                
                await uploadBytes(fileRef, file);
                uploaded++;
                setUploadProgress(Math.round((uploaded / files.length) * 100));
            }

            await fetchImages();
            setUploadProgress(0);
        } catch (error) {
            console.error("Error uploading images:", error);
        } finally {
            setUploading(false);
        }
    };

    // Handle drag and drop
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
        handleUpload(e.dataTransfer.files);
    };

    // Handle file input
    const handleFileInput = (e) => {
        handleUpload(e.target.files);
    };

    const deleteImage = async (imageName) => {
        const confirmed = window.confirm(t('confirm-delete') || 'Delete this image?');
        if (!confirmed) return;

        setDeleteLoading(true);
        setDeletingImage(imageName);

        try {
            const imageRef = ref(storage, `house/${imageName}`);
            await deleteObject(imageRef);
            await fetchImages();
        } catch (error) {
            console.error("Error deleting image:", error);
        } finally {
            setDeleteLoading(false);
            setDeletingImage("");
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
                {/* Upload Section */}
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
                            accept="image/*"
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
                                    <span className={styles.uploadIcon}>📷</span>
                                    <p>{t('upload-images') || 'Drag and drop images or click to select'}</p>
                                    <p className={styles.uploadHint}>{t('image-hint') || 'PNG, JPG up to 10MB'}</p>
                                </>
                            )}
                        </label>
                    </div>
                </div>

                {/* Stats Row */}
                <div className={styles.statsRow}>
                    <div className={`${styles.statCard} ${styles.statCardPink}`}>
                        <span className={styles.statLabel}>{t('house-stat') || 'House Images'}</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : uploadedCount}</span>
                    </div>
                    <div className={`${styles.statCard} ${styles.statCardPurple}`}>
                        <span className={styles.statLabel}>{t('total-uploaded') || 'Total Uploaded'}</span>
                        <span className={styles.statValue}>{statsLoading ? "—" : images.length}</span>
                    </div>
                </div>

                {/* Images List Panel */}
                <div className={`${styles.panel} ${styles.panelTeal}`}>
                    <h2 className={styles.panelTitle}>{t('recent-images') || 'Recent Uploads'}</h2>
                    <div className={styles.imagesList}>
                        {images.length === 0 ? (
                            <p className={styles.emptyText}>{t('no-images') || 'No images uploaded yet'}</p>
                        ) : (
                            images.slice(0, 10).map((image) => (
                                <div key={image.name} className={styles.imageItem}>
                                    <span className={styles.imageName}>{image.name}</span>
                                    <button
                                        type="button"
                                        className={styles.deleteButton}
                                        onClick={() => deleteImage(image.name)}
                                        disabled={uploading || deleteLoading}
                                    >
                                        {deletingImage === image.name ? t('deleting') || 'Deleting...' : t('delete-image') || 'Delete'}
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

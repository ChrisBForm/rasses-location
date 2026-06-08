"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { storage } from "@/lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";

function formatManualName(filename) {
  return filename
    .replace(/\.pdf$/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ManualsPage() {
  const { user, loading } = useRequireAuth();
  const [manuals, setManuals] = useState([]);
  const [loadingManuals, setLoadingManuals] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const folderRef = ref(storage, "manuals");
    listAll(folderRef)
      .then((result) =>
        Promise.all(
          result.items.map((item) =>
            getDownloadURL(item).then((url) => ({
              url,
              name: item.name,
            }))
          )
        )
      )
      .then((files) => setManuals(files))
      .catch((fetchError) => {
        console.error(fetchError);
        setError("Impossible de charger les documents. Vérifiez la configuration Firebase ou le dossier 'manuals'.");
      })
      .finally(() => setLoadingManuals(false));
  }, [user]);

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.overline}>Manuels</p>
          <h1>Accédez aux PDF depuis Firebase</h1>
          <p className={styles.heroText}>
            Cliquez sur une carte pour ouvrir le manuel associé dans un nouvel onglet.
          </p>
        </section>

          {error ? (
            <div className={styles.error}>{error}</div>
          ) : loadingManuals ? (
            <div className={styles.loading}>Chargement des manuels…</div>
          ) : manuals.length === 0 ? (
            <div className={styles.empty}>Aucun manuel disponible pour le moment.</div>
          ) : (
            <div className={styles.grid}>
              {manuals.map((manual) => (
                <a
                  key={manual.url}
                  href={manual.url}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.manualCard}
                >
                  <div className={styles.cardMeta}>
                    <span className={styles.manualType}>PDF</span>
                    <span className={styles.openLabel}>Ouvrir</span>
                  </div>
                  <h2>{formatManualName(manual.name)}</h2>
                  <p className={styles.manualDescription}>
                    Voir le manuel associé et le télécharger si besoin.
                  </p>
                </a>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}

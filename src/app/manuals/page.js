"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { storage } from "@/lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { useLocale } from "next-intl";

function formatManualName(filename) {
  // remove extension and trailing language code like _EN or -FR
  const withoutExt = filename.replace(/\.pdf$/i, "");
  const stripped = withoutExt.replace(/[_\-.](en|fr|nl)$/i, "");
  return stripped.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function matchesLanguage(filename, lang) {
  if (!lang) return false;
  const re = new RegExp(`[_\\-.]${lang}\\.pdf$`, "i");
  return re.test(filename);
}

export default function ManualsPage() {
  const { user, loading } = useRequireAuth();
  const locale = useLocale();
  const [manuals, setManuals] = useState([]);
  const [loadingManuals, setLoadingManuals] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

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
        setError("Unable to load documents. Check your Firebase configuration or the 'manuals' folder.");
      })
      .finally(() => setLoadingManuals(false));
  }, [user]);

  // update language if changed elsewhere (e.g., header control)
  useEffect(() => {
    function onStorage(e) {
      if (e.key === "site_lang") setLang(e.newValue || "EN");
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.overline}>Manuals</p>
          <h1>Access PDFs from Firebase</h1>
          <p className={styles.heroText}>
            Click a card to open the associated PDF in a new tab.
          </p>
        </section>

        <div className={styles.card}>
          {error ? (
              <div className={styles.error}>{error}</div>
            ) : loadingManuals ? (
              <div className={styles.loading}>Loading manuals…</div>
            ) : manuals.length === 0 ? (
              <div className={styles.empty}>No manuals available at the moment.</div>
            ) : (
            <>
            <div className={styles.cardControls}>
              <input
                className={styles.searchBox}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search manuals..."
                aria-label="Search manuals"
              />
            </div>
            <div className={styles.grid}>
                {manuals
                  .filter((manual) => matchesLanguage(manual.name, locale?.toUpperCase() || "EN"))
                  .filter((manual) =>
                    formatManualName(manual.name).toLowerCase().includes(query.toLowerCase())
                  )
                  .map((manual) => (
                  <a
                    key={manual.url}
                    href={manual.url}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.manualCard}
                  >
                    <div className={styles.cardMeta}>
                      <span className={styles.manualType}>PDF</span>
                      <span className={styles.openLabel}>Open</span>
                    </div>
                    <h2>{formatManualName(manual.name)}</h2>
                    <p className={styles.manualDescription}>
                      View the manual or download it if needed.
                    </p>
                  </a>
                ))}
            </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
 

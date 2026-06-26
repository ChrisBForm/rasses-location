"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useTranslations } from "next-intl";

export default function AdminLanguagesPage() {
  const { user, loading } = useRequireAuth();
  const [languages, setLanguages] = useState({});
  const [locales, setLocales] = useState([]);
  const [selectedLocale, setSelectedLocale] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [jsonError, setJsonError] = useState("");
  const t = useTranslations("Admin");

  const fetchLanguages = async () => {
    if (!user) return;
    setStatsLoading(true);
    setFetchError("");
    try {
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/languages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const responseBody = await response.json().catch(() => ({}));
        const errorMessage = responseBody?.details || responseBody?.error || response.statusText;
        throw new Error(errorMessage);
      }
      const data = await response.json();
      setLanguages(data.languages);
      setLocales(data.locales);
      if (data.locales.length > 0) {
        setSelectedLocale(data.locales[0]);
        setEditedContent(JSON.stringify(data.languages[data.locales[0]], null, 2));
      }
    } catch (error) {
      setFetchError(`Unable to load language files: ${error.message}`);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    fetchLanguages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLocaleChange = (locale) => {
    if (hasChanges) {
      const confirmed = window.confirm(
        t("unsaved-changes") || "You have unsaved changes. Are you sure?"
      );
      if (!confirmed) return;
    }
    setSelectedLocale(locale);
    setEditedContent(JSON.stringify(languages[locale], null, 2));
    setHasChanges(false);
    setJsonError("");
  };

  const handleContentChange = (value) => {
    setEditedContent(value);
    setHasChanges(true);
    try {
      JSON.parse(value);
      setJsonError("");
    } catch {
      setJsonError(t('invalid-json'));
    }
  };

  const handleSaveLanguage = async () => {
    if (!selectedLocale || jsonError) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");
    try {
      const parsed = JSON.parse(editedContent);
      const token = await user.getIdToken();
      const response = await fetch("/api/admin/languages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locale: selectedLocale, content: parsed }),
      });
      if (!response.ok) {
        const responseBody = await response.text();
        throw new Error(responseBody || response.statusText);
      }
      setLanguages({ ...languages, [selectedLocale]: parsed });
      setHasChanges(false);
      setSaveSuccess(`Language file for ${selectedLocale} updated successfully!`);
      setTimeout(() => setSaveSuccess(""), 3000);
    } catch (error) {
      setSaveError(error?.message || t("save-error") || "Unable to save language file.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>{t("loading")}...</div>;
  if (!user) return <div className={styles.error}>{t("signed-in")}</div>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topRow}>
          <div className={styles.pageIntro}>
            <span className={styles.subtitle}>Languages</span>
            <h1 className={styles.title}>Manage Translations</h1>
            <p className={styles.description}>
              Edit and manage language files for your website. Select a language and edit the JSON directly.
            </p>
          </div>
          {hasChanges && (
            <button
              className={styles.primaryButton}
              onClick={handleSaveLanguage}
              disabled={saving || !!jsonError}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          )}
        </div>

        {fetchError && <div className={styles.errorMessage}>{fetchError}</div>}
        {saveError && <div className={styles.errorMessage}>{saveError}</div>}
        {saveSuccess && <div className={styles.successMessage}>{saveSuccess}</div>}

        {statsLoading ? (
          <div className={styles.loading}>{t("loading")}...</div>
        ) : locales.length === 0 ? (
          <div className={styles.errorMessage}>
            No language files found. Please ensure language files are available in Firebase Storage.
          </div>
        ) : (
          <div className={styles.contentContainer}>
            <div className={styles.languageSelector}>
              <label className={styles.selectorLabel}>Select Language</label>
              <div className={styles.localeButtons}>
                {locales.map((locale) => (
                  <button
                    key={locale}
                    className={`${styles.localeButton} ${selectedLocale === locale ? styles.localeButtonActive : ""}`}
                    onClick={() => handleLocaleChange(locale)}
                  >
                    {locale.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.editorContainer}>
              {jsonError && <div className={styles.jsonError}>{jsonError}</div>}
              <textarea
                className={styles.jsonEditor}
                value={editedContent}
                onChange={(e) => handleContentChange(e.target.value)}
                spellCheck={false}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
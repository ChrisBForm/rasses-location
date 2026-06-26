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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocale, setNewLocale] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [newLocaleName, setNewLocaleName] = useState("");
  const [currentLocaleNames, setCurrentLocaleNames] = useState({});
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
        throw new Error(responseBody?.details || responseBody?.error || response.statusText);
      }
      const data = await response.json();
      setLanguages(data.languages);
      setLocales(data.locales);
      setCurrentLocaleNames(data.localeNames || {});
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
        throw new Error((await response.text()) || response.statusText);
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

  const handleAddLanguage = async () => {
    const code = newLocale.trim().toLowerCase();
    if (!code) return;
    if (locales.includes(code)) {
      setAddError(t('language-exist'));
      return;
    }

    setAdding(true);
    setAddError("");
    try {
      const token = await user.getIdToken();

      // Create new language file based on en.json
      const newContent = JSON.parse(JSON.stringify(languages["en"]));

      // Save the new language file
      const fileRes = await fetch("/api/admin/languages", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ locale: code, content: newContent }),
      });
      if (!fileRes.ok) throw new Error((await fileRes.text()) || fileRes.statusText);

      // Update config.json with the new locale
      const configRes = await fetch("/api/admin/languages/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            locales: [...locales, code],
            localeNames: { ...currentLocaleNames, [code]: newLocaleName || code.toLocaleUpperCase() }, 
        }),
      });
      if (!configRes.ok) throw new Error((await configRes.text()) || configRes.statusText);

      // Update local state
      const updatedLanguages = { ...languages, [code]: newContent };
      const updatedLocales = [...locales, code];
      setLanguages(updatedLanguages);
      setLocales(updatedLocales);
      setSelectedLocale(code);
      setEditedContent(JSON.stringify(newContent, null, 2));
      setHasChanges(false);
      setShowAddModal(false);
      setNewLocale("");
    } catch (error) {
      setAddError(`Failed to add language: ${error.message}`);
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <div className={styles.loading}>{t("loading")}...</div>;
  if (!user) return <div className={styles.error}>{t("signed-in")}</div>;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topRow}>
          <div className={styles.pageIntro}>
            <span className={styles.subtitle}>{t('languages')}</span>
            <h1 className={styles.title}>{t('language-title')}</h1>
            <p className={styles.description}>
              {t('language-desc')}
            </p>
          </div>
          {hasChanges && (
            <button
              className={styles.primaryButton}
              onClick={handleSaveLanguage}
              disabled={saving || !!jsonError}
            >
              {saving ? t('saving') : t('save-bttn')}
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
            {t('no-language')}
          </div>
        ) : (
          <div className={styles.contentContainer}>
            <div className={styles.languageSelector}>
              <label className={styles.selectorLabel}>{t('language-select')}</label>
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
                <button
                  className={styles.addLocaleButton}
                  onClick={() => { setShowAddModal(true); setAddError(""); setNewLocale(""); }}
                >
                  {t('language-add-bttn')}
                </button>
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

      {/* Add Language Modal */}
      {showAddModal && (
        <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>{t('language-add-text')}</h2>
            <p className={styles.modalDesc}>
              {t('language-code')} (e.g. <strong>de</strong>, <strong>es</strong>, <strong>it</strong>).
              {t('language-prefill')}
            </p>
            <input
              className={styles.modalInput}
              type="text"
              placeholder={t('language-code-ph')}
              value={newLocale}
              onChange={(e) => setNewLocale(e.target.value.toLowerCase())}
              maxLength={5}
            />
            <input
              className={styles.modalInput}
              type="text"
              placeholder={t('language-name-ph')}
              value={newLocaleName}
              onChange={(e) => setNewLocaleName(e.target.value)}
            />
            {addError && <div className={styles.jsonError}>{addError}</div>}
            <div className={styles.modalActions}>
              <button
                className={styles.secondaryButton}
                onClick={() => setShowAddModal(false)}
                disabled={adding}
              >
                {t('cancel')}
              </button>
              <button
                className={styles.primaryButton}
                onClick={handleAddLanguage}
                disabled={adding || !newLocale.trim()}
              >
                {adding ? t('adding') : t('language-add')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
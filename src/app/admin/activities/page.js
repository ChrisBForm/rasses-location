"use client";
import { useEffect, useState } from "react";
import styles from "./page.module.css";
import useRequireAdmin from "@/hooks/useRequireAdmin";
import { useTranslations } from "next-intl";

const SEASONS = ["winter", "summer", "all_year"];

const EMPTY_ACTIVITY = {
  category: "",
  icon: "",
  label: "",
  desckey: "",
  website: "",
  lat: "",
  lng: "",
};

export default function AdminActivitiesPage() {
  const { user, loading } = useRequireAdmin();
  const [activities, setActivities] = useState({ winter: [], summer: [], all_year: [] });
  const [languages, setLanguages] = useState({});
  const [locales, setLocales] = useState([]);
  const [activeSeason, setActiveSeason] = useState("all_year");
  const [selectedActivity, setSelectedActivity] = useState(null); // { season, idx }
  const [editForm, setEditForm] = useState(EMPTY_ACTIVITY);
  const [descTranslation, setDescTranslation] = useState({}); // { en: "...", fr: "..." }
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const t = useTranslations("Admin");

  useEffect(() => {
    if (!user) return;
    async function fetchData() {
      const token = await user.getIdToken();

      const [activitiesRes, languagesRes] = await Promise.all([
        fetch("/api/admin/activities", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/admin/languages", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const activitiesData = await activitiesRes.json();
      const languagesData = await languagesRes.json();

      setActivities(activitiesData);
      setLanguages(languagesData.languages || {});
      setLocales(languagesData.locales || []);
    }
    fetchData();
  }, [user]);

  const handleSelectedActivity = (season, idx) => {
    const activity = activities[season][idx];
    setSelectedActivity({ season, idx });
    setEditForm({ ...activity, lat: activity.lat ?? "", lng: activity.lng ?? "" });
    setAdding(false);

    // Load existing description from languages files
    const descs = {};
    locales.forEach((locale) => {
      descs[locale] = languages[locale]?.Activities?.[activity.desckey] || "";
    });
    setDescTranslation(descs);
    setError("");
    setSuccess("");
  };

  const handleStartAdd = () => {
    setAdding(true);
    setSelectedActivity(null);
    setEditForm({ ...EMPTY_ACTIVITY });
    setDescTranslation(locales.reduce((acc, locale) => ({ ...acc, [locale]: "" }), {}));
    setError("");
    setSuccess("");
  };

  const handleFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDescChange = (locale, value) => {
    setDescTranslation((prev) => ({ ...prev, [locale]: value }));
  };

  const handleSave = async () => {
    if (!editForm.label || !editForm.category || !editForm.icon) {
      setError("Label, category and icon are required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const token = await user.getIdToken();

      // Build updated activities
      const updatedActivities = JSON.parse(JSON.stringify(activities));
      const activity = {
        ...editForm,
        lat: editForm.lat ? parseFloat(editForm.lat) : null,
        lng: editForm.lng ? parseFloat(editForm.lng) : null,
        desckey: editForm.desckey || `desc-${editForm.label.toLowerCase().replace(/\s+/g, "-")}`,
      };

      if (adding) {
        updatedActivities[activeSeason].push(activity);
      } else {
        updatedActivities[selectedActivity.season][selectedActivity.idx] = activity;
      }

      // Save activities
      await fetch("/api/admin/activities", {
        method: "PUT",
        headers: { "Content-Type": "application.json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      // Save descriptions to each language file
      for (const locale of locales) {
        if (!descTranslation[locale]) continue;
        const updatedLang = JSON.parse(JSON.stringify(languages[locale] || {}));
        if (!updatedLang.Activities) updatedLang.Activities = {};
        updatedLang.Activities[activity.desckey] = descTranslation[locale];

        await fetch("/api/admin/languages", {
          method: "PUT",
          headers: { "Content-Type": "application.json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ locale, content: updatedLang }),
        });

        setLanguages((prev) => ({ ...prev, [locale]: updatedLang }));
      }

      setActivities(updatedActivities);
      setAdding(false);
      setSuccess("Activity saved successfully!");
      setTimeout(() =>  setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to save activity.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedActivity) return;
    if (!window.confirm("Delete this activity?")) return;

    setSaving(true);
    try {
      const token = await user.getIdToken();
      const updatedActivities = JSON.parse(JSON.stringify(activities));
      updatedActivities[selectedActivity.season].splice(selectedActivity.idx, 1);

      await fetch("/api/admin/activities", {
        method: "PUT",
        headers: { "Content-Type": "application.json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ activities: updatedActivities }),
      });

      setActivities(updatedActivities);
      setSelectedActivity(null);
      setEditForm(EMPTY_ACTIVITY);
      setSuccess("Activity deleted.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete activity.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (!user) return <div className={styles.error}>Access denied.</div>

  const items = activities[activeSeason] || [];

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.topRow}>
          <div className={styles.pageIntro}>
            <span className={styles.subtitle}>Activities</span>
            <h1 className={styles.title}>Manage Activities</h1>
            <p className={styles.description}>Add, edit, or remove activities shown on the map.</p>
          </div>
          <button className={styles.description} onClick={handleStartAdd}>
            + Add Activity
          </button>
        </div>

        {error && <div className={styles.errorMessage}>{error}</div>}
        {success && <div className={styles.successMessage}>{success}</div>}

        <div className={styles.contentContainer}>
          {/* Left: activity list */}
          <div className={styles.listPanel}>
            <div className={styles.seasonTabs}>
              {SEASONS.map((s) => (
                <button
                  key={s}
                  className={`${styles.seasonTab} ${activeSeason === s ? styles.seasonTabActive : ""}`}
                  onClick={() => setActiveSeason(s)}
                >
                  {s === "all_year" ? "All Year" : s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
            <div className={styles.activityList}>
              {items.length === 0 && (
                <p className={styles.emptyText}>No activities for this season.</p>
              )}
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`${styles.activityItem} ${selectedActivity?.season === activeSeason && selectedActivity?.idx === idx ? styles.activityItemActive : ""}`}
                  onClick={() => handleSelectedActivity(activeSeason, idx)}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                  <span className={styles.activityCategory}>{item.category}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Right: editor */}
          {(selectedActivity || adding) && (
            <div className={styles.editorPanel}>
              <h2 className={styles.editorTitle}>
                {adding ? "New Activity" : `Edit: ${editForm.label}`}
              </h2>

              <div className={styles.formGrid}>
                {[
                  { field: "label", label: "Name" },
                  { field: "category", label: "Category" },
                  { field: "icon", label: "Icon (emoji)" },
                  { field: "website", label: "Website" },
                  { field: "lat", label: "Latitude" },
                  { field: "lng", label: "Longitude" },
                  { field: "descKey", label: "Description Key" },
                ].map(({ field, label }) => (
                  <div key={field} className={styles.formRow}>
                    <label className={styles.formLabel}>{label}</label>
                    <input 
                      className={styles.formInput}
                      value={editForm[field] || ""}
                      onChange={(e) => handleFormChange(field, e.target.value)}
                    />
                  </div>
                ))}
                {adding && (
                  <div className={styles.formRow}>
                    <label className={styles.formLabel}>Season</label>
                    <select
                      className={styles.formInput}
                      value={activeSeason}
                      onChange={(e) => setActiveSeason(e.target.value)}
                    >
                      {SEASONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <h3 className={styles.descTitle}>Descriptions</h3>
              {locales.map((locale) => (
                <div key={locale} className={styles.formRow}>
                  <label className={styles.formLabel}>{locale.toUpperCase()}</label>
                  <textarea
                    className={styles.formTextarea}
                    value={descTranslation(locale, e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
              <div className={styles.editorActions}>
                <button
                  className={styles.primaryButton}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                {!adding && (
                  <button
                    className={styles.deleteButton}
                    onClick={handleDelete}
                    disabled={saving}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
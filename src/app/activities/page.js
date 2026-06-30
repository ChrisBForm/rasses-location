"use client";
import styles from "./page.module.css";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";

function SearchBox({ onPlaceSelect }) {
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");
  const map = useMap();

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const autocomplete = new places.Autocomplete(inputRef.current);
    autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        onPlaceSelect(place);
        if (map) {
          map.panTo(place.geometry.location);
          map.setZoom(15);
        }
      }
    });
  }, [places, map]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search..."
      className={styles.searchBox}
    />
  );
}

function MapContent({ position, searchMarker, setSearchMarker, selected, setSelected, handleMapClick }) {
  return (
    <div className={styles.mapContentWrapper}>
      <div className={styles.mapFrame}>
        <Map
          defaultCenter={position}
          defaultZoom={15}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
          mapId="rasses-map"
        >
        {POINTS_OF_INTEREST.map((point, index) => (
          <AdvancedMarker
            key={index}
            position={{ lat: point.lat, lng: point.lng }}
            title={point.label}
            onClick={(e) => {
              e.stop();
              setSelected(point);
            }}
          >
            <span style={{ fontSize: "2rem", cursor: "pointer" }}>
              {point.icon}
            </span>
          </AdvancedMarker>
        ))}
        {searchMarker && (
          <AdvancedMarker
            position={{ lat: searchMarker.lat, lng: searchMarker.lng }}
            title={searchMarker.label}
          >
            <span style={{ fontSize: "2rem" }}>📍</span>
          </AdvancedMarker>
        )}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
            pixelOffset={[0, -40]}
          >
            <p>{selected.icon} {selected.label}</p>
          </InfoWindow>
        )}
      </Map>
      </div>
      <aside className={styles.mapSidebar}>
        <SearchBox onPlaceSelect={(place) => {
          setSearchMarker({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            label: place.name,
          });
        }} />
      </aside>
    </div>
  );
}

const POINTS_OF_INTEREST = [
  { lat: 46.82942442282928, lng: 6.540003507637307, label: "Appartment", icon: "🏠" },
  { lat: 46.83078, lng: 6.54101, label: "Ski resort", icon: "⛷️" }
];

// Sample data — shape matches what will later come from Firebase
const ACTIVITIES = {
  winter: [
    { category: "Sports", icon: "⛷️", label: "Skiing & snowboarding", desc: "Nearby ski resort with rentals and lessons available." },
    { category: "Sports", icon: "🛷", label: "Sledding", desc: "Family-friendly sledding trails a short walk away." },
    { category: "Food", icon: "🍫", label: "Hot chocolate spots", desc: "Cozy cafés perfect for warming up after a day on the slopes." },
  ],
  summer: [
    { category: "Nature", icon: "🥾", label: "Hiking trails", desc: "Scenic trails with varying difficulty levels nearby." },
    { category: "Sports", icon: "🚴", label: "Mountain biking", desc: "Marked bike trails for all skill levels." },
    { category: "Food", icon: "🍽️", label: "Local restaurants", desc: "Farm-to-table dining within walking distance." },
  ],
  all_year: [
    { category: "Essentials", icon: "🛒", label: "Grocery store", desc: "Closest supermarket for everyday needs." },
    { category: "Essentials", icon: "🚑", label: "Emergency contacts", desc: "Nearest pharmacy and medical center." },
  ],
};

function ActivitiesList({ activities }) {
  const [activeSeason, setActiveSeason] = useState("winter");

  const seasons = [
    { key: "winter", label: "❄️ Winter" },
    { key: "summer", label: "☀️ Summer" },
    { key: "all_year", label: "📍 All Year" },
  ];

  const items = activities[activeSeason] || [];
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className={styles.activitiesList}>
      <div className={styles.seasonTabs}>
        {seasons.map((s) => (
          <button
            key={s.key}
            className={`${styles.seasonTab} ${activeSeason === s.key ? styles.seasonTabActive : ""}`}
            onClick={() => setActiveSeason(s.key)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {categories.map((category) => (
        <div key={category} className={styles.activityCategory}>
          <h3 className={styles.categoryTitle}>{category}</h3>
          <div className={styles.activityItems}>
            {items
              .filter((i) => i.category === category)
              .map((item, idx) => (
                <div key={idx} className={styles.activityItem}>
                  <span className={styles.activityIcon}>{item.icon}</span>
                  <div>
                    <p className={styles.activityLabel}>{item.label}</p>
                    <p className={styles.activityDesc}>{item.desc}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ActivitiesPage() {
  const [searchMarker, setSearchMarker] = useState(null);
  const [selected, setSelected] = useState(null);
  const { user, loading } = useRequireAuth();
  const position = { lat: 46.82942442282928, lng: 6.540003507637307 };
  const t = useTranslations("Activities");

  const handleMapClick = useCallback(() => {
    setSelected(null);
  }, []);

  if (loading) {
    return <div className={styles.loading}>{t('loading')}...</div>;
  } else if (!user) {
    return <div className={styles.error}>{t('error')}</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.overline}>{t('title')}</span>
          <h1>{t('subtitle')}</h1>
          <p className={styles.heroText}>
            {t('desc')}
          </p>
        </section>
        <div className={styles.card}>
          <div className={styles.mapContainer}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <MapContent
                position={position}
                searchMarker={searchMarker}
                setSearchMarker={setSearchMarker}
                selected={selected}
                setSelected={setSelected}
                handleMapClick={handleMapClick}
              />
            </APIProvider>
          </div>
          <div className={styles.contentPanel}>
            <h2>{t('activities-title')}</h2>
            <ActivitiesList activities={ACTIVITIES} />
          </div>
        </div>
      </main>
    </div>
  );
}
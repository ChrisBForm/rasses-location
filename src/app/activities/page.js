"use client";
import styles from "./page.module.css";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, useAdvancedMarkerRef } from "@vis.gl/react-google-maps";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useTranslations } from "next-intl";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

function SearchBox({ onPlaceSelect }) {
  const inputRef = useRef(null);
  const places = useMapsLibrary("places");
  const map = useMap();

  useEffect(() => {
    if (!places || !inputRef.current) return;
    const autocomplete = new places.Autocomplete(inputRef.current);
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        onPlaceSelect({
          geometry: { location: { lat: () => lat, lng: () => lng } },
          name: place.name,
        });
      }
    });
    return () => listener.remove();
  }, [places]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="Search..."
      className={styles.searchBox}
    />
  );
}

function ClusteredMarker ({ activity, clusterer, setFocusedActivity, setSelected }) {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const t = useTranslations("Activities");

  useEffect(() => {
    if (!marker || !clusterer) return;
    clusterer.addMarker(marker);
    return () => clusterer.removeMarker(marker);
  }, [marker, clusterer]);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={{ lat: activity.lat, lng: activity.lng }}
      title={activity.label}
      onClick={(e) => {
        e.stop();
        setFocusedActivity(activity);
        setSelected(activity);
      }}
    >
      <span style={{ fontSize: "1.5rem", cursor: "pointer" }}>
        {activity.icon}
      </span>
    </AdvancedMarker>
  );
}

function MapContent({ activities, position, searchMarker, setSearchMarker, selected, setSelected, handleMapClick, focusedActivity, setFocusedActivity }) {
  const map = useMap();
  const [clusterer, setClusterer] = useState(null);
  const t = useTranslations("Activities");

  // Pan to focused activity when it changes
  useEffect(() => {
    if (focusedActivity?.lat && focusedActivity?.lng && map) {
      map.panTo({ lat: focusedActivity.lat, lng: focusedActivity.lng });
      map.setZoom(18);
    }
  }, [focusedActivity, map]);

  // Set up clusterer once map is ready
  useEffect(() => {
    if (!map) return;
    const newClusterer = new MarkerClusterer({ map });
    setClusterer(newClusterer);
    return () => newClusterer.clearMarkers();
  }, [map]);

  useEffect(() => {
    console.log("searchMarker useEffect:", searchMarker, map);
    if (searchMarker?.lat && searchMarker?.lng && map) {
      map.panTo({ lat: searchMarker.lat, lng: searchMarker.lng });
      map.setZoom(15);
    }
  }, [searchMarker, map]);

  const activityMarkers = Object.values(activities).flat().filter((a) => a.lat && a.lng);

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

          {clusterer && activityMarkers.map((activity, idx) => (
            <ClusteredMarker
              key={`activity-${idx}`}
              activity={activity}
              clusterer={clusterer}
              setFocusedActivity={setFocusedActivity}
              setSelected={setSelected}
            />
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
              <div>
                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{selected.icon} {selected.labelKey ? t(selected.labelKey) : selected.label}</p>
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "#5e4a8a" }} aria-label={t('visitWebsite')}>
                    {t('visitWebsite')} →
                  </a>
                )}
              </div>
            </InfoWindow>
          )}
        </Map>
      </div>
      <aside className={styles.mapSidebar}>
        <SearchBox onPlaceSelect={(place) => {
          console.log("onPlaceSelect called:", place);

          // Handle both function and plain value forms
          const lat = typeof place.geometry.location.lat === "function" 
            ? place.geometry.location.lat() 
            : place.geometry.location.lat;
          const lng = typeof place.geometry.location.lng === "function"
            ? place.geometry.location.lng()
            : place.geometry.location.lng;

          console.log("setting search marker:", lat, lng);
          setSearchMarker({ lat, lng, label: place.name });
        }} />
      </aside>
    </div>
  );
}

const POINTS_OF_INTEREST = [
  { lat: 46.82942442282928, lng: 6.540003507637307, labelKey: "poi.appartment.label", icon: "🏠" }
];

function ActivitiesList({ activities, onActivityClick }) {
  const [activeSeason, setActiveSeason] = useState("all_year");

  const t = useTranslations("Activities");

  const tabs = [
    { key: "winter", label: "winter" },
    { key: "summer", label: "summer" },
    { key: "all_year", label: "allYear" },
  ];

  const items = activities[activeSeason] || [];
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className={styles.activitiesList}>
      <div className={styles.seasonTabs}>
        {tabs.map((s) => (
            <button
            key={s.key}
            className={`${styles.seasonTab} ${activeSeason === s.key ? styles.seasonTabActive : ""}`}
            onClick={() => setActiveSeason(s.key)}
          >
            {t(s.label)}
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
                <div
                  key={idx}
                  className={`${styles.activityItem} ${item.lat ? styles.activityItemClickable : ""}`}
                  onClick={() => item.lat && onActivityClick(item)}
                >
                  <span className={styles.activityIcon}>{item.icon}</span>
                  <div className={styles.activityContent}>
                    <div className={styles.activityHeader}>
                      <p className={styles.activityLabel}>{item.labelKey ? t(item.labelKey) : item.label}</p>
                      <div className={styles.activityActions}>
                        {item.lat && (
                          <span className={styles.mapPin} title={t('showOnMap')}>📍</span>
                        )}
                        {item.website && (
                          
                            <a href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.activityLink}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={t('visitWebsite')}
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    </div>
                    {(item.descKey || item.desc) && <p className={styles.activityDesc}>{item.descKey ? t(item.descKey) : item.desc}</p>}
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
  const [focusedActivity, setFocusedActivity] = useState(null);
  const [activities, setActivities] = useState({ winter: [], summer: [], all_year: []});
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const { user, loading } = useRequireAuth();
  const position = { lat: 46.82942442282928, lng: 6.540003507637307 };
  const t = useTranslations("Activities");
  const mapRef = useRef(null);
  const handleMapClick = useCallback(() => {
    setSelected(null);
  }, []);
  const handleActivityClick = (activity) => {
    setFocusedActivity(activity);
    setSelected(activity);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    async function fetchActivities() {
      try {
        const res = await fetch("/api/activities");
        const data = await res.json();
        setActivities(data);
      } catch {
        console.error("Failed to load activities");
      } finally {
        setActivitiesLoading(false);
      }
    }
    fetchActivities();
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
          <p className={styles.heroText}>{t('desc')}</p>
        </section>
        <div className={styles.card}>
          <div className={styles.mapContainer} ref={mapRef}>
            <APIProvider 
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
              libraries={["places"]}
            >
              <MapContent
                activities={activities}
                position={position}
                searchMarker={searchMarker}
                setSearchMarker={setSearchMarker}
                selected={selected}
                setSelected={setSelected}
                handleMapClick={handleMapClick}
                focusedActivity={focusedActivity}
                setFocusedActivity={setFocusedActivity}
              />
            </APIProvider>
          </div>
          <div className={styles.contentPanel}>
            <h2>{t('activities-title')}</h2>
            <ActivitiesList
              activities={activities}
              onActivityClick={handleActivityClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
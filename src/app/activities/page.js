"use client";
import styles from "./page.module.css";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap, AdvancedMarkerElement } from "@vis.gl/react-google-maps";
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

function MapContent({ position, searchMarker, setSearchMarker, selected, setSelected, handleMapClick, focusedActivity, setFocusedActivity }) {
  const map = useMap();
  const clustererRef = useRef(null);
  const markersRef = useRef([]);

  // Pan to focused activity when it changes
  useEffect(() => {
    if (focusedActivity?.lat && focusedActivity?.lng && map) {
      map.panTo({ lat: focusedActivity.lat, lng: focusedActivity.lng });
      map.setZoom(15);
    }
  }, [focusedActivity, map]);

  useEffect(() => {
    if (!map) return;
    clustererRef.current = new MarkerClusterer({ map });
    return () => clustererRef.current?.clearMarkers();
  }, [map]);

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

          {/* Activity markers */}
          {Object.values(ACTIVITIES).flat().filter((a) => a.lat && a.lng).map((activity, idx) => (
            <AdvancedMarker
              key={`activity-${idx}`}
              position={{ lat: activity.lat, lng: activity.lng }}
              title={activity.label}
              ref={(marker) => {
                if (marker && clustererRef.current) {
                  if (!markersRef.current.includes(marker)) {
                    markersRef.current.push(marker);
                    clustererRef.current.addMarker(marker);
                  }
                }
              }}
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
                <p style={{ margin: "0 0 4px", fontWeight: 600 }}>{selected.icon} {selected.label}</p>
                {selected.website && (
                  <a href={selected.website} target="_blank" rel="noreferrer" style={{ fontSize: "0.85rem", color: "#5e4a8a" }}>
                    Visit website →
                  </a>
                )}
              </div>
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
  { lat: 46.82942442282928, lng: 6.540003507637307, label: "Appartment", icon: "🏠" }
];

const ACTIVITIES = {
  winter: [

  ],
  summer: [

  ],
  all_year: [
    
  ],
  food: [
    { category: "Restaurant", icon: "🍽️", label: "Les Planets", desc: "Closest restaurant that serves local food", website: "https://hotel-lesplanets.ch/restaurant/", lat: 46.8304, lng: 6.5425 },
    { category: "Restaurant", icon: "🍽️", label: "Belle époque", desc: "Grand Hotel restaurant, for a more 'premium' experience.", website: "https://www.grandhotelrasses.ch/restaurant", lat: 46.8277, lng: 6.5346 },
    { category: "Restaurant", icon: "🍽️", label: "Le Central", desc: "Friendly establishment that serves local food", website: "https://fr.tripadvisor.ch/Restaurant_Review-g6276946-d10699930-Reviews-Le_Central-Bullet_Canton_of_Vaud.html", lat: 46.8306, lng: 6.5542 },
    { category: "Restaurant", icon: "🍽️", label: "Ming Shan", desc: "", website: "", lat: 46.8326, lng: 6.5589 },
    { category: "Alpine lodge", icon: "🫕", label: "Les Avattes", desc: "", website: "", lat: 46.8363, lng: 6.5239 },
    { category: "Alpine lodge", icon: "🫕", label: "La Grandsonnaz-Dessus", desc: "", website: "https://yverdonlesbainsregion.ch/poi/chalet-de-la-grandsonnaz-dessus/", lat: 46.8597, lng: 6.5518 },
    { category: "Alpine lodge", icon: "🫕", label: "Le Chasseron", desc: "", website: "", lat: 46.8504, lng: 6.5389 },
    { category: "Asian", icon: "🍜", label: "Wok", desc: "", website: "", lat: 46.8217, lng: 6.5032 },
    { category: "Asian", icon: "🍜", label: "Thaï Siri Take Away", desc: "", website: "", lat: 46.8226, lng: 6.5012 },
    { category: "Asian", icon: "🍜", label: "Nogi Kawa Sushi", desc: "", website: "", lat: 46.8244, lng: 6.5004 },
    { category: "Pizzeria", icon: "🍕", label: "Restaurant du centre", desc: "", website: "", lat: 46.8232, lng: 6.5011 },
    { category: "Pizzeria", icon: "🍕", label: "Café du Pont", desc: "", website: "", lat: 46.8239, lng: 6.5010 },
    { category: "Restaurant", icon: "🍽️", label: "El Latino", desc: "", website: "", lat: 46.8202, lng: 6.5020 },
    { category: "Restaurant", icon: "🍽️", label: "Cercle Espagnol", desc: "", website: "", lat: 46.8194, lng: 6.5019 },
    { category: "Restaurant", icon: "🍽️", label: "Buffet de la Gare", desc: "", website: "", lat: 46.8194, lng: 6.5018 },
    { category: "Restaurant", icon: "🥙", label: "Istanbul City Kebab", desc: "", website: "", lat: 46.8219, lng: 6.5022 },
    { category: "Restaurant", icon: "🍽️", label: "La Crêpe Rit", desc: "", website: "", lat: 46.8194, lng: 6.5018 },
    { category: "Restaurant", icon: "🍽️", label: "Café 12", desc: "", website: "", lat: 46.8237, lng: 6.5012 },
    { category: "Restaurant", icon: "🍽️", label: "Grains de Sel", desc: "", website: "", lat: 46.8226, lng: 6.5023 },
  ],
  shop: [
    { category: "Grocery", icon: "🛒", label: "Migros", desc: "", website: "", lat: 46.8197, lng: 6.5022 },
    { category: "Grocery", icon: "🛒", label: "Coop", desc: "", website: "", lat: 46.8228, lng: 6.5015 },
    { category: "Grocery", icon: "🛒", label: "Denner", desc: "", website: "", lat: 46.8201, lng: 6.5026 },
    { category: "Grocery", icon: "🛒", label: "Prima", desc: "", website: "", lat: 46.8306, lng: 6.5543 },
    { category: "Bakery", icon: "🥐", label: "Vuissoz", desc: "", website: "", lat: 46.8226, lng: 6.5022 },
    { category: "Bakery", icon: "🥐", label: "La Gourmandine", desc: "", website: "", lat: 46.8233, lng: 6.5006 },
    { category: "Bakery", icon: "🥐", label: "Chez Bigou", desc: "", website: "", lat: 46.8179, lng: 6.4639 },
    { category: "Bakery", icon: "🥐", label: "Chez Taggi, Tagini & Tagini", desc: "", website: "", lat: 46.8196, lng: 6.4699 },
    { category: "Butcher", icon: "🥩", label: "Centrale Guenat", desc: "", website: "", lat: 46.8231, lng: 6.5022 },
    { category: "Butcher", icon: "🥩", label: "Naef Sàrl", desc: "", website: "", lat: 46.8231, lng: 6.5014 },
    { category: "Other", icon: "🧀", label: "Marché Sottas", desc: "", website: "", lat: 46.8232, lng: 6.5014 },
    { category: "Other", icon: "🧀", label: "Chalet neuf", desc: "", website: "", lat: 46.8315, lng: 6.5546 },
    { category: "Other", icon: "🧀", label: "Tyrode", desc: "", website: "", lat: 46.8181, lng: 6.4634 },
    { category: "Other", icon: "🍷", label: "Chez Natalie", desc: "", website: "", lat: 46.8239, lng: 6.5016 },
    { category: "Other", icon: "🍷", label: "Chez Bacchus", desc: "", website: "", lat: 46.8196, lng: 6.5030 },
  ]
};

function ActivitiesList({ activities, onActivityClick }) {
  const [activeSeason, setActiveSeason] = useState("winter");

  const seasons = [
    { key: "winter", label: "❄️ Winter" },
    { key: "summer", label: "☀️ Summer" },
    { key: "all_year", label: "📍 All Year" },
    { key: "food", label: "🍽️ Restaurants"},
    { key: "shop", label: "🛒 Shops"}
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
                <div
                  key={idx}
                  className={`${styles.activityItem} ${item.lat ? styles.activityItemClickable : ""}`}
                  onClick={() => item.lat && onActivityClick(item)}
                >
                  <span className={styles.activityIcon}>{item.icon}</span>
                  <div className={styles.activityContent}>
                    <div className={styles.activityHeader}>
                      <p className={styles.activityLabel}>{item.label}</p>
                      <div className={styles.activityActions}>
                        {item.lat && (
                          <span className={styles.mapPin} title="Show on map">📍</span>
                        )}
                        {item.website && (
                          
                            <a href={item.website}
                            target="_blank"
                            rel="noreferrer"
                            className={styles.activityLink}
                            onClick={(e) => e.stopPropagation()}
                          >
                            ↗
                          </a>
                        )}
                      </div>
                    </div>
                    {item.desc && <p className={styles.activityDesc}>{item.desc}</p>}
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
  const { user, loading } = useRequireAuth();
  const position = { lat: 46.82942442282928, lng: 6.540003507637307 };
  const t = useTranslations("Activities");

  const handleMapClick = useCallback(() => {
    setSelected(null);
  }, []);

  const handleActivityClick = (activity) => {
    setFocusedActivity(activity);
    setSelected(activity);
  };

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
          <div className={styles.mapContainer}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <MapContent
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
              activities={ACTIVITIES}
              onActivityClick={handleActivityClick}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
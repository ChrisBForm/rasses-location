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

function ClusteredMarker ({ activity, clusterer, setFocusedActivity, setSelected }) {
  const [markerRef, marker] = useAdvancedMarkerRef();

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

function MapContent({ position, searchMarker, setSearchMarker, selected, setSelected, handleMapClick, focusedActivity, setFocusedActivity }) {
  const map = useMap();
  const [clusterer, setClusterer] = useState(null);

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

  const activityMarkers = Object.values(ACTIVITIES).flat().filter((a) => a.lat && a.lng);

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
  winter: [],
  summer: [
    { category: "Alpine lodge", icon: "🫕", label: "La Grandsonnaz-Dessus", desc: "A classic mountain stop with a warm welcome. Great place to rest after a hike or set off from.", website: "https://yverdonlesbainsregion.ch/poi/chalet-de-la-grandsonnaz-dessus/", lat: 46.8597, lng: 6.5518 },
  ],
  all_year: [
    { category: "Alpine lodge", icon: "🫕", label: "Les Avattes", desc: "Stunning panoramic views and hearty homemade food — the perfect reward after a walk. Cash only.", website: "https://www.chaletrestaurantlesavattes.com/", lat: 46.8363, lng: 6.5239 },
    { category: "Alpine lodge", icon: "🫕", label: "Le Chasseron", desc: "Perched at the summit, this mountain restaurant offers breathtaking views over the Alps and Jura.", website: "https://yverdonlesbainsregion.ch/poi/hotel-restaurant-du-chasseron/", lat: 46.8504, lng: 6.5389 },
    { category: "Restaurant", icon: "🍽️", label: "Les Planets", desc: "The closest restaurant to the apartment. Cozy atmosphere serving traditional local cuisine.", website: "https://hotel-lesplanets.ch/restaurant/", lat: 46.8304, lng: 6.5425 },
    { category: "Restaurant", icon: "🍽️", label: "Belle époque", desc: "Elegant dining at the Grand Hotel Rasses. A refined setting for a special evening out.", website: "https://www.grandhotelrasses.ch/restaurant", lat: 46.8277, lng: 6.5346 },
    { category: "Restaurant", icon: "🍽️", label: "Le Central", desc: "A welcoming local spot with a relaxed vibe. Good for a casual meal with the family.", website: "https://fr.tripadvisor.ch/Restaurant_Review-g6276946-d10699930-Reviews-Le_Central-Bullet_Canton_of_Vaud.html", lat: 46.8306, lng: 6.5542 },
    { category: "Asian", icon: "🍜", label: "Wok", desc: "Small family-run Chinese restaurant. Note: closing permanently on July 18th, 2026.", website: "https://www.wokasiatique.ch/", lat: 46.8217, lng: 6.5032 },
    { category: "Asian", icon: "🍜", label: "Thaï Siri Take Away", desc: "Affordable and tasty Thai food, great for a quick and satisfying meal.", website: "https://thaisiri.ch/", lat: 46.8226, lng: 6.5012 },
    { category: "Asian", icon: "🍜", label: "Nogi Kawa Sushi", desc: "Fresh and well-crafted sushi in the heart of Sainte-Croix.", website: "https://nogi-kawa-sushi.ch/", lat: 46.8244, lng: 6.5004 },
    { category: "Pizzeria", icon: "🍕", label: "Restaurant du centre", desc: "Casual pizzeria in the town center, good for a straightforward and satisfying meal.", website: "https://cafe-restaurant-du-centre.digitalone.site/", lat: 46.8232, lng: 6.5011 },
    { category: "Pizzeria", icon: "🍕", label: "Café du Pont", desc: "A local favourite for pizza, with a friendly atmosphere and generous portions.", website: "https://yverdonlesbainsregion.ch/poi/restaurant-pizzeria-cafe-du-pont/", lat: 46.8239, lng: 6.5010 },
    { category: "Restaurant", icon: "🍽️", label: "El Latino", desc: "A taste of Latin America in Sainte-Croix, with warm flavours and a lively setting.", website: "https://www.local.ch/fr/d/ste-croix/1450/restaurant/el-latino-b1795oQ8X-JCJbubixTWpA", lat: 46.8202, lng: 6.5020 },
    { category: "Restaurant", icon: "🍽️", label: "Cercle Espagnol", desc: "Spanish-inspired cuisine in a convivial club atmosphere.", website: "https://fr.restaurantguru.com/Cercle-espagnol-Sainte-Croix", lat: 46.8194, lng: 6.5019 },
    { category: "Restaurant", icon: "🍽️", label: "Buffet de la Gare", desc: "Convenient spot by the train station, good for a quick bite before or after a journey.", website: "https://fr.restaurantguru.com/Kiosque-Gare-de-Sainte-Croix-Sainte-Croix", lat: 46.8194, lng: 6.5018 },
    { category: "Restaurant", icon: "🥙", label: "Istanbul City Kebab", desc: "Generous kebabs and grilled meats at an affordable price.", website: "https://www.istanbulcitykebabsaintecroix.ch/", lat: 46.8219, lng: 6.5022 },
    { category: "Restaurant", icon: "🍽️", label: "La Crêpe Rit", desc: "Charming crêperie serving both sweet and savoury crêpes.", website: "https://www.alacreperit.ch/", lat: 46.8194, lng: 6.5018 },
    { category: "Restaurant", icon: "🍽️", label: "Café 12", desc: "A modern café-restaurant with a varied menu, popular with locals.", website: "https://www.cafe-12.ch/", lat: 46.8237, lng: 6.5012 },
    { category: "Restaurant", icon: "🍽️", label: "Grains de Sel", desc: "Well-regarded local restaurant. Note: relocating to a new address at the end of July 2026.", website: "https://grainsdesel.ch/", lat: 46.8226, lng: 6.5023 },
    { category: "Grocery", icon: "🛒", label: "Migros", desc: "Large supermarket chain, good for everyday essentials at reasonable prices.", website: "", lat: 46.8197, lng: 6.5022 },
    { category: "Grocery", icon: "🛒", label: "Coop", desc: "Well-stocked supermarket with a wide selection including organic and local products.", website: "", lat: 46.8228, lng: 6.5015 },
    { category: "Grocery", icon: "🛒", label: "Denner", desc: "Budget-friendly supermarket, ideal for stocking up on basics.", website: "", lat: 46.8201, lng: 6.5026 },
    { category: "Grocery", icon: "🛒", label: "Prima", desc: "Small local grocery store in Bullet, handy for quick stops close to the apartment.", website: "https://www.epiceriebullet.ch/", lat: 46.8306, lng: 6.5543 },
    { category: "Bakery", icon: "🥐", label: "Vuissoz", desc: "Popular local bakery known for fresh bread and pastries.", website: "https://vuissoz.com/sainte-croix/", lat: 46.8226, lng: 6.5022 },
    { category: "Bakery", icon: "🥐", label: "La Gourmandine", desc: "Artisan bakery with a great selection of breads, cakes, and pastries.", website: "https://la-gourmandine.ch/", lat: 46.8233, lng: 6.5006 },
    { category: "Bakery", icon: "🥐", label: "Chez Bigou", desc: "Charming village bakery a short drive away, worth the trip for their specialities.", website: "https://www.sumupbookings.com/chez-bigou-sarl", lat: 46.8179, lng: 6.4639 },
    { category: "Bakery", icon: "🥐", label: "Chez Taggi, Tagini & Tagini", desc: "Traditional bakery in l'Auberson with homemade regional specialities.", website: "https://www.local.ch/fr/d/lauberson/1454/boulangerie-et-patisserie/chez-taggi-b1cXrlg7_GynY1tSyk9_kQ", lat: 46.8196, lng: 6.4699 },
    { category: "Butcher", icon: "🥩", label: "Centrale Guenat", desc: "Reputable local butcher with quality cuts and charcuterie.", website: "https://www.boucheriecentrale.ch/", lat: 46.8231, lng: 6.5022 },
    { category: "Butcher", icon: "🥩", label: "Naef Sàrl", desc: "Traditional butcher shop with locally sourced meats.", website: "https://www.suisseterroir.ch/adresse/boucherie-naef---successeur-sebastien-osti/2128/FR", lat: 46.8231, lng: 6.5014 },
    { category: "Other", icon: "🧀", label: "Marché Sottas", desc: "Local dairy and cheese shop with regional specialities.", website: "https://www.local.ch/fr/d/ste-croix/1450/laiterie/laiterie-du-marche-HjTKQa4Ww-HjUA6lhq654w", lat: 46.8232, lng: 6.5014 },
    { category: "Other", icon: "🧀", label: "Chalet neuf", desc: "Farmhouse cheese producer in Bullet, selling fresh local cheese directly.", website: "https://bullet.ch/locations/fromagerie-du-chalet-neuf/", lat: 46.8315, lng: 6.5546 },
    { category: "Other", icon: "🧀", label: "Tyrode", desc: "Artisan cheese producer known for traditional Jura recipes.", website: "https://www.tyrode.ch/", lat: 46.8181, lng: 6.4634 },
    { category: "Other", icon: "🍷", label: "Chez Natalie", desc: "Charming wine cellar with a curated selection of Swiss and regional wines.", website: "https://cavecheznathalie.ch/", lat: 46.8239, lng: 6.5016 },
    { category: "Other", icon: "🍷", label: "Chez Bacchus", desc: "Well-stocked wine shop and vinotheque with a wide range of bottles to take home.", website: "https://chardonnens-boissons.ch/store/chez-bacchus-vinotheque-ste-croix", lat: 46.8196, lng: 6.5030 },
    { category: "Venue", icon: "🏛️", label: "Ming Shan", desc: "A peaceful seminar and retreat center nestled in nature, offering meals to guests and seminar attendees.", website: "https://www.mingshan.ch/", lat: 46.8326, lng: 6.5589 },
  ],
};

function ActivitiesList({ activities, onActivityClick }) {
  const [activeSeason, setActiveSeason] = useState("all_year");

  const tabs = [
    { key: "winter", label: "❄️ Winter" },
    { key: "summer", label: "☀️ Summer" },
    { key: "all_year", label: "📅 All Year" },
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
  const mapRef = useRef(null);

  const handleMapClick = useCallback(() => {
    setSelected(null);
  }, []);

  const handleActivityClick = (activity) => {
    setFocusedActivity(activity);
    setSelected(activity);
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
          <div className={styles.mapContainer} ref={mapRef}>
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
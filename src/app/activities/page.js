"use client";
import styles from "./page.module.css";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useState, useCallback } from "react";

const POINTS_OF_INTEREST = [
  { lat: 46.82942442282928, lng: 6.540003507637307, label: "Appartment", icon: "🏠" },
  { lat: 46.83078, lng: 6.54101, label: "Ski resort", icon: "⛷️" }
];

export default function ActivitiesPage() {
  const [selected, setSelected] = useState(null);
  const { user, loading } = useRequireAuth();
  const position = { lat: 46.82942442282928, lng: 6.540003507637307 };

  const handleMapClick = useCallback(() => {
    setSelected(null);
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  } else if (!user) {
    return <div className={styles.error}>You must be signed in to view this page.</div>;
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.overline}>Activities</span>
          <h1>Find Rasses Location on the map</h1>
          <p className={styles.heroText}>
            Explore the property location and nearby activities with an interactive map.
          </p>
        </section>
        <div className={styles.card}>
          <div className={styles.mapContainer}>
            <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
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
            </APIProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
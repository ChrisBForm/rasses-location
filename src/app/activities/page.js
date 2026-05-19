"use client";
import styles from "./page.module.css";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";
import useRequireAuth from "@/hooks/useRequireAuth";

export default function ActivitiesPage() {
  const { user, loading } = useRequireAuth();
  const position = { lat: 46.82942442282928, lng: 6.540003507637307 };

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
              >
                <Marker position={position} />
              </Map>
            </APIProvider>
          </div>
        </div>
      </main>
    </div>
  );
}
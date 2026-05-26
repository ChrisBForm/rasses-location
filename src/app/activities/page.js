"use client";
import styles from "./page.module.css";
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from "@vis.gl/react-google-maps";
import useRequireAuth from "@/hooks/useRequireAuth";
import { useState, useCallback, useEffect, useRef } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

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
      placeholder="Search nearby..."
      className={styles.searchBox}
    />
  );
}

function MapContent({ position, searchMarker, setSearchMarker, selected, setSelected, handleMapClick }) {
  return (
    <>
      <SearchBox onPlaceSelect={(place) => {
        setSearchMarker({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          label: place.name,
        });
      }} />
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
    </>
  );
}

const POINTS_OF_INTEREST = [
  { lat: 46.82942442282928, lng: 6.540003507637307, label: "Appartment", icon: "🏠" },
  { lat: 46.83078, lng: 6.54101, label: "Ski resort", icon: "⛷️" }
];

export default function ActivitiesPage() {
  const [searchMarker, setSearchMarker] = useState(null);
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
        </div>
      </main>
    </div>
  );
}
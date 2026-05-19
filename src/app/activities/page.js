"use client";
import Link from "next/link";
import { useMemo, useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import { storage } from "@/lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { APIProvider, Map, Marker } from "@vis.gl/react-google-maps";

export default function ActivitiesPage() {
    const position = { lat : 46.82942442282928, lng: 6.540003507637307}; // Rasses Location coordinates
    
    return (
        <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
            <Map
                defaultCenter={position}
                defaultZoom={15}
                style={{ width: "100%", height: "400px" }}
            >
                <Marker position={position} />
            </Map>
        </APIProvider>
    );
}
"use client";
import { useMemo, useEffect, useState, useRef } from "react";
import styles from "./page.module.css";
import { storage } from "../../lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default function Home() {
  const [tiles, setTiles] = useState([]);
  const [flowerUrls, setFlowerUrls] = useState([]);
  const flowersRef = useRef(null);
  const gridRef = useRef(null);

  useEffect(() => {
    const folderRef = ref(storage, "house");
    listAll(folderRef).then(result => {
      Promise.all(result.items.map(item => getDownloadURL(item)))
        .then(urls => {
          Promise.all(
            urls.map(src =>
              new Promise(resolve => {
                const img = new Image();
                img.onload = () =>
                  resolve({ src, width: img.naturalWidth, height: img.naturalHeight });
                img.onerror = () =>
                  resolve({ src, width: 400, height: 300 });
                img.src = src;
              })
            )
          ).then(setTiles);
        });
    });
  }, []);

  useEffect(() => {
    fetch("/api/flowers")
      .then(r => r.json())
      .then(setFlowerUrls);
  }, []);

  // Parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (flowersRef.current) {
        // Flowers move faster (more parallax)
        flowersRef.current.style.transform = `translateY(${scrollY * 0.4}px)`;
      }
      if (gridRef.current) {
        // Tiles move slower (subtle parallax)
        gridRef.current.style.transform = `translateY(${scrollY * 0.15}px)`;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const flowers = useMemo(() => {
    if (flowerUrls.length === 0) return [];
    
    const cols = Math.ceil(Math.sqrt(flowerUrls.length));
    const rows = Math.ceil(flowerUrls.length / cols);
    
    return flowerUrls
      .map((src, i) => {
        // Randomly skip ~40% of flowers
        if (Math.random() < 0.4) return null;
      
        const col = i % cols;
        const row = Math.floor(i / cols);
      
        const top = (row / rows) * 90 + Math.random() * (90 / rows * 0.6);
        const left = (col / cols) * 90 + Math.random() * (90 / cols * 0.6);
      
        return {
          src,
          top,
          left,
          size: Math.round(60 + Math.random() * 60),
          rotate: Math.round((Math.random() - 0.5) * 40),
        };
      })
      .filter(Boolean);
  }, [flowerUrls]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div ref={gridRef} className={styles.grid}>
          {tiles.map((tile, i) => (
            <div
              key={i}
              className={styles.tile}
              style={{
                aspectRatio: `${tile.width} / ${tile.height}`,
                gridColumn: `span ${Math.round((tile.width / tile.height) * 4)}`,
              }}
            >
              <img
                src={tile.src}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "34px" }}
              />
            </div>
          ))}
        </div>
        <div 
          ref={flowersRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        >
          {flowers.map((flower, index) => (
            <div
              key={index}
              className={styles.flower}
              style={{
                top: `${flower.top}%`,
                left: `${flower.left}%`,
                width: `${flower.size}px`,
                height: `${flower.size}px`,
                transform: `translate(-50%, -50%) rotate(${flower.rotate}deg)`,
              }}
            >
              <img src={flower.src} alt="Marguerite" />
            </div>
          ))}
        </div>
        <div className={styles.heroAction}>
          <a href="/auth">CONNEXION</a>
        </div>
      </main>
    </div>
  );
}
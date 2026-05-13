"use client";
import { useMemo, useEffect, useState } from "react";
import styles from "./page.module.css";
import { storage } from "../../lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";

export default function Home() {
  const [tiles, setTiles] = useState([]);
  const [flowerUrls, setFlowerUrls] = useState([]);

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

  const flowers = useMemo(() => {
    if (flowerUrls.length === 0) return [];
    return flowerUrls.map(src => ({
      src,
      top: Math.random() * 90,
      left: Math.random() * 90,
      size: Math.round(60 + Math.random() * 60),
      rotate: Math.round((Math.random() - 0.5) * 40),
    }));
  }, [flowerUrls]);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.grid}>
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
        <div className={styles.heroAction}>
          <a href="/manuals">MANUALS</a>
        </div>
      </main>
    </div>
  );
}
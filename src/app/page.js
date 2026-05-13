"use client";
import { useMemo, useEffect, useState } from "react";
import styles from "./page.module.css";
import { storage } from "../../lib/firebase/config";
import { ref, listAll, getDownloadURL } from "firebase/storage";

const flowerNames = Array.from({ length: 12 }, (_, i) =>
  `/marguerite/marguerite${i + 1}.svg`
);
const flowerPositions = [
  { top: 12, left: 18, size: 82, rotate: -8 },
  { top: 18, left: 70, size: 96, rotate: 12 },
  { top: 48, left: 30, size: 68, rotate: -12 },
  { top: 60, left: 80, size: 76, rotate: 20 },
  { top: 76, left: 16, size: 60, rotate: -14 },
];

function randomFlower() {
  return flowerNames[Math.floor(Math.random() * flowerNames.length)];
}

export default function Home() {
  const [tiles, setTiles] = useState([]);

  useEffect(() => {
    const folderRef = ref(storage, "house");

    listAll(folderRef).then(result => {
      Promise.all(
        result.items.map(item => getDownloadURL(item))
      ).then(urls => {
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

  const flowers = useMemo(
    () =>
      flowerPositions.map(position => ({
        ...position,
        src: randomFlower(),
        offsetX: Math.round((Math.random() - 0.5) * 14),
        offsetY: Math.round((Math.random() - 0.5) * 14),
      })),
    []
  );

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
              top: `calc(${flower.top}% + ${flower.offsetY}px)`,
              left: `calc(${flower.left}% + ${flower.offsetX}px)`,
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
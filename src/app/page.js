"use client";

import { useMemo } from "react";
import styles from "./page.module.css";

const flowerNames = Array.from({ length: 12 }, (_, index) =>
  `/marguerite/marguerite${index + 1}.svg`
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
  const flowers = useMemo(
    () =>
      flowerPositions.map((position) => ({
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
          <div className={`${styles.tile} ${styles.purple} ${styles.purple1}`} />
          <div className={`${styles.tile} ${styles.purple} ${styles.purple2}`} />
          <div className={`${styles.tile} ${styles.purple} ${styles.purple3}`} />
          <div className={`${styles.tile} ${styles.purple} ${styles.purple4}`} />
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
          <button>MANUALS</button>  
        </div>
      </main>
    </div>
  );
}

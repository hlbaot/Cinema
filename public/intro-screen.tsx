"use client";

import { useEffect, useState } from "react";
import styles from "@/src/scss/intro-screen.module.scss";

const INTRO_DURATION_MS = 3200;
const EXIT_DURATION_MS = 700;
const SESSION_KEY = "cinepro-intro-seen";

function FilmLogo() {
  return (
    <div className={styles.logoFrame} aria-hidden="true">
      <div className={styles.filmIcon}>
        <div className={styles.filmColumnLeft} />
        <div className={styles.filmColumnRight} />
        <div className={styles.filmBand} />
        <div className={styles.filmGlow} />
      </div>
    </div>
  );
}

type IntroScreenProps = {
  children: React.ReactNode;
};

export default function IntroScreen({ children }: IntroScreenProps) {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const hasSeenIntro = window.sessionStorage.getItem(SESSION_KEY) === "true";

    if (hasSeenIntro) {
      const skipTimer = window.setTimeout(() => {
        setVisible(false);
        setReady(true);
      }, 0);

      return () => {
        window.clearTimeout(skipTimer);
      };
    }

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, INTRO_DURATION_MS);

    const doneTimer = window.setTimeout(() => {
      window.sessionStorage.setItem(SESSION_KEY, "true");
      setVisible(false);
      setReady(true);
    }, INTRO_DURATION_MS + EXIT_DURATION_MS);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(doneTimer);
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [visible]);

  const contentClassName = `${styles.content} ${
    ready || !visible ? styles.contentVisible : styles.contentHidden
  }`;
  const overlayClassName = `${styles.overlay} ${exiting ? styles.overlayExiting : ""}`;

  return (
    <div className={styles.shell}>
      <div className={contentClassName}>{children}</div>

      {visible ? (
        <div className={overlayClassName} role="status" aria-live="polite" aria-label="Loading CinePro">
          <div className={styles.centerpiece}>
            <div className={styles.halo} />
            <FilmLogo />
            <div className={styles.wordmark}>
              {"CINEPRO".split("").map((letter, index) => (
                <span key={`${letter}-${index}`}>{letter}</span>
              ))}
            </div>
            <p className={styles.subline}>cinematic premium experience</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

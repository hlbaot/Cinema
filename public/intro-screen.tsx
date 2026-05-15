"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import styles from "@/src/scss/intro-screen.module.scss";

const INTRO_DURATION_MS = 3200;
const EXIT_DURATION_MS = 700;
const SESSION_KEY = "cinepro-intro-seen-v2";
const SKIP_NEXT_KEY = "cinepro-intro-skip-next";

/** Trang “vào web” — intro chỉ chạy lần đầu session tại đây */
function shouldPlayIntro(pathname: string) {
  return pathname === "/" || pathname === "/trangChu";
}

function readSessionFlag(key: string) {
  try {
    return window.sessionStorage.getItem(key) === "true";
  } catch {
    return false;
  }
}

function writeSessionFlag(key: string) {
  try {
    window.sessionStorage.setItem(key, "true");
  } catch {
    /* ignore */
  }
}

function removeSessionFlag(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

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

type IntroPhase = "boot" | "intro" | "exiting" | "idle";

type IntroScreenProps = {
  children: React.ReactNode;
};

export default function IntroScreen({ children }: IntroScreenProps) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>("boot");
  const timersRef = useRef<number[]>([]);
  const playedRef = useRef(false);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    clearTimers();

    const finishIdle = () => {
      setPhase("idle");
    };

    const skipIntro = () => {
      playedRef.current = true;
      finishIdle();
    };

    if (!shouldPlayIntro(pathname)) {
      skipIntro();
      return () => clearTimers();
    }

    if (readSessionFlag(SKIP_NEXT_KEY)) {
      removeSessionFlag(SKIP_NEXT_KEY);
      writeSessionFlag(SESSION_KEY);
      skipIntro();
      return () => clearTimers();
    }

    if (readSessionFlag(SESSION_KEY)) {
      skipIntro();
      return () => clearTimers();
    }

    // Đã bắt đầu intro trong session này (vd. redirect / → /trangChu)
    if (playedRef.current) {
      return () => clearTimers();
    }

    playedRef.current = true;
    setPhase("intro");

    schedule(() => setPhase("exiting"), INTRO_DURATION_MS);

    schedule(() => {
      writeSessionFlag(SESSION_KEY);
      setPhase("idle");
    }, INTRO_DURATION_MS + EXIT_DURATION_MS);

    return () => clearTimers();
  }, [mounted, pathname]);

  useEffect(() => {
    const lockScroll = mounted && (phase === "intro" || phase === "exiting" || phase === "boot");
    if (!lockScroll) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mounted, phase]);

  const showBoot = !mounted || phase === "boot";
  const showIntroOverlay = phase === "intro" || phase === "exiting";
  const hideContent = showBoot || showIntroOverlay;

  const contentClassName = `${styles.content} ${
    hideContent ? styles.contentHidden : styles.contentVisible
  }`;
  const overlayClassName = `${styles.overlay} ${phase === "exiting" ? styles.overlayExiting : ""}`;

  return (
    <div className={styles.shell}>
      <div className={contentClassName} aria-hidden={hideContent}>
        {children}
      </div>

      {showBoot ? <div className={styles.boot} aria-hidden="true" /> : null}

      {showIntroOverlay ? (
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

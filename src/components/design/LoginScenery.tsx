"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import styles from "./LoginWorld.module.css";

/** One landscape; foreground objects have real alpha, never blended paper rectangles. */
export default function LoginScenery() {
  const scene = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let x = 0;
    let y = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      scene.current?.style.setProperty("--pointer-x", "0px");
      scene.current?.style.setProperty("--pointer-y", "0px");
    };
    const move = (event: PointerEvent) => {
      if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch") return;
      x = (event.clientX / innerWidth - .5) * 10;
      y = (event.clientY / innerHeight - .5) * 6;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        scene.current?.style.setProperty("--pointer-x", `${x.toFixed(2)}px`);
        scene.current?.style.setProperty("--pointer-y", `${y.toFixed(2)}px`);
        frame = 0;
      });
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", reset);
    finePointer.addEventListener("change", reset);
    reducedMotion.addEventListener("change", reset);
    return () => {
      reset();
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", reset);
      finePointer.removeEventListener("change", reset);
      reducedMotion.removeEventListener("change", reset);
    };
  }, []);

  return <div ref={scene} className={styles.scenery} aria-hidden="true">
    <Image src="/images/login/world.png" alt="" fill sizes="100vw" priority className={styles.landscape} />
    <div className={styles.centralHaze} />
    <div className={styles.mist}><span /><span /></div>
    <div className={`${styles.object} ${styles.bottle}`}><Image src="/images/login/bottle.png" alt="" fill sizes="(max-width:600px) 180px, (max-width:1000px) 280px, 430px" priority className={styles.cutout} /></div>
    <div className={`${styles.object} ${styles.journal}`}><Image src="/images/login/journal.png" alt="" fill sizes="(max-width:600px) 190px, (max-width:1000px) 300px, 460px" className={styles.cutout} /></div>
    <div className={`${styles.branchPosition} ${styles.branchLeft}`}><div className={styles.sway}><Image src="/images/login/branch.png" alt="" fill sizes="(max-width:600px) 160px, 360px" className={styles.cutout} /></div></div>
    <svg className={styles.cartography} viewBox="0 0 400 360" fill="none"><path d="m40 40 55 35 42-18 38 29 20-3 40 32 57-13 29 44-20 35 19 41-47 12-32 48-37-19-29 34-49-30-41 6-20-38-34-17 12-51-25-28 21-40Z"/><path d="m95 75 17 72 58 17 25-81m-83 64-32 54m90-37 33 54 70 16m-70-16-18 63m-15-117 65-49"/><circle cx="305" cy="65" r="38"/><path d="m305 24 6 35 35 6-35 6-6 35-6-35-35-6 35-6Z"/></svg>
  </div>;
}

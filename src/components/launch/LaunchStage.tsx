"use client";

import { useCallback, useEffect, useRef } from "react";
import { INTRO_CLASS, INTRO_STORAGE_KEY, PHONE_INTRO_CLASS } from "@/lib/motion/intro";
import type { LaunchCalendar } from "./scenes";
import { SpeechScene } from "./SpeechScene";
import { useLaunchClock } from "./useLaunchClock";

/** If a finale is interrupted (a background tab, a slow phone), open the site anyway. */
const FINALE_TIMEOUT_MS = 6_000;

interface LaunchStageProps {
  launchAt: string;
  serverNow: number;
  dateLine: string;
  calendar: LaunchCalendar;
  previewSeconds: number | null;
}

export function LaunchStage({ launchAt, serverNow, ...copy }: LaunchStageProps) {
  const { remaining, phase } = useLaunchClock(launchAt, serverNow);
  const live = phase === "live";
  const leaving = useRef(false);

  const goLive = useCallback(() => {
    if (leaving.current) return;
    leaving.current = true;
    try {
      // The home page's opening plays as the reveal.
      localStorage.removeItem(INTRO_STORAGE_KEY);
    } catch {
      // Storage blocked (private mode): the site still opens, just without its intro.
    }
    // The address bar still shows the page the visitor asked for; reload into it.
    const { pathname } = window.location;
    window.location.replace(pathname === "/launch" ? "/" : pathname);
  }, []);

  useEffect(() => {
    // The countdown can be served at "/", where the head script may start the home intro.
    document.documentElement.classList.remove(INTRO_CLASS, PHONE_INTRO_CLASS);
  }, []);

  useEffect(() => {
    if (!live) return;
    const id = window.setTimeout(goLive, FINALE_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [live, goLive]);

  return (
    <>
      <SpeechScene remaining={remaining} phase={phase} finale={live} onFinaleDone={goLive} {...copy} />
      <p role="status" className="sr-only">
        {live ? "The new website is open. Taking you there now." : ""}
      </p>
    </>
  );
}

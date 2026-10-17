/**
 * First-visit hero intro (adapted from Hero_animation/8): a preloader counter,
 * speaking photos wiping in, then the hero. Coordination is by a class on <html>
 * and one window event, so components never reach into DOM they don't own.
 */

export const INTRO_CLASS = "intro";
export const INTRO_EVENT = "tm:intro-done";
export const INTRO_STORAGE_KEY = "tm-intro-seen";
/** Play at most once in this window, across all tabs. */
export const INTRO_REPEAT_MS = 12 * 60 * 60 * 1000;

/**
 * Inline <head> script: runs before first paint. Marks JS as available and decides
 * whether the intro plays (home page, not seen in the last 12 hours, motion allowed).
 */
export const introScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&Date.now()-(+localStorage.getItem('${INTRO_STORAGE_KEY}')||0)>${INTRO_REPEAT_MS}&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('${INTRO_CLASS}')}}catch(e){}})()`;

export function isIntroPlaying(): boolean {
  return document.documentElement.classList.contains(INTRO_CLASS);
}

/** Runs `callback` once the intro has finished (or right away if none is playing). Returns a cancel function. */
export function afterIntro(callback: () => void): () => void {
  if (!isIntroPlaying()) {
    callback();
    return () => {};
  }
  window.addEventListener(INTRO_EVENT, callback, { once: true });
  return () => window.removeEventListener(INTRO_EVENT, callback);
}

/** Ends the intro: reveals the nav (CSS), remembers when it was seen, notifies listeners. Safe to call twice. */
export function finishIntro(): void {
  if (!isIntroPlaying()) return;
  document.documentElement.classList.remove(INTRO_CLASS);
  try {
    localStorage.setItem(INTRO_STORAGE_KEY, String(Date.now()));
  } catch {
    // Storage can be blocked (private mode); the intro simply plays again next time.
  }
  window.dispatchEvent(new Event(INTRO_EVENT));
}

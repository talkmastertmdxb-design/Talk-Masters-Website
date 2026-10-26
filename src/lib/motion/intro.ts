/**
 * First-visit hero intro (adapted from Hero_animation/8): a preloader counter,
 * speaking photos wiping in, then the hero. Coordination is by a class on <html>
 * and one window event, so components never reach into DOM they don't own.
 */

export const INTRO_CLASS = "intro";
/** Phones get a short CSS-only moment instead ("Speak. Lead. Belong."), removed after it plays. */
export const PHONE_INTRO_CLASS = "intro-phone";
/** After the words (1.4s) and the hero's delayed settle (1.15s + 0.9s) have both finished. */
const PHONE_INTRO_MS = 2200;
export const INTRO_EVENT = "tm:intro-done";
/** Versioned: v1 was saved by a bug that ended the intro instantly in development. */
export const INTRO_STORAGE_KEY = "tm-intro-v2";
/** Play at most once in this window, across all tabs. */
export const INTRO_REPEAT_MS = 12 * 60 * 60 * 1000;

/**
 * Inline <head> script: runs before first paint. Marks JS as available and decides
 * whether the intro plays (home page, not seen in the last 12 hours, motion allowed).
 * Laptops get the full intro. Phones get a 1.3s three-word moment instead of the four-second
 * preloader: it plays from CSS alone, so the script records it as seen straight away.
 */
export const introScript = `(function(){var d=document.documentElement;d.classList.add('js');try{if(location.pathname==='/'&&Date.now()-(+localStorage.getItem('${INTRO_STORAGE_KEY}')||0)>${INTRO_REPEAT_MS}&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches){if(window.matchMedia('(min-width: 56.25rem)').matches){d.classList.add('${INTRO_CLASS}')}else{d.classList.add('${PHONE_INTRO_CLASS}');localStorage.setItem('${INTRO_STORAGE_KEY}',String(Date.now()));setTimeout(function(){d.classList.remove('${PHONE_INTRO_CLASS}')},${PHONE_INTRO_MS})}}}catch(e){}})()`;

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

import settings from "../../../content/settings.json";
import { isConcept, parseLaunchAt, type LaunchConcept } from "./launch";

/** The optional `launch` block of content/settings.json (validated in schemas.ts). */
interface LaunchSettings {
  at?: string;
  concept?: string;
}

export interface LaunchConfig {
  /** null: no countdown, the site is open. */
  at: Date | null;
  concept: LaunchConcept;
}

interface LaunchEnv {
  [key: string]: string | undefined;
  LAUNCH_AT?: string;
  LAUNCH_CONCEPT?: string;
  VERCEL_ENV?: string;
}

const fromSettings = (settings as { launch?: LaunchSettings }).launch ?? {};

/**
 * Read at request time, never baked into a page: changing LAUNCH_AT on the server
 * (or the settings file, then deploying) moves the launch without touching code.
 */
export function launchConfig(env: LaunchEnv = process.env): LaunchConfig {
  const concept = [env.LAUNCH_CONCEPT, fromSettings.concept].find(isConcept) ?? "speech";
  return { at: parseLaunchAt({ env: env.LAUNCH_AT, settings: fromSettings.at }), concept };
}

/** The server's clock, read once per request (kept out of components so they stay pure). */
export function serverTime(): number {
  return Date.now();
}

/** Preview links (/launch?in=300) work everywhere except the production site. */
export function previewAllowed(env: LaunchEnv = process.env): boolean {
  return env.VERCEL_ENV !== "production";
}

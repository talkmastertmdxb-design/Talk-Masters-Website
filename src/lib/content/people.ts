import type { Award } from "./schemas";

/** Groups awards by Toastmasters year, preserving the incoming (newest-first) order. */
export function awardsByYear(awards: readonly Award[]): Array<[year: string, awards: Award[]]> {
  return awards.reduce<Array<[string, Award[]]>>((groups, award) => {
    const last = groups.at(-1);
    if (last && last[0] === award.year) {
      return [...groups.slice(0, -1), [last[0], [...last[1], award]]];
    }
    return [...groups, [award.year, [award]]];
  }, []);
}

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

const programmeLabels: Record<Award["programme"], string> = {
  "distinguished-club": "Distinguished Club Program",
  smedley: "Smedley Award",
  "talk-up-toastmasters": "Talk Up Toastmasters",
  "beat-the-clock": "Beat the Clock",
  contest: "Speech contest",
  education: "Education award",
  other: "Recognition",
};

const levelLabels: Record<Award["level"], string> = {
  club: "Club",
  area: "Area",
  division: "Division",
  district: "District",
  region: "Region",
  international: "International",
};

export function programmeLabel(award: Award): string {
  return programmeLabels[award.programme];
}

export function levelLabel(award: Award): string {
  return levelLabels[award.level];
}

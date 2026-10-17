import type { Award, FoundingStage, JourneyMilestone, Member } from "./schemas";

export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

/** "Civil engineer at Example" / "Civil engineer" / "Example" / undefined, as the member chose. */
export function workLine(member: Pick<Member, "occupation" | "organisation">): string | undefined {
  const { occupation, organisation } = member;
  if (occupation && organisation) return `${occupation} at ${organisation}`;
  return occupation ?? organisation;
}

/** Club awards have no recipient; member achievements name the member. */
export function isMemberAchievement(award: Award): boolean {
  return Boolean(award.recipient);
}

/** Calendar year for the achievement timeline. Undated awards use the year their Toastmasters year ends. */
export function achievementYear(award: Award): number {
  if (award.achievedOn) return Number(award.achievedOn.slice(0, 4));
  return Number(award.year.slice(5, 9));
}

/** Achievement timeline groups, newest year first; within a year, most recent first. */
export function achievementsByYear(awards: readonly Award[]): Array<[year: number, awards: Award[]]> {
  const sortKey = (award: Award): string => award.achievedOn ?? `${achievementYear(award)}-00-00`;
  const sorted = awards.toSorted((a, b) => sortKey(b).localeCompare(sortKey(a)));
  return sorted.reduce<Array<[number, Award[]]>>((groups, award) => {
    const year = achievementYear(award);
    const last = groups.at(-1);
    if (last && last[0] === year) {
      return [...groups.slice(0, -1), [year, [...last[1], award]]];
    }
    return [...groups, [year, [award]]];
  }, []);
}

const programmeLabels: Record<Award["programme"], string> = {
  "distinguished-club": "Distinguished Club Program",
  smedley: "Smedley Award",
  "talk-up-toastmasters": "Talk Up Toastmasters",
  "beat-the-clock": "Beat the Clock",
  contest: "Speech contest",
  representation: "Representation",
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

export const programmeLabel = (award: Award): string => programmeLabels[award.programme];
export const levelLabel = (award: Award): string => levelLabels[award.level];

export const foundingStageLabels: Record<FoundingStage, string> = {
  idea: "Idea",
  planning: "Planning",
  "club-formation": "Club Formation",
  chartering: "Chartering",
  "first-meeting": "First Meeting",
  "first-achievement": "First Achievement",
  today: "Today",
};

export const milestoneLabels: Record<JourneyMilestone, string> = {
  "first-meeting": "First meeting",
  "first-table-topic": "First Table Topic",
  "first-speech": "First speech",
  "leadership-role": "Leadership role",
  other: "Milestone",
};

export const impactLabels = {
  career: "Career",
  leadership: "Leadership",
  confidence: "Confidence",
  networking: "Networking",
} as const satisfies Record<keyof Member["impact"], string>;

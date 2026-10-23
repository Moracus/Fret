export const activities = [
  "Learning",
  "Repetition",
  "Songs",
  "Singing",
  "Songwriting",
  "Combined performance",
] as const;
export const focusAreas = [
  "Guitar",
  "Singing",
  "Songwriting",
  "Combined performance",
] as const;
export type Activity = (typeof activities)[number];
export type FocusArea = (typeof focusAreas)[number];
export type SessionInput = {
  date: string;
  minutes: number;
  activity: Activity;
  intent: "Learning" | "Practice";
  focusAreas: FocusArea[];
  notes: string;
};
export type PracticeSession = SessionInput & { id: number };

export function localDay(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function validateSession(input: SessionInput): void {
  const parsed = new Date(`${input.date}T12:00:00`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(input.date) ||
    !Number.isFinite(parsed.getTime()) ||
    localDay(parsed) !== input.date
  ) {
    throw new Error("Enter a valid date as YYYY-MM-DD.");
  }
  if (!Number.isFinite(input.minutes) || input.minutes <= 0)
    throw new Error("Enter a duration greater than zero.");
  if (!activities.includes(input.activity))
    throw new Error("Choose an activity.");
  if (!["Learning", "Practice"].includes(input.intent))
    throw new Error("Choose learning or practice intent.");
  if (
    !input.focusAreas.length ||
    input.focusAreas.some((area) => !focusAreas.includes(area))
  )
    throw new Error("Choose at least one focus area.");
}

export function dailyTotal(sessions: PracticeSession[], date: string): number {
  return sessions
    .filter((session) => session.date === date)
    .reduce((sum, session) => sum + session.minutes, 0);
}

export function formatMinutes(minutes: number): string {
  // Avoid floating-point artifacts without rounding positive short sessions down to zero.
  return Number(minutes.toPrecision(12)).toString();
}

export function groupSessionsByDay(sessions: PracticeSession[]) {
  const days = new Map<
    string,
    { date: string; total: number; data: PracticeSession[] }
  >();
  for (const session of sessions) {
    let day = days.get(session.date);
    if (!day) {
      day = { date: session.date, total: 0, data: [] };
      days.set(session.date, day);
    }
    day.total += session.minutes;
    day.data.push(session);
  }
  return [...days.values()];
}

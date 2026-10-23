import type { SQLiteDatabase } from "expo-sqlite";
import {
  type PracticeSession,
  type SessionInput,
  validateSession,
} from "./model";

// Append migrations in order; never change a migration already released.
const migrations = [
  `CREATE TABLE practice_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,
    minutes REAL NOT NULL CHECK (minutes > 0),
    activity TEXT NOT NULL,
    intent TEXT NOT NULL CHECK (intent IN ('Learning', 'Practice')),
    focus_areas TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT ''
  );
  CREATE INDEX practice_sessions_date ON practice_sessions(date);`,
];

export async function migrate(db: SQLiteDatabase) {
  await db.execAsync("PRAGMA journal_mode = WAL;");
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const current = version?.user_version ?? 0;
  if (current > migrations.length)
    throw new Error("This journal needs a newer version of Fret.");
  await db.withTransactionAsync(async () => {
    for (let index = current; index < migrations.length; index++) {
      await db.execAsync(migrations[index]);
      await db.execAsync(`PRAGMA user_version = ${index + 1}`);
    }
  });
}

type SessionRow = Omit<PracticeSession, "focusAreas"> & { focus_areas: string };
export async function readSessions(
  db: SQLiteDatabase,
): Promise<PracticeSession[]> {
  const rows = await db.getAllAsync<SessionRow>(
    "SELECT * FROM practice_sessions ORDER BY date DESC, id DESC",
  );
  return rows.map(({ focus_areas, ...row }) => ({
    ...row,
    focusAreas: JSON.parse(focus_areas),
  }));
}

export async function saveSession(
  db: SQLiteDatabase,
  input: SessionInput,
  id?: number,
) {
  validateSession(input);
  const values = [
    input.date,
    input.minutes,
    input.activity,
    input.intent,
    JSON.stringify([...new Set(input.focusAreas)]),
    input.notes.trim(),
  ];
  if (id === undefined) {
    await db.runAsync(
      "INSERT INTO practice_sessions (date, minutes, activity, intent, focus_areas, notes) VALUES (?, ?, ?, ?, ?, ?)",
      values,
    );
  } else {
    const result = await db.runAsync(
      "UPDATE practice_sessions SET date = ?, minutes = ?, activity = ?, intent = ?, focus_areas = ?, notes = ? WHERE id = ?",
      [...values, id],
    );
    if (!result.changes) throw new Error("This session no longer exists.");
  }
}

export async function deleteSession(db: SQLiteDatabase, id: number) {
  await db.runAsync("DELETE FROM practice_sessions WHERE id = ?", id);
}

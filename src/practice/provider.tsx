import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { AppState } from "react-native";
import { openDatabaseAsync, type SQLiteDatabase } from "expo-sqlite";
import { deleteSession, migrate, readSessions, saveSession } from "./database";
import { localDay, type PracticeSession, type SessionInput } from "./model";
import { Action, Page, Copy } from "./ui";

type Journal = {
  sessions: PracticeSession[];
  today: string;
  save: (input: SessionInput, id?: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
};
const Context = createContext<Journal | null>(null);

export function PracticeProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<SQLiteDatabase>();
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [today, setToday] = useState(localDay);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const opening = (async () => {
      const connection = await openDatabaseAsync("fret.db");
      try {
        await migrate(connection);
        const saved = await readSessions(connection);
        if (active) {
          setSessions(saved);
          setDb(connection);
        }
        return connection;
      } catch (cause) {
        await connection.closeAsync();
        throw cause;
      }
    })();
    void opening.catch(() => {
      if (active) setError(true);
    });
    return () => {
      active = false;
      void opening
        .then((connection) => connection.closeAsync())
        .catch(() => {});
    };
  }, [attempt]);
  useEffect(() => {
    const update = () => setToday(localDay());
    const timer = setInterval(update, 30000);
    const listener = AppState.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, []);
  if (!db)
    return (
      <Page title="Fret">
        <Copy>
          {error
            ? "Your journal could not be opened. Your saved data has not been replaced."
            : "Opening your journal…"}
        </Copy>
        {error && (
          <Action
            title="Try again"
            onPress={() => {
              setError(false);
              setAttempt((value) => value + 1);
            }}
          />
        )}
      </Page>
    );
  return (
    <Context.Provider
      value={{
        sessions,
        today,
        save: async (input, id) => {
          await saveSession(db, input, id);
          setSessions(await readSessions(db));
        },
        remove: async (id) => {
          await deleteSession(db, id);
          setSessions(await readSessions(db));
        },
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePractice() {
  const journal = useContext(Context);
  if (!journal) throw new Error("PracticeProvider is required.");
  return journal;
}

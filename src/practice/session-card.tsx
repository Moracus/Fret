import { router } from "expo-router";
import { type PracticeSession, formatMinutes } from "./model";
import { Action, Card, Copy, Title } from "./ui";

export function SessionCard({ session }: { session: PracticeSession }) {
  return (
    <Card>
      <Title>
        {session.activity} · {formatMinutes(session.minutes)} min
      </Title>
      <Copy>
        {session.intent} · {session.focusAreas.join(" + ")}
      </Copy>
      {!!session.notes && <Copy>{session.notes}</Copy>}
      <Action
        title="Edit session"
        label={`Edit ${session.activity} session${session.notes ? `: ${session.notes}` : ""}`}
        onPress={() =>
          router.push({ pathname: "/session", params: { id: session.id } })
        }
      />
    </Card>
  );
}

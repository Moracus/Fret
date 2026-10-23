import { router } from "expo-router";
import { usePractice } from "@/practice/provider";
import { dailyTotal, formatMinutes } from "@/practice/model";
import { SessionCard } from "@/practice/session-card";
import { Action, Card, Copy, Page, Title } from "@/practice/ui";

export default function Home() {
  const { sessions, today } = usePractice();
  const todaysSessions = sessions.filter((session) => session.date === today);
  return (
    <Page title="A little practice, every day.">
      <Copy>{today}</Copy>
      <Card>
        <Title>
          {formatMinutes(dailyTotal(sessions, today))} min logged today
        </Title>
        <Copy>Every bit of practice counts.</Copy>
        <Action title="Log practice" onPress={() => router.push("/session")} />
      </Card>
      <Title>Today’s sessions</Title>
      {todaysSessions.length ? (
        todaysSessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))
      ) : (
        <Copy>No practice logged today.</Copy>
      )}
      <Copy>
        Unplanned practice belongs here too. Log what you worked on, for however
        long you had.
      </Copy>
    </Page>
  );
}

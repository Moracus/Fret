import { router } from "expo-router";
import { SectionList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePractice } from "@/practice/provider";
import { groupSessionsByDay, formatMinutes } from "@/practice/model";
import { SessionCard } from "@/practice/session-card";
import { Action, Copy, styles, Title } from "@/practice/ui";

export default function History() {
  const { sessions } = usePractice();
  const days = groupSessionsByDay(sessions);
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <SectionList
        sections={days}
        keyExtractor={(session) => String(session.id)}
        contentContainerStyle={styles.page}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={{ gap: 18 }}>
            <Title>History</Title>
            <Copy>Your recorded practice, one day at a time.</Copy>
          </View>
        }
        ListEmptyComponent={
          <View style={{ gap: 18 }}>
            <Copy>No sessions yet. Your first log will appear here.</Copy>
            <Action
              title="Log practice"
              onPress={() => router.push("/session")}
            />
          </View>
        }
        renderSectionHeader={({ section }) => (
          <Title>
            {section.date} · {formatMinutes(section.total)} min total
          </Title>
        )}
        renderItem={({ item }) => <SessionCard session={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </SafeAreaView>
  );
}

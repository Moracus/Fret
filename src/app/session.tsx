import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  activities,
  focusAreas,
  type Activity,
  type FocusArea,
} from "@/practice/model";
import { usePractice } from "@/practice/provider";
import { Action, Copy, Page, styles, Title } from "@/practice/ui";

export default function SessionScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { sessions, today, save, remove } = usePractice();
  const original = id
    ? sessions.find((session) => String(session.id) === id)
    : undefined;
  const [date, setDate] = useState(original?.date ?? today);
  const [minutes, setMinutes] = useState(
    original ? String(original.minutes) : "",
  );
  const [activity, setActivity] = useState<Activity>(
    original?.activity ?? "Repetition",
  );
  const [intent, setIntent] = useState<"Learning" | "Practice">(
    original?.intent ?? "Practice",
  );
  const [areas, setAreas] = useState<FocusArea[]>(
    original?.focusAreas ?? ["Guitar"],
  );
  const [notes, setNotes] = useState(original?.notes ?? "");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const leave = () => {
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };
  const commit = async (deleting = false) => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (deleting && original) await remove(original.id);
      else
        await save(
          {
            date,
            minutes: Number(minutes.replace(",", ".")),
            activity,
            intent,
            focusAreas: areas,
            notes,
          },
          original?.id,
        );
      leave();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  if (id && !original)
    return (
      <Page title="Session unavailable">
        <Copy>This session no longer exists.</Copy>
        <Action title="Back" onPress={leave} />
      </Page>
    );
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Page title={original ? "Edit practice" : "Log practice"}>
        <Copy>Capture what you did. Short sessions count too.</Copy>
        <Text style={styles.copy}>Date (YYYY-MM-DD)</Text>
        <TextInput
          accessibilityLabel="Date (YYYY-MM-DD)"
          value={date}
          onChangeText={setDate}
          autoCapitalize="none"
          style={styles.input}
        />
        <Text style={styles.copy}>Duration (minutes)</Text>
        <TextInput
          accessibilityLabel="Duration (minutes)"
          value={minutes}
          onChangeText={setMinutes}
          keyboardType="decimal-pad"
          placeholder="e.g. 10 or 0.5"
          style={styles.input}
        />
        <Title>Activity</Title>
        <View style={styles.row}>
          {activities.map((value) => (
            <Action
              key={value}
              title={value}
              selected={activity === value}
              onPress={() => setActivity(value)}
            />
          ))}
        </View>
        <Title>Intent</Title>
        <Copy>
          Were you exploring something new or practicing? Any activity can be
          either.
        </Copy>
        <View style={styles.row}>
          {(["Learning", "Practice"] as const).map((value) => (
            <Action
              key={value}
              title={value}
              label={`${value} intent`}
              selected={intent === value}
              onPress={() => setIntent(value)}
            />
          ))}
        </View>
        <Title>Focus areas</Title>
        <Copy>
          Choose one or more. Combined practice counts elapsed time once.
        </Copy>
        <View style={styles.row}>
          {focusAreas.map((value) => (
            <Action
              key={value}
              title={value}
              label={`${value} focus`}
              selected={areas.includes(value)}
              onPress={() =>
                setAreas((current) =>
                  current.includes(value)
                    ? current.filter((item) => item !== value)
                    : [...current, value],
                )
              }
            />
          ))}
        </View>
        <Text style={styles.copy}>Notes (optional)</Text>
        <TextInput
          accessibilityLabel="Notes"
          value={notes}
          onChangeText={setNotes}
          multiline
          style={[styles.input, { minHeight: 96, textAlignVertical: "top" }]}
        />
        {!!error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        <Action
          title={busy ? "Saving…" : "Save session"}
          disabled={busy}
          selected
          onPress={() => void commit()}
        />
        <Action title="Cancel" disabled={busy} onPress={leave} />
        {original &&
          (confirmDelete ? (
            <>
              <Copy>
                Delete this session permanently? Its time will be removed from
                your totals.
              </Copy>
              <Action
                title="Confirm delete"
                disabled={busy}
                onPress={() => void commit(true)}
              />
              <Action
                title="Keep session"
                disabled={busy}
                onPress={() => setConfirmDelete(false)}
              />
            </>
          ) : (
            <Action
              title="Delete session"
              disabled={busy}
              onPress={() => setConfirmDelete(true)}
            />
          ))}
      </Page>
    </KeyboardAvoidingView>
  );
}

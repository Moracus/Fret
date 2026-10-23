import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export const palette = {
  background: "#F7F5EF",
  card: "#FFFFFF",
  text: "#202D28",
  muted: "#52665D",
  accent: "#225C46",
  line: "#D6DED6",
};
export function Copy({ children }: { children: ReactNode }) {
  return <Text style={styles.copy}>{children}</Text>;
}
export function Title({ children }: { children: ReactNode }) {
  return (
    <Text accessibilityRole="header" style={styles.heading}>
      {children}
    </Text>
  );
}
export function Action({
  title,
  onPress,
  disabled = false,
  selected,
  label,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  selected?: boolean;
  label?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label ?? title}
      accessibilityState={{
        disabled,
        ...(selected === undefined ? {} : { selected }),
      }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        selected && styles.selected,
        (pressed || disabled) && { opacity: 0.55 },
      ]}
    >
      <Text style={[styles.buttonText, selected && { color: "#FFFFFF" }]}>
        {title}
      </Text>
    </Pressable>
  );
}
export function Page({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.page}
      >
        <Text style={styles.eyebrow}>FRET · YOUR PRACTICE JOURNAL</Text>
        <Text accessibilityRole="header" style={styles.title}>
          {title}
        </Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: palette.background },
  page: {
    width: "100%",
    maxWidth: 680,
    alignSelf: "center",
    padding: 24,
    paddingBottom: 40,
    gap: 18,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.5,
    color: palette.muted,
  },
  title: { fontSize: 34, fontWeight: "700", color: palette.text },
  heading: { fontSize: 21, fontWeight: "600", color: palette.text },
  copy: { fontSize: 16, lineHeight: 24, color: palette.muted },
  button: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: "center",
    backgroundColor: palette.card,
  },
  selected: { backgroundColor: palette.accent, borderColor: palette.accent },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: palette.accent,
    textAlign: "center",
  },
  row: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  card: {
    backgroundColor: palette.card,
    borderRadius: 16,
    padding: 18,
    gap: 12,
    borderWidth: 1,
    borderColor: palette.line,
  },
  input: {
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: palette.line,
    borderRadius: 10,
    fontSize: 16,
    color: palette.text,
    backgroundColor: palette.card,
  },
  error: { color: "#A22F24", fontSize: 16 },
});
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

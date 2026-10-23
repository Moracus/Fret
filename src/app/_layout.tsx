import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { PracticeProvider } from "@/practice/provider";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <PracticeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="session" options={{ presentation: "modal" }} />
        </Stack>
      </PracticeProvider>
    </SafeAreaProvider>
  );
}

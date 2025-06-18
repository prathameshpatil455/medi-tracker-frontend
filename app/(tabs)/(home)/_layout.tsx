import { Stack } from "expo-router";

export default function HomeLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="calendar-view"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="history-log"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

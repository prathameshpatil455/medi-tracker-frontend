import { Stack } from "expo-router";

export default function MedicationLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="add-medication"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="refill-tracker"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}

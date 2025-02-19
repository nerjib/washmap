// app/_layout.js
import { Stack } from 'expo-router';
import { UserProvider } from './context/contextUser';

export default function RootLayout() {
  return (
    <UserProvider>
    <Stack>
      <Stack.Screen
        name="(auth)" // This corresponds to the auth group
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="(app)" // This corresponds to the app group
        options={{ headerShown: false }}
      />
    </Stack>
    </UserProvider>
  );
}
// app/(auth)/_layout.js
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="signIn" // This corresponds to app/(auth)/signIn.js
        options={{ title: 'Sign In' }}
      />
      <Stack.Screen
        name="signUp" // This corresponds to app/(auth)/signUp.js
        options={{ title: 'Sign Up' }}
      />
    </Stack>
  );
}
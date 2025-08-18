// app/(auth)/signUp.js
import { View, Text, TextInput, Button } from 'react-native';
import { Link } from 'expo-router';

export default function SignUp() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Sign Up</Text>
      <TextInput placeholder="Email" style={{ borderWidth: 1, padding: 10, width: 200, margin: 10 }} />
      <TextInput placeholder="Password" secureTextEntry style={{ borderWidth: 1, padding: 10, width: 200, margin: 10 }} />
      <Button title="Sign Up" onPress={() => console.log('Sign Up Pressed')} />
      <Link href="/(app)/home" asChild>
        <Button title="Go to Sign In" />
      </Link>
    </View>
  );
}
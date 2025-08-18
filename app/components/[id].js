// app/(app)/projects/[id].js
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function ProjectDetails() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24 }}>Project Details</Text>
      <Text style={{ fontSize: 18 }}>Project ID: {id}</Text>
    </View>
  );
}
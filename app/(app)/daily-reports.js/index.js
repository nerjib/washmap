import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Image, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function DailyReport() {
  const [title, setTitle] = useState('');
  const [image, setImage] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activity, setActivity] = useState('');
  const [conclusion, setConclusion] = useState('');
  const router = useRouter();

  const clearForm = () => {
    setTitle('');
    setImage(null);
    setDate(new Date());
    setActivity('');
    setConclusion('');
  };

  const handleChoosePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
  };

  const handleSend = () => {
    Alert.alert('Success', 'Report sent successfully!', [
      { text: 'OK', onPress: () => {
        clearForm();
        router.push('/(app)/home');
      } },
    ]);
  };

  const handleSaveToDraft = async () => {
    try {
      const draft = {
        title,
        imageUri: image,
        date: date.toISOString(),
        activity,
        conclusion,
        type: 'dr',
      };
      const existingDrafts = await AsyncStorage.getItem('reportDrafts');
      const drafts = existingDrafts ? JSON.parse(existingDrafts) : [];
      drafts.push(draft);
      await AsyncStorage.setItem('reportDrafts', JSON.stringify(drafts));
      Alert.alert('Success', 'Report saved to drafts!', [
        { text: 'OK', onPress: () => {
          clearForm();
          router.push('/(app)/home');
        } },
      ]);
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Daily Report</Text>
      <Text style={styles.label}>Title</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="Enter report title"
      />

      <Text style={styles.label}>Image</Text>
      <TouchableOpacity style={styles.button} onPress={handleChoosePhoto}>
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image }} style={styles.image} />}

      <Text style={styles.label}>Date</Text>
      <TouchableOpacity style={styles.button} onPress={() => setShowDatePicker(true)}>
        <Text style={styles.buttonText}>Select Date</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
      <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>

      <Text style={styles.label}>Activity</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={activity}
        onChangeText={setActivity}
        placeholder="Describe your activities"
        multiline
      />

      <Text style={styles.label}>Conclusion</Text>
      <TextInput
        style={styles.input}
        value={conclusion}
        onChangeText={setConclusion}
        placeholder="Enter your conclusion"
      />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.sendButton]} onPress={handleSend}>
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={handleSaveToDraft}>
          <Text style={styles.buttonText}>Save to Draft</Text>
        </TouchableOpacity>
      </View>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  image: {
    width: '100%',
    height: 200,
    marginTop: 10,
    marginBottom: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  sendButton: {
    backgroundColor: '#28a745',
    flex: 1,
    marginRight: 10,
  },
  draftButton: {
    backgroundColor: '#ffc107',
    flex: 1,
    marginLeft: 10,
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { baseURL } from './services/config';

export default function ReportForm() {
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activitySummary, setActivitySummary] = useState('');
  const [status, setStatus] = useState('');
  const [conclusion, setConclusion] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(null); // Track selected draft

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
          alert('Sorry, we need camera and location permissions to make this work!');
        } else {
          getGeolocation();
        }
        loadDrafts();
      }
    })();
  }, []);

  const loadDrafts = async () => {
    try {
      const storedDrafts = await AsyncStorage.getItem('reportDrafts');
      if (storedDrafts) {
        setDrafts(JSON.parse(storedDrafts));
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  const saveDraft = async () => {
    const draft = {
      date: date.toISOString(),
      activitySummary,
      status,
      conclusion,
      imageUri,
      latitude,
      longitude,
    };

    try {
      const updatedDrafts = [...drafts, draft];
      await AsyncStorage.setItem('reportDrafts', JSON.stringify(updatedDrafts));
      setDrafts(updatedDrafts);
      Alert.alert('Draft Saved', 'Your report has been saved as a draft.');
      resetForm();
    } catch (error) {
      console.error('Error saving draft:', error);
      Alert.alert('Error', 'Failed to save draft.');
    }
  };

  const getGeolocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      setLatitude(location.coords.latitude);
      setLongitude(location.coords.longitude);
    } catch (error) {
      console.log('Error getting location:', error);
    }
  };

  const takePicture = async () => {
    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('date', date.toISOString());
      formData.append('activitySummary', activitySummary);
      formData.append('status', status);
      formData.append('conclusion', conclusion);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      if (imageUri) {
        const imageName = imageUri.split('/').pop();
        formData.append('image', {
          uri: imageUri,
          type: 'image/jpeg',
          name: imageName,
        });
      }

      const response = await fetch(`${baseURL}/dailyreports`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Report submitted successfully!');
        resetForm();
        await generateAndSharePDF(); // Generate and share PDF after successful submission
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Failed to submit report. ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setActivitySummary('');
    setStatus('');
    setConclusion('');
    setImageUri(null);
    getGeolocation();
  };

  const submitDraft = async (index) => {
    const draft = drafts[index];
    setSelectedDraftIndex(index);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('date', draft.date);
      formData.append('activitySummary', draft.activitySummary);
      formData.append('status', draft.status);
      formData.append('conclusion', draft.conclusion);
      formData.append('latitude', draft.latitude);
      formData.append('longitude', draft.longitude);

      if (draft.imageUri) {
        const imageName = draft.imageUri.split('/').pop();
        formData.append('image', {
          uri: draft.imageUri,
          type: 'image/jpeg',
          name: imageName,
        });
      }

      const response = await fetch('https://xyz.com/api/v1/2', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Draft submitted successfully!');
        const updatedDrafts = [...drafts];
        updatedDrafts.splice(index, 1); // Remove submitted draft
        await AsyncStorage.setItem('reportDrafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
        resetForm();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Failed to submit draft. ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setSelectedDraftIndex(null);
    }
  };
  const generateAndSharePDF = async () => {
    const html = `
      <html>
        <body>
          <h1>Report</h1>
          <p>Date: ${date.toDateString()}</p>
          <p>Activity Summary: ${activitySummary}</p>
          <p>Status: ${status}</p>
          <p>Conclusion: ${conclusion}</p>
          <p>Latitude: ${latitude}</p>
          <p>Longitude: ${longitude}</p>
          ${imageUri ? `<img src="${imageUri}" style="width: 200px; height: 200px;" />` : ''}
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(uri);
      } else {
        await Sharing.shareAsync(uri); // Android sharing
      }
    } catch (error) {
      console.error('PDF generation/sharing error:', error);
      Alert.alert('Error', 'Failed to generate or share PDF.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Button onPress={getGeolocation} title="refredh" />
      <Text style={styles.label}>Date:</Text>
      <Button onPress={showDatepicker} title={date.toDateString()} />
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
        />
      )}

      <Text style={styles.label}>Activity Summary:</Text>
      <TextInput
        style={styles.input}
        value={activitySummary}
        onChangeText={setActivitySummary}
        multiline
      />

      <Text style={styles.label}>Status:</Text>
      <TextInput
        style={styles.input}
        value={status}
        onChangeText={setStatus}
      />

      <Text style={styles.label}>Conclusion:</Text>
      <TextInput
        style={styles.input}
        value={conclusion}
        onChangeText={setConclusion}
        multiline
      />

      <Text style={styles.label}>Take Picture:</Text>
      <Button title="Take Picture" onPress={takePicture} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      <Text style={styles.label}>Latitude: {latitude}</Text>
      <Text style={styles.label}>Longitude: {longitude}</Text>

      <Button
        title={loading && selectedDraftIndex === null ? 'Submitting...' : 'Submit Report'}
        onPress={handleSubmit}
        disabled={loading && selectedDraftIndex === null}
      />
      <Button title="Save as Draft" onPress={saveDraft} />

      {/* Display Drafts */}
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginTop: 5,
    marginBottom: 10,
    borderRadius: 5,
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 10,
  },
});
import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import axios from 'axios';
import { UserContext } from '../context/contextUser';
import * as ImagePicker from 'expo-image-picker';
import { baseURL } from '../services/config';

export default function FacilityRequest() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [facility, setFacility] = useState('HPBH');
  const [community, setCommunity] = useState('');
  const [ward, setWard] = useState('');
  const [reason, setReason] = useState('');
  const [population, setPopulation] = useState('');

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          setErrorMsg('Permission to access location was denied');
        } else {
          getLocation();
        }
      }
    })();
  }, []);

  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      setErrorMsg('Error fetching location');
    }
  };

  const submitReport = async () => {
    const formData = new FormData();
    formData.append('community', community);
    formData.append('ward', ward);
    formData.append('facility', facility);
    formData.append('population', population);
    formData.append('reason', reason);
    formData.append('sender', user.full_name);
    formData.append('lga', user.lga);

    try {
      setLoading(true);
      const response = await fetch(`${baseURL}/facility/request`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.ok) {
        Alert.alert('Success', 'Request submitted successfully!');
        resetForm();
        navigation.navigate('(app)', { screen: 'home' });
      } else {
        const errorData = await response.json();
        Alert.alert('Error', `Failed to submit request. ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCommunity('');
    setWard('');
    setReason('');
    setPopulation('');
    setFacility('HPBH');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Facility Request Form</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name of Community</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter name of community"
          value={community}
          onChangeText={setCommunity}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name of Ward</Text>
        <TextInput
          style={styles.input}
          placeholder="Name of ward"
          value={ward}
          onChangeText={setWard}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Select Facility</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={facility}
            onValueChange={(itemValue) => setFacility(itemValue)}
            style={styles.picker}
          >
            <Picker.Item value="HPBH" label="Handpump Borehole" />
            <Picker.Item value="SMBH" label="Solar Motorized Borehole" />
            <Picker.Item value="FLBH" label="Force Lift Borehole" />
            <Picker.Item value="VIP" label="VIP Latrine" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Population</Text>
        <TextInput
          style={styles.input}
          placeholder="Population"
          value={population}
          onChangeText={setPopulation}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Reason for Facility</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          multiline
          numberOfLines={4}
          placeholder="Briefly give a reason why the above facility should be allocated here"
          value={reason}
          onChangeText={setReason}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={submitReport} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Submitting...' : 'Submit Request'}</Text>
      </TouchableOpacity>

      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#495057',
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ced4da',
  },
  multiline: {
    height: 120,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ced4da',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
});

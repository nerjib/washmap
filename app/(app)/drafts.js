// DraftsScreen.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { baseURL } from '../services/config';

export default function DraftsScreen({ navigation }) {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDraftIndex, setSelectedDraftIndex] = useState(null);

  
  const loadDrafts = async () => {
    try {
      const storedDrafts = await AsyncStorage.getItem('reportDrafts');
      console.log({storedDrafts})
      if (storedDrafts) {
        setDrafts(JSON.parse(storedDrafts));
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };
  useEffect(() => {
    loadDrafts();
  }, []);

  const submitDraft = async (index) => {
    const draft = drafts[index];
    setSelectedDraftIndex(index);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('project_id',  draft.project_id)
        formData.append('date', draft.date)
        formData.append('longitude',draft.longitude)
        formData.append('latitude', draft.latitude)
        formData.append('activity', draft.activity)
        formData.append('outcome', draft.outcome)
        formData.append('project_stage', draft.project_stage)
        formData.append('lgaSupId', draft.userId)

      if (draft.imageUri) {
        const imageName = draft.imageUri.split('/').pop();
        formData.append('image', {
          uri: draft.imageUri,
          type: 'image/jpeg',
          name: imageName,
        });
      }

      const frFormData = new FormData();
      frFormData.append('project_id',  draft.project_id)
      frFormData.append('recommendation', draft.recommendation)
      frFormData.append('longitude',draft.longitude)
      frFormData.append('latitude', draft.latitude)
      frFormData.append('status', draft.status)
      frFormData.append('issue', draft.issue)
      frFormData.append('sender', draft.sender)

        // formData.append('project_stage', draft.project_stage)
        // formData.append('lgaSupId', draft.userId)

        // formData.append('project_id',  projectId)
        // formData.append('longitude',location.longitude)
        // formData.append('latitude', location.latitude)
        // formData.append('recommendation', recommendations)
        // formData.append('status', selectedId === '1' ? true : false)
        // formData.append('issue', issue)
        // formData.append('sender', user.full_name)
      console.log({formData})
      if (draft.imageUri) {
        const imageName = draft.imageUri.split('/').pop();
        frFormData.append('image', {
          uri: draft.imageUri,
          type: 'image/jpeg',
          name: imageName,
        });
      }
      let response;
      if(draft.type === 'dr') {
       response = await fetch(`${baseURL}/dailyreports`, {
        method: 'POST',
        body: formData,
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });
} else if (draft.type === 'fr'){
    response = await fetch(`${baseURL}/functionality`, {
        method: 'POST',
        body: frFormData,
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });
}

      if (response.ok) {
        Alert.alert('Success', 'Draft submitted successfully!');
        const updatedDrafts = [...drafts];
        updatedDrafts.splice(index, 1);
        await AsyncStorage.setItem('reportDrafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
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

  const handleDelete = async (index) => {
    const updatedDrafts = [...drafts];
        updatedDrafts.splice(index, 1);
        await AsyncStorage.setItem('reportDrafts', JSON.stringify(updatedDrafts));
        setDrafts(updatedDrafts);
  }
  return (
    <ScrollView style={styles.container}>
        <View style={styles.inputContainer}>
      <Text style={styles.title}>Saved Drafts</Text>
      <Button title='refresh' onPress={loadDrafts} />
      {drafts.length === 0 ? (
        <Text>No drafts saved.</Text>
      ) : (
        drafts.map((draft, index) => (
          <View key={index} style={styles.draftItem}>
            <Text>Draft {index + 1} </Text>
            {/* <Text>{draft?.type}</Text> */}
            <Button
              title={loading && selectedDraftIndex === index ? 'Submitting...' : 'Submit'}
              onPress={() => submitDraft(index)}
              disabled={loading && selectedDraftIndex === index}
            />
            <Text onPress={()=>handleDelete(index)}>X</Text>
          </View>
        ))
      )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginBottom: 10
  },
  inputContainer: {
    marginBottom: 300,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  draftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});
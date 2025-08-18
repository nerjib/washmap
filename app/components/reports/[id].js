import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
// import { Camera } from 'expo-camera';
// import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
// import RNPickerSelect from 'react-native-picker-select'
import { Camera } from 'expo-camera';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { RadioGroup } from 'react-native-radio-buttons-group';
import axios from 'axios';
import { baseURL } from '../../services/config';
import { UserContext } from '../../context/contextUser';
import * as ImagePicker from 'expo-image-picker';


export default function Report() {
  const { user } = useContext(UserContext);
  const navigation = useNavigation();
  const { id: projectId } = useLocalSearchParams(); // Get projectId from the URL
  const params = useLocalSearchParams();
  const [pro, setPro] = useState(params);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [camera, setCamera] = useState(null);
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [projectStage, setProjectStage] = useState('planning'); // Default project stage
  const [recommendations, setRecommendations] = useState(''); // Recommendations field
  const [issue, setIssue] = useState(''); // Recommendations field
  const [selectedId, setSelectedId] = useState('1');
  const [drafts, setDrafts] = useState([]);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  
    

  // Request camera permissions
  const radioButtons = useMemo(() => ([
      {
          id: '1', // acts as primary key, should be unique and non-empty string
          label: 'Is Working',
          value: true
      },
      {
          id: '2',
          label: 'Not Working',
          value: false
      }
  ]), []);
  useEffect(() => {
    // (async () => {
    //   const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    //   setHasCameraPermission(cameraStatus === 'granted');

    //   const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    //   if (locationStatus !== 'granted') {
    //     setErrorMsg('Permission to access location was denied');
    //   }
    // })();
  }, []);
  useEffect(() => {
      (async () => {
        const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
        setHasCameraPermission(cameraStatus === 'granted');
  
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        if (locationStatus !== 'granted') {
          setErrorMsg('Permission to access location was denied');
        }
        if (locationStatus === 'granted') {
          getLocation();
        }
      })();
    }, []);
    useEffect(() => {
        (async () => {
          if (Platform.OS !== 'web') {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
              alert('Sorry, we need camera and location permissions to make this work!');
            } else {
              getLocation();
            }
            loadDrafts();
          }
        })();
      }, []);
      useEffect(() =>{
        loadDrafts();
      }, [])

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

       const getLocation = async () => {
          try {
            const location = await Location.getCurrentPositionAsync({});
            setLocation(location.coords);
          } catch (error) {
            setErrorMsg('Error fetching location');
          }
        };

  // Capture image from camera
  const takePicture = async () => {
        let result = await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 1,
        });
    
        if (!result.canceled) {
          setImageUri(result.assets[0].uri);
        }
      };

  

  // Submit report
  const submitReport = async() => {
    // if (!image || !location) {
    //   Alert.alert('Error', 'Please capture an image and fetch your location.');
    //   return;
    // }
 if (!imageUri || !location) {
      Alert.alert('Error', 'Please capture an image and fetch your location.');
      return;
    }
    const reportData = {
      project_id:projectId, // Include the projectId in the report data
      // image,
      // location: {
      //   latitude: location.latitude,
      //   longitude: location.longitude,
      // },
      // projectStage,
      recommendation: recommendations,
      status: selectedId === '1' ? true : false,
      issue,
      sender: user.full_name,
    };
    const formData = new FormData();
        formData.append('project_id',  projectId)
        formData.append('longitude',location.longitude)
        formData.append('latitude', location.latitude)
        formData.append('recommendation', recommendations)
        formData.append('status', selectedId === '1' ? true : false)
        formData.append('issue', issue)
        formData.append('sender', user.full_name)

        if (imageUri) {
              const imageName = imageUri.split('/').pop();
              formData.append('image', {
                uri: imageUri,
                type: 'image/jpeg',
                name: imageName,
              });
            }
      try{
        setLoading(true);
            const response = await fetch(`${baseURL}/functionality`, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
      
            if (response.ok) {
              Alert.alert('Success', 'Report submitted successfully!');
              resetForm();
              navigation.navigate('(app)', { screen: 'projects' });
              // await generateAndSharePDF(); // Generate and share PDF after successful submission
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
    // Alert.alert('Success', 'Report submitted successfully!');
  };

  // if (hasCameraPermission === null) {
  //   return <View />;
  // }
  // if (hasCameraPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }
  const saveDraft = async () => {
     if (!imageUri || !location) {
          Alert.alert('Error', 'Please capture an image and fetch your location.');
          return;
        }
    const draft = {
      project_id: projectId,
      recommendation: recommendations,
      status: selectedId === '1' ? true : false,
      issue,
      imageUri,
      sender: user.full_name,
      longitude: location.longitude,
      latitude: location.latitude,
      type: 'fr'
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

  const resetForm =()=> {
    setRecommendations('');
    setIssue('');
    setImageUri('');
  }
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Functionality Report for Project {pro?.title} in {pro?.community}, {pro.lga} LGA</Text>

      {/* Camera Preview */}
      {/* <Camera
        style={styles.camera}
        ref={(ref) => setCamera(ref)}
      > */}
       
      {/* Fetch Location */}
      {/* <Button title="Get GPS Location" onPress={getLocation} /> */}

      {/* Display Location */}
      <Button title="Refresh GPS Location" onPress={getLocation} />
      {location && (
        <View style={styles.locationContainer}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </View>
      )}

    <View style={styles.cameraButtonContainer}>
          <Button title="Take Picture" onPress={takePicture} />
        </View>
      {/* </Camera> */}

      {/* Display Captured Image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {/* Project Stage Selection */}
      <View style={styles.inputContainer}>
        {/* <Text style={styles.label}>Project Stages</Text> */}
        {/* <Picker
          selectedValue={projectStage}
          onValueChange={(itemValue) => setProjectStage(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Planning" value="planning" />
          <Picker.Item label="Design" value="design" />
          <Picker.Item label="Development" value="development" />
          <Picker.Item label="Testing" value="testing" />
          <Picker.Item label="Deployment" value="deployment" />
        </Picker> */}
        {/* <RNPickerSelect
          style={{color:'red'}}
          onValueChange={(itemValue) => setProjectStage(itemValue)}
          items={[
              {label:'Taking Over Site',  value:'TOS'},
              {label:'Geophysical Survey (Water) ', value:'GS'},
              {label:'Drilling (Water) ', value:'Drilling'},
              {label:'Excavation (VIP)', value:'Excavation'},
              {label:'Sub-Structure (VIP) ', value:'SubS'},
              {label:'Super-Structure (VIP) ', value:'SuperS'},
              {label:'Fittings and Finishing (VIP) ', value:'Finishing'},    
              {label:'Painting (VIP) ', value:'Finishing'},    
              {label:'Pumping Test (Water)', value:'PT'},
              {label:'Pump Installation (Water)', value:'PI'},
              {label:'Platforming (Water)', value:'Platforming'},
              {label:'Foundation for Stanchion (Solar) ', value:'FS'},
              {label:'Erection of Stanchion (Solar)', value:'ES'},
              {label:'Installation of Solar Pump/Panel ', value:'ISP'},
              {label:'Reticulation (Solar)', value:'Reticulation'},
              {label:'Platforming and Installation', value:'Platforming2'},
              {label:'Platforming,Installation & Signboard', value:'CR'},
              {label:'Installation of Solar Security Light ', value:'ISP'},
              {label:'Hand Over', value:'FR'} ,
              {label:'Final on from site', value:'FR'}      
          ]}
          /> */}
          <ThemedView style={{marginTop: 20, padding: 10, backgroundColor: '#fff'}}>
              <ThemedText style={{ color: "#000"}}>Is facility working</ThemedText>
              <RadioGroup color='#000'
                radioButtons={radioButtons} 
                onPress={setSelectedId}
                selectedId={selectedId}
              />
              
              {/* <Picker
                selectedValue={projectStage}
                onValueChange={(itemValue, itemIndex) =>
                  setProjectStage(itemValue)
                }>
                <Picker.Item label="Java" value="java" />
                <Picker.Item label="JavaScript" value="js" />
              </Picker> */}
          </ThemedView>
      </View>
      {selectedId === '2' && (
        <View style={styles.inputContainer}>
        <Text style={styles.label}>Describe Issue</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="briefly describe the issue here..."
          value={issue}
          onChangeText={setIssue}
        />
      </View>)}
      {/* Recommendations Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Recommendations</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Enter your recommendations..."
          value={recommendations}
          onChangeText={setRecommendations}
        />
      </View>

      {/* Submit Report */}
      <View style={styles.inputContainer}>

      <Button disabled={loading} title="Submit Report" onPress={submitReport} />
      <Button title="Save as draft" onPress={saveDraft} />

</View>
      {/* Error Message */}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    marginBottom: 30
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  camera: {
    width: '100%',
    height: 300,
    marginBottom: 20,
  },
  cameraButtonContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    marginBottom: 20,
  },
  locationContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 50,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    height: 100,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
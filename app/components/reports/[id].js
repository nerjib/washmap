import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TextInput, ScrollView } from 'react-native';
// import { Camera } from 'expo-camera';
// import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
// import RNPickerSelect from 'react-native-picker-select'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { RadioGroup } from 'react-native-radio-buttons-group';
import axios from 'axios';
import { baseURL } from '../../services/config';
import { UserContext } from '../../context/contextUser';
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

  // Capture image from camera
  const takePicture = async () => {
    if (camera) {
      const photo = await camera.takePictureAsync();
      setImage(photo.uri);
    }
  };

  // Get current location
  const getLocation = async () => {
    // try {
    //   const location = await Location.getCurrentPositionAsync({});
    //   setLocation(location.coords);
    // } catch (error) {
    //   setErrorMsg('Error fetching location');
    // }
  };

  // Submit report
  const submitReport = async() => {
    // if (!image || !location) {
    //   Alert.alert('Error', 'Please capture an image and fetch your location.');
    //   return;
    // }

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
    axios.post(`${baseURL}/functionality`, reportData)
    .then(res => {
      console.log(res.data);
      Alert.alert('Success', 'Report submitted successfully!');
      navigation.navigate('(app)', { screen: 'projects' });
    })
    .catch(err => {
      console.log(err);
      Alert.alert('Error', 'An error occurred. Please try again.');
    }
    );
    // Alert.alert('Success', 'Report submitted successfully!');
  };

  // if (hasCameraPermission === null) {
  //   return <View />;
  // }
  // if (hasCameraPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Functionality Report for Project {pro?.title} in {pro?.community}, {pro.lga} LGA</Text>

      {/* Camera Preview */}
      {/* <Camera
        style={styles.camera}
        ref={(ref) => setCamera(ref)}
      > */}
        {/* <View style={styles.cameraButtonContainer}>
          <Button title="Take Picture" onPress={takePicture} />
        </View> */}
      {/* </Camera> */}

      {/* Display Captured Image */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Fetch Location */}
      {/* <Button title="Get GPS Location" onPress={getLocation} /> */}

      {/* Display Location */}
      {location && (
        <View style={styles.locationContainer}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </View>
      )}

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
      <Button title="Submit Report" onPress={submitReport} />

      {/* Error Message */}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
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
    marginBottom: 20,
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
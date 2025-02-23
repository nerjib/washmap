import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Button, Image, StyleSheet, Alert, TextInput, ScrollView,TouchableOpacity, KeyboardAvoidingView } from 'react-native';
import { Camera } from 'expo-camera';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
// import RNPickerSelect from 'react-native-picker-select'
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { RadioGroup } from 'react-native-radio-buttons-group';
import { UserContext } from '../../context/contextUser';
import axios from 'axios';
import { baseURL } from '../../services/config';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';


export default function Report() {
    const { user } = useContext(UserContext);
    const navigation = useNavigation();
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
  const [activityDate, setActivityDate] = useState(new Date());
    const [activity, setActivity] = useState('');
  const [outcome, setOutcome] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [drafts, setDrafts] = useState([]);
  
  
    


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
  // Get current location
  const getLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location.coords);
    } catch (error) {
      setErrorMsg('Error fetching location');
    }
  };

  const onChangeDate = (event, selectedDate) => {
    console.log({selectedDate})
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
  };

const showDatepicker = () => {
  setShowDatePicker(true);
};

  
  // Submit report
  const submitReport = async () => {
    if (!imageUri || !location) {
      Alert.alert('Error', 'Please capture an image and fetch your location.');
      return;
    }
      //let { project_id, file_url, date, longitude, latitude, activity, outcome, project_stage, lgaSupId, stateSupId} = req.body;

    const reportData = {
      project_id: pro.id, // Include the projectId in the report data
      date: date.toISOString(),
      longitude: location.longitude,
      latitude: location.latitude,
        activity,
        outcome,
        project_stage: projectStage,
        lgaSupId: user.id,
        image   
    };
    // let formData = new FormData();
    
    // formData.append('image', image )
  //alert(fileType)
    // formData.append('image', {
    //   image,
    //   name: `photo.${fileType}`,
    //   type: `image/${fileType}`,
    // });
    try {
      setLoading(true)
    const formData = new FormData();
        formData.append('project_id',  pro.id)
        formData.append('date', activityDate)
        formData.append('longitude',location.longitude)
        formData.append('latitude', location.latitude)
        formData.append('activity', activity)
        formData.append('outcome', outcome)
        formData.append('project_stage', projectStage)
        formData.append('lgaSupId', user.id)
    
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
  };
  const resetForm = () => {
    setActivity('');
    setActivityDate('');
    setProjectStage('SITE_TAKING_OVER')
    setOutcome('');
    setImageUri(null);
  };

  // if (hasCameraPermission === null) {
  //   return <View />;
  // }
  // if (hasCameraPermission === false) {
  //   return <Text>No access to camera</Text>;
  // }
  const hpbhStage = [
    'SITE_TAKING_OVER',
    'GEOPHYSICAL_SURVEY',
    'DRILLING',
    'PUMP_TESTING',
    'PLATFORMING',
    'INSTALLATION',
    'SITE_HANDING_OVER',
  ];
  const smbhStage = [
    'SITE_TAKING_OVER',
    'GEOPHYSICAL_SURVEY',
    'DRILLING',
    'PUMP_TESTING',
    'ERECTION_OF_STANCHION',
    'PUMP_INSTALLATION',
    'FENCING',
    "TAP_ISLAND",
    'SITE_HANDING_OVER',
  ]
  const vipStage = [
    'SITE_TAKING_OVER',
    'SETTING_OUT',
    'EXCAVATION',
    'SUB_STRUCTURE',
    'SUPER_STRUCTURE',
    'ROOFING',
    'FITTINGS',
    'PAINTING',
    'SITE_HANDING_OVER',
  ]

  const saveDraft22 = async () => {
    const draft = {
      project_id: pro.id,
      date: activityDate,
      activity,
      outcome,
      project_stage: projectStage,
      imageUri,
      latitude: location.latitude,
      longitude: location.longitude,
    };

    console.log({ draft })
    // alert(draft)
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

  const saveDraft = async () => {
    if (!imageUri || !location) {
      Alert.alert('Error', 'Please capture an image and fetch your location.');
      return;
    }
    const draft = {
      project_id: pro.id,
      date: activityDate,
      activity,
      outcome,
      project_stage: projectStage,
      imageUri,
      latitude: location.latitude,
      longitude: location.longitude,
      userId: user.id,
      type: 'dr'
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
  return (
    <View style={{ flex: 1, paddingBottom: 30}}>
    <KeyboardAvoidingView style={styles.container} behavior='padding' enabled>
    <ScrollView>

      <Text style={styles.title}>Report for Project {pro?.title} in {pro?.community}, {pro.lga} LGA</Text>
      {/* <Button style={styles.btn} title="Submit Report" onPress={submitReport} /> */}

    
      {/* Camera Preview */}
      {/* <CameraView style={styles.camera} facing="back" ref={(ref) => setCamera(ref)}>
        <View style={styles.cameraButtonContainer}>
          <TouchableOpacity style={styles.button} >
            <Text style={styles.text} onPress={takePicture}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
      </CameraView> */}
      {/* <Camera
        style={styles.camera}
        ref={(ref) => setCamera(ref)}
      >
        <View style={styles.cameraButtonContainer}>
          <Button title="Take Picture" onPress={takePicture} />
        </View> 
      </Camera> */}

      {/* Display Captured Image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      {/* Fetch Location */}
      <Button title="Refresh GPS Location" onPress={getLocation} />

      {/* Display Location */}
      {location && (
        <View style={styles.locationContainer}>
          <Text>Latitude: {location.latitude}</Text>
          <Text>Longitude: {location.longitude}</Text>
        </View>
      )}

      {/* Project Stage Selection */}
      <View style={styles.inputContainer}>
      <Text style={styles.label}>Date</Text>
      {/* <Button onPress={showDatepicker} title={date.toDateString()} />
      {showDatePicker && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={'date'}
          is24Hour={true}
          display="default"
          onChange={onChangeDate}
        />
      )} */}

        <TextInput onChangeText={setActivityDate} style={styles.textInput} value={activityDate}  placeholder='dd/mm/yyyy'/>
        <Text style={styles.label}>Project Stage</Text>
        {/* <TextInput style={styles.textInput} value={projectStage} onChangeText={setProjectStage} /> */}
        <Picker
          selectedValue={projectStage}
          onValueChange={(itemValue) => setProjectStage(itemValue)}
          style={styles.picker}
        >
          {(pro?.title === 'HPBH' 
            ? hpbhStage 
            : pro?.title === 'SMBH' 
            ? smbhStage 
            : pro?.title === 'VIP'
            ? vipStage
            : pro?.title === 'FLBH'
            ? hpbhStage
            : []
          ).map(e =>
            <Picker.Item label={e.replace('_', ' ')} value={e} key={e} />
          )}
          {/* <Picker.Item label="Planning" value="planning" />
          <Picker.Item label="Design" value="design" />
          <Picker.Item label="Development" value="development" />
          <Picker.Item label="Testing" value="testing" />
          <Picker.Item label="Deployment" value="deployment" /> */}
        </Picker>
        <Text style={styles.label}>Activity</Text>
        <TextInput onChangeText={setActivity} value={activity} multiline maxLength={150} style={styles.textInput} placeholder=''/>
        
        <Text style={styles.label}>Outcome</Text>
        <TextInput onChangeText={setOutcome} value={outcome} multiline maxLength={150} style={styles.textInput} placeholder=''/>

        
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
          {/* <ThemedView style={{marginTop: 20, padding: 10, backgroundColor: '#fff'}}> */}
              {/* <ThemedText style={{ color: "#000"}}>Is facility working</ThemedText>
              <RadioGroup color='#000'
                radioButtons={radioButtons} 
                onPress={setSelectedId}
                selectedId={selectedId}
              /> */}
              
              {/* <Picker
                selectedValue={projectStage}
                onValueChange={(itemValue, itemIndex) =>
                  setProjectStage(itemValue)
                }>
                <Picker.Item label="Java" value="java" />
                <Picker.Item label="JavaScript" value="js" />
              </Picker> */}
          {/* </ThemedView> */}
      {/* {selectedId === '2' && (
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
      </View>)} */}
      {/* Recommendations Input */}
      {/* <View style={styles.inputContainer}>
        <Text style={styles.label}>Re</Text>
        <TextInput
          style={styles.textInput}
          multiline
          numberOfLines={4}
          placeholder="Enter your reports here..."
          value={recommendations}
          onChangeText={setRecommendations}
        />
      </View> */}
        <View style={styles.cameraButtonContainer}>
          <Button title="Take Picturfe" onPress={takePicture} />
        </View> 
      {/* Submit Report */}
      {/* <Button
        style={styles.btn} title="Submit Report" onPress={submitReport} /> */}
      <View style={{ height: 20 }} />

      <Button
          title={loading ? 'Submitting...' : 'Submit Report'}
          onPress={submitReport}
          disabled={loading}
        />
      <Button title="Save as Draft" onPress={saveDraft} />
        
      </View>

      {/* Error Message */}
      {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
    </ScrollView>
    </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1
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
  btn: {
    marginBottom: 40,
    padding: 20
  }
});
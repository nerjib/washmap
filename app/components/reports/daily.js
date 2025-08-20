import React, { useState, useEffect, useMemo, useContext } from 'react';
import { View, Text, Image, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { UserContext } from '../../context/contextUser';
import api from '../../services/axiosConfig';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function Report() {
    const { user } = useContext(UserContext);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const [pro, setPro] = useState(params);
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [projectStage, setProjectStage] = useState('SITE_TAKING_OVER');
    const [activity, setActivity] = useState('');
    const [outcome, setOutcome] = useState('');
    const [imageUri, setImageUri] = useState(null);
    const [activityDate, setActivityDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [drafts, setDrafts] = useState([]);

    useEffect(() => {
        (async () => {
            const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
            const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
            if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
                Alert.alert('Permissions required', 'Sorry, we need camera and location permissions to make this work!');
            } else {
                getLocation();
            }
            loadDrafts();
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
//  const result = await ImagePicker.launchCameraAsync();
//     if (!result.canceled) {
//       setImage(result.assets[0].uri);
//     }
    const takePicture = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync();

            if (!result.canceled) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error("Error taking picture: ", error);
            Alert.alert("Camera Error", "Could not open camera. Please ensure you have granted camera permissions in your device settings.");
        }
    };

    const getLocation = async () => {
        try {
            const loc = await Location.getCurrentPositionAsync({});
            setLocation(loc.coords);
        } catch (error) {
            setErrorMsg('Error fetching location');
        }
    };

    const onChangeDate = (event, selectedDate) => {
        const currentDate = selectedDate || activityDate;
        setShowDatePicker(Platform.OS === 'ios');
        setActivityDate(currentDate);
    };

    const submitReport = async () => {
        if (!imageUri || !location) {
            Alert.alert('Missing Information', 'Please take a picture and ensure location is available.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('project_id', pro.id);
            formData.append('date', activityDate.toISOString());
            formData.append('longitude', location.longitude);
            formData.append('latitude', location.latitude);
            formData.append('activity', activity);
            formData.append('outcome', outcome);
            formData.append('project_stage', projectStage);
            formData.append('lgaSupId', user.id);

            if (imageUri) {
                const imageName = imageUri.split('/').pop();
                const imageType = 'image/jpeg';
                formData.append('image', { uri: imageUri, name: imageName, type: imageType });
            }

            const response = await api.post('/reports/dailyreports', formData);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', 'Report submitted successfully!');
                resetForm();
                navigation.navigate('(app)', { screen: 'projects' });
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

    const saveDraft = async () => {
        if (!imageUri || !location) {
            Alert.alert('Missing Information', 'Please take a picture and ensure location is available to save a draft.');
            return;
        }
        const draft = {
            project_id: pro.id,
            project_community: pro.community,
            project_lga: pro.lga,
            project_title: pro.title,
            date: activityDate.toISOString(),
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
            const storedDrafts = await AsyncStorage.getItem('reportDrafts');
            const currentDrafts = storedDrafts ? JSON.parse(storedDrafts) : [];
            const updatedDrafts = [...currentDrafts, draft];
            await AsyncStorage.setItem('reportDrafts', JSON.stringify(updatedDrafts));

            Alert.alert(
                'Draft Saved',
                'Your report has been saved as a draft.',
                [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack()
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error saving draft:', error);
            Alert.alert('Error', 'Failed to save draft.');
        }
    };

    const resetForm = () => {
        setActivity('');
        setActivityDate(new Date());
        setProjectStage('SITE_TAKING_OVER');
        setOutcome('');
        setImageUri(null);
    };

    const stageOptions = {
        HPBH: ['SITE_TAKING_OVER', 'GEOPHYSICAL_SURVEY', 'DRILLING', 'PUMP_TESTING', 'PLATFORMING', 'INSTALLATION', 'SITE_HANDING_OVER'],
        SMBH: ['SITE_TAKING_OVER', 'GEOPHYSICAL_SURVEY', 'DRILLING', 'PUMP_TESTING', 'ERECTION_OF_STANCHION', 'PUMP_INSTALLATION', 'FENCING', "TAP_ISLAND", 'SITE_HANDING_OVER'],
        VIP: ['SITE_TAKING_OVER', 'SETTING_OUT', 'EXCAVATION', 'SUB_STRUCTURE', 'SUPER_STRUCTURE', 'ROOFING', 'FITTINGS', 'PAINTING', 'SITE_HANDING_OVER'],
        FLBH: ['SITE_TAKING_OVER', 'GEOPHYSICAL_SURVEY', 'DRILLING', 'PUMP_TESTING', 'PLATFORMING', 'INSTALLATION', 'SITE_HANDING_OVER'],
    };

    const currentStages = stageOptions[pro?.title] || [];

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Daily Report</Text>
                <Text style={styles.subHeader}>{pro?.title} in {pro?.community}, {pro.lga} LGA</Text>

                <View style={styles.card}>
                    <TouchableOpacity style={styles.imagePicker} onPress={takePicture}>
                        {imageUri ? (
                            <Image source={{ uri: imageUri }} style={styles.image} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <MaterialCommunityIcons name="camera-plus" size={48} color="#aaa" />
                                <Text style={styles.imagePlaceholderText}>Tap to take a picture</Text>
                            </View>
                        )}
                    </TouchableOpacity>

                    <View style={styles.locationSection}>
                        <View style={styles.locationInfo}>
                            <MaterialCommunityIcons name="map-marker" size={20} color="#555" />
                            <Text style={styles.locationText}>Lat: {location ? location.latitude.toFixed(5) : '...'}, Lon: {location ? location.longitude.toFixed(5) : '...'}</Text>
                        </View>
                        <TouchableOpacity style={styles.iconButton} onPress={getLocation}>
                            <MaterialCommunityIcons name="refresh" size={24} color="#007bff" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Date</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
                            <Text style={styles.datePickerText}>{activityDate.toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={activityDate}
                                mode={'date'}
                                display="default"
                                onChange={onChangeDate}
                            />
                        )}

                        <Text style={styles.label}>Project Stage</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={projectStage}
                                onValueChange={(itemValue) => setProjectStage(itemValue)}
                                style={styles.picker}
                            >
                                {currentStages.map(stage =>
                                    <Picker.Item label={stage.replace(/_/g, ' ')} value={stage} key={stage} />
                                )}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Activity</Text>
                        <TextInput
                            style={[styles.textInput, styles.multilineInput]}
                            value={activity}
                            onChangeText={setActivity}
                            placeholder="Describe the activities of the day..."
                            multiline
                        />

                        <Text style={styles.label}>Outcome</Text>
                        <TextInput
                            style={[styles.textInput, styles.multilineInput]}
                            value={outcome}
                            onChangeText={setOutcome}
                            placeholder="Describe the outcome of the activities..."
                            multiline
                        />
                    </View>

                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={[styles.button, styles.draftButton]} onPress={saveDraft} disabled={loading}>
                            <Text style={styles.buttonText}>Save Draft</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={submitReport} disabled={loading}>
                            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Submit Report</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
                {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
        padding: 15,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 5,
    },
    subHeader: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
        marginBottom: 50,
    },
    imagePicker: {
        height: 200,
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 2,
        borderColor: '#ddd',
        borderStyle: 'dashed',
    },
    image: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    imagePlaceholder: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePlaceholderText: {
        color: '#aaa',
        marginTop: 10,
    },
    locationSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
        padding: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    locationInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    locationText: {
        marginLeft: 10,
        fontSize: 14,
        color: '#555',
    },
    iconButton: {
        padding: 5,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
        marginBottom: 8,
    },
    textInput: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        color: '#333',
    },
    multilineInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ddd',
        overflow: 'hidden',
        justifyContent: 'center',
    },
    picker: {
        height: 50,
    },
    datePickerButton: {
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
    },
    datePickerText: {
        fontSize: 16,
        color: '#333',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 50,
    },
    button: {
        flex: 1,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    submitButton: {
        backgroundColor: '#007bff',
        marginLeft: 10,
    },
    draftButton: {
        backgroundColor: '#6c757d',
        marginRight: 10,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    error: {
        color: 'red',
        marginTop: 10,
        textAlign: 'center',
    },
});

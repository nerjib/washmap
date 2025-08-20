import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { UserContext } from '../context/contextUser';
import api from '../services/axiosConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProjectEvaluation() {
    const { user } = useContext(UserContext);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const project = params; // Project details passed from the previous screen

    const [overallStatus, setOverallStatus] = useState('Functional');
    const [recommendations, setRecommendations] = useState('');
    const [issuesIdentified, setIssuesIdentified] = useState('');
    const [photos, setPhotos] = useState([]); // Array of image URIs
    const [loading, setLoading] = useState(false);

    // Borehole specific fields
    const [boreholeDepth, setBoreholeDepth] = useState('');
    const [boreholeYield, setBoreholeYield] = useState('');
    const [pumpType, setPumpType] = useState('');
    const [tankSize, setTankSize] = useState('');
    const [reticulationDetails, setReticulationDetails] = useState('');

    // VIP Latrine specific fields
    const [latrineStances, setLatrineStances] = useState('');
    const [pitSize, setPitSize] = useState('');
    const [superstructureMaterial, setSuperstructureMaterial] = useState('');
    const [roofType, setRoofType] = useState('');
    const [ventilationDetails, setVentilationDetails] = useState('');
    const [accessibilityDetails, setAccessibilityDetails] = useState('');

    const [materialsUsed, setMaterialsUsed] = useState(''); // General materials field
    const [drafts, setDrafts] = useState([]); // To manage local drafts

    const resetForm = () => {
        setOverallStatus('Functional');
        setRecommendations('');
        setIssuesIdentified('');
        setPhotos([]); // Clear photos
        setBoreholeDepth('');
        setBoreholeYield('');
        setPumpType('');
        setTankSize('');
        setReticulationDetails('');
        setLatrineStances('');
        setPitSize('');
        setSuperstructureMaterial('');
        setRoofType('');
        setVentilationDetails('');
        setAccessibilityDetails('');
        setMaterialsUsed('');
    };

    useEffect(() => {
        (async () => {
            if (Platform.OS !== 'web') {
                const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
                const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (cameraStatus !== 'granted' || mediaLibraryStatus !== 'granted') {
                    Alert.alert('Permissions required', 'Camera and Media Library permissions are needed to upload photos.');
                }
            }
        })();
    }, []);

    // Load existing drafts on mount
    useEffect(() => {
        const loadExistingDrafts = async () => {
            try {
                const storedDrafts = await AsyncStorage.getItem('evaluationDrafts');
                if (storedDrafts) {
                    setDrafts(JSON.parse(storedDrafts));
                }
            } catch (error) {
                console.error("Error loading evaluation drafts:", error);
            }
        };
        loadExistingDrafts();
    }, []);

    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync();

            if (!result.canceled) {
                setPhotos(prevPhotos => [...prevPhotos, ...result.assets.map(asset => asset.uri)]);
            }
        } catch (error) {
            console.error("Error picking image: ", error);
            Alert.alert("Image Picker Error", "Could not pick images.");
        }
    };

    const takePhoto = async () => {
        try {
            let result = await ImagePicker.launchCameraAsync();

            if (!result.canceled) {
                setPhotos(prevPhotos => [...prevPhotos, result.assets[0].uri]);
            }
        } catch (error) {
            console.error("Error taking photo: ", error);
            Alert.alert("Camera Error", "Could not take photo.");
        }
    };

    const removePhoto = (uriToRemove) => {
        setPhotos(prevPhotos => prevPhotos.filter(uri => uri !== uriToRemove));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('project_id', project.id);
            formData.append('evaluator_id', user.id); // Assuming user.id is the evaluator_id
            formData.append('overall_status', overallStatus);
            formData.append('recommendations', recommendations);
            formData.append('issues_identified', issuesIdentified);
            formData.append('materials_used', materialsUsed);

            // Append project-type specific fields
            if (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') {
                formData.append('borehole_depth', boreholeDepth);
                formData.append('borehole_yield', boreholeYield);
                formData.append('pump_type', pumpType);
                formData.append('tank_size', tankSize);
                formData.append('reticulation_details', reticulationDetails);
            } else if (project.title === 'VIP') {
                formData.append('latrine_stances', latrineStances);
                formData.append('pit_size', pitSize);
                formData.append('superstructure_material', superstructureMaterial);
                formData.append('roof_type', roofType);
                formData.append('ventilation_details', ventilationDetails);
                formData.append('accessibility_details', accessibilityDetails);
            }

            // Append photos
            for (const uri of photos) {
                const filename = uri.split('/').pop();
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('photos', { uri, name: filename, type });
            }

            const response = await api.post('/evaluations', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            if (response.status === 201) {
                Alert.alert('Success', 'Project evaluation submitted successfully!');
                resetForm();
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Failed to submit evaluation.');
            }
        } catch (error) {
            console.error('Submission error:', error.response?.data || error.message);
            Alert.alert('Error', 'An unexpected error occurred during submission.');
        } finally {
            setLoading(false);
        }
    };

    const saveDraft = async () => {
        const draft = {
            project_id: project.id,
            project_community: project.community,
            project_lga: project.lga,
            project_title: project.title,
            overallStatus,
            recommendations,
            issuesIdentified,
            materialsUsed,
            photos,
            boreholeDepth: (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') ? boreholeDepth : undefined,
            boreholeYield: (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') ? boreholeYield : undefined,
            pumpType: (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') ? pumpType : undefined,
            tankSize: (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') ? tankSize : undefined,
            reticulationDetails: (project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') ? reticulationDetails : undefined,
            latrineStances: (project.title === 'VIP') ? latrineStances : undefined,
            pitSize: (project.title === 'VIP') ? pitSize : undefined,
            superstructureMaterial: (project.title === 'VIP') ? superstructureMaterial : undefined,
            roofType: (project.title === 'VIP') ? roofType : undefined,
            ventilationDetails: (project.title === 'VIP') ? ventilationDetails : undefined,
            accessibilityDetails: (project.title === 'VIP') ? accessibilityDetails : undefined,
            type: 'evaluation',
            timestamp: new Date().toISOString(),
        };

        try {
            const storedDrafts = await AsyncStorage.getItem('evaluationDrafts');
            const currentDrafts = storedDrafts ? JSON.parse(storedDrafts) : [];
            const updatedDrafts = [...currentDrafts, draft];
            await AsyncStorage.setItem('evaluationDrafts', JSON.stringify(updatedDrafts));
            setDrafts(updatedDrafts);
            
            Alert.alert(
                'Draft Saved',
                'Your evaluation has been saved as a draft.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            resetForm();
                            navigation.goBack();
                        }
                    }
                ],
                { cancelable: false }
            );
        } catch (error) {
            console.error('Error saving evaluation draft:', error);
            Alert.alert('Error', 'Failed to save evaluation draft.');
        }
    };

    const renderBoreholeFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Borehole Details</Text>
            <Text style={styles.label}>Depth (meters)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={boreholeDepth} onChangeText={setBoreholeDepth} placeholder="e.g., 50" />
            <Text style={styles.label}>Yield (liters/hour)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={boreholeYield} onChangeText={setBoreholeYield} placeholder="e.g., 1500" />
            <Text style={styles.label}>Pump Type</Text>
            <TextInput style={styles.input} value={pumpType} onChangeText={setPumpType} placeholder="e.g., Submersible, Handpump" />
            <Text style={styles.label}>Tank Size (liters)</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={tankSize} onChangeText={setTankSize} placeholder="e.g., 10000" />
            <Text style={styles.label}>Reticulation Details</Text>
            <TextInput style={[styles.input, styles.multiline]} multiline value={reticulationDetails} onChangeText={setReticulationDetails} placeholder="Describe piping, tap stands, etc." />
        </View>
    );

    const renderLatrineFields = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>VIP Latrine Details</Text>
            <Text style={styles.label}>Number of Stances</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={latrineStances} onChangeText={setLatrineStances} placeholder="e.g., 4" />
            <Text style={styles.label}>Pit Size</Text>
            <TextInput style={styles.input} value={pitSize} onChangeText={setPitSize} placeholder="e.g., 2m x 2m x 3m" />
            <Text style={styles.label}>Superstructure Material</Text>
            <TextInput style={styles.input} value={superstructureMaterial} onChangeText={setSuperstructureMaterial} placeholder="e.g., Brick, Concrete Block" />
            <Text style={styles.label}>Roof Type</Text>
            <TextInput style={styles.input} value={roofType} onChangeText={setRoofType} placeholder="e.g., Corrugated Iron, Concrete Slab" />
            <Text style={styles.label}>Ventilation Details</Text>
            <TextInput style={[styles.input, styles.multiline]} multiline value={ventilationDetails} onChangeText={setVentilationDetails} placeholder="Describe ventilation pipes, etc." />
            <Text style={styles.label}>Accessibility Details</Text>
            <TextInput style={[styles.input, styles.multiline]} multiline value={accessibilityDetails} onChangeText={setAccessibilityDetails} placeholder="Describe ramps, handrails, etc." />
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Evaluate Project</Text>
            <Text style={styles.subtitle}>{project.title} in {project.community}, {project.lga} LGA</Text>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>General Evaluation</Text>
                <Text style={styles.label}>Overall Status</Text>
                <View style={styles.pickerContainer}>
                    <Picker selectedValue={overallStatus} onValueChange={setOverallStatus} style={styles.picker}>
                        <Picker.Item label="Functional" value="Functional" />
                        <Picker.Item label="Partially Functional" value="Partially Functional" />
                        <Picker.Item label="Non-functional" value="Non-functional" />
                    </Picker>
                </View>

                <Text style={styles.label}>Recommendations</Text>
                <TextInput style={[styles.input, styles.multiline]} multiline value={recommendations} onChangeText={setRecommendations} placeholder="Enter recommendations for improvement..." />

                <Text style={styles.label}>Issues Identified</Text>
                <TextInput style={[styles.input, styles.multiline]} multiline value={issuesIdentified} onChangeText={setIssuesIdentified} placeholder="Describe any issues found..." />

                <Text style={styles.label}>Materials Used (General)</Text>
                <TextInput style={[styles.input, styles.multiline]} multiline value={materialsUsed} onChangeText={setMaterialsUsed} placeholder="e.g., Type of pipes, fittings, cement, etc." />
            </View>

            {/* Conditional Fields based on Project Type */}
            {(project.title === 'HPBH' || project.title === 'SMBH' || project.title === 'FLBH') && renderBoreholeFields()}
            {project.title === 'VIP' && renderLatrineFields()}

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Photos</Text>
                <View style={styles.photoButtonsContainer}>
                    <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                        <MaterialCommunityIcons name="camera" size={24} color="#fff" />
                        <Text style={styles.photoButtonText}>Take Photo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                        <MaterialCommunityIcons name="image-multiple" size={24} color="#fff" />
                        <Text style={styles.photoButtonText}>Pick from Gallery</Text>
                    </TouchableOpacity>
                </View>
                <ScrollView horizontal style={styles.photosPreviewContainer}>
                    {photos.map((uri, index) => (
                        <View key={index} style={styles.photoPreviewWrapper}>
                            <Image source={{ uri }} style={styles.photoPreview} />
                            <TouchableOpacity style={styles.removePhotoButton} onPress={() => removePhoto(uri)}>
                                <MaterialCommunityIcons name="close-circle" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <TouchableOpacity style={styles.submitEvaluationButton} onPress={handleSubmit} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <>
                        <MaterialCommunityIcons name="content-save" size={24} color="#fff" />
                        <Text style={styles.submitEvaluationButtonText}>Submit Evaluation</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveDraftButton} onPress={saveDraft} disabled={loading}>
                <MaterialCommunityIcons name="content-save-outline" size={24} color="#fff" />
                <Text style={styles.saveDraftButtonText}>Save Draft</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, padding: 15, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 5 },
    subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 20 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, marginBottom: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#007bff', marginBottom: 15 },
    label: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 8 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', marginBottom: 15 },
    multiline: { height: 100, textAlignVertical: 'top' },
    pickerContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden', marginBottom: 15 },
    picker: { height: 50, width: '100%' },
    photoButtonsContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 15 },
    photoButton: { flexDirection: 'row', backgroundColor: '#28a745', padding: 12, borderRadius: 8, alignItems: 'center' },
    photoButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
    photosPreviewContainer: { flexDirection: 'row' },
    photoPreviewWrapper: { marginRight: 10, position: 'relative' },
    photoPreview: { width: 100, height: 100, borderRadius: 8 },
    removePhotoButton: { position: 'absolute', top: -5, right: -5, backgroundColor: '#fff', borderRadius: 15 },
    submitEvaluationButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    submitEvaluationButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
    saveDraftButton: { flexDirection: 'row', marginBottom: 50, backgroundColor: '#6c757d', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    saveDraftButtonText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
});

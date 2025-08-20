import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, Alert, TextInput, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as Location from 'expo-location';
import { useNavigation } from 'expo-router';
import { UserContext } from '../context/contextUser';
import api from '../services/axiosConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setErrorMsg('Permission to access location was denied');
                }
            }
        })();
    }, []);

    const submitReport = async () => {
        if (!community || !ward || !population || !reason) {
            Alert.alert('Missing Information', 'Please fill out all fields before submitting.');
            return;
        }

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
            const response = await api.post('/reports/facility/request', formData);

            if (response.status === 200 || response.status === 201) {
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

            <View style={styles.card}>
                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <MaterialCommunityIcons name="map-marker-radius" size={20} color="#555" />
                        <Text style={styles.label}>Name of Community</Text>
                    </View>
                    <TextInput style={styles.input} placeholder="Enter name of community" value={community} onChangeText={setCommunity} />
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <MaterialCommunityIcons name="map-marker-outline" size={20} color="#555" />
                        <Text style={styles.label}>Name of Ward</Text>
                    </View>
                    <TextInput style={styles.input} placeholder="Name of ward" value={ward} onChangeText={setWard} />
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <MaterialCommunityIcons name="cogs" size={20} color="#555" />
                        <Text style={styles.label}>Select Facility</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                        <Picker selectedValue={facility} onValueChange={(itemValue) => setFacility(itemValue)} style={styles.picker}>
                            <Picker.Item value="HPBH" label="Handpump Borehole" />
                            <Picker.Item value="SMBH" label="Solar Motorized Borehole" />
                            <Picker.Item value="FLBH" label="Force Lift Borehole" />
                            <Picker.Item value="VIP" label="VIP Latrine" />
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <MaterialCommunityIcons name="account-group" size={20} color="#555" />
                        <Text style={styles.label}>Population</Text>
                    </View>
                    <TextInput style={styles.input} placeholder="Estimated population" value={population} onChangeText={setPopulation} keyboardType="numeric" />
                </View>

                <View style={styles.inputContainer}>
                    <View style={styles.labelContainer}>
                        <MaterialCommunityIcons name="comment-text-outline" size={20} color="#555" />
                        <Text style={styles.label}>Reason for Facility</Text>
                    </View>
                    <TextInput style={[styles.input, styles.multiline]} multiline numberOfLines={4} placeholder="Briefly give a reason why this facility is needed..." value={reason} onChangeText={setReason} />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={submitReport} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <MaterialCommunityIcons name="send" size={22} color="#fff" />
                            <Text style={styles.submitButtonText}>Submit Request</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {errorMsg && <Text style={styles.error}>{errorMsg}</Text>}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, backgroundColor: '#f0f4f8', padding: 15 },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 20 },
    card: { backgroundColor: '#fff', borderRadius: 15, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 5, elevation: 4 },
    inputContainer: { marginBottom: 20 },
    labelContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    label: { fontSize: 16, fontWeight: '600', color: '#444', marginLeft: 10 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333' },
    multiline: { height: 120, textAlignVertical: 'top' },
    pickerContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden' },
    picker: { height: 50, width: '100%' },
    submitButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
    submitButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    error: { color: 'red', marginTop: 10, textAlign: 'center' },
});
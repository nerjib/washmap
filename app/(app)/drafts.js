import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Image
} from 'react-native';
import api from '../services/axiosConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { UserContext } from '../context/contextUser';

const getReportIcon = (type) => {
    return type === 'dr' ? 'clipboard-text-clock-outline' : 'alert-circle-check-outline';
};

const getReportTypeName = (type) => {
    return type === 'dr' ? 'Daily Report' : 'Functionality Report';
};

const EmptyDrafts = () => (
    <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="file-document-outline" size={64} color="#ccc" />
        <Text style={styles.emptyText}>You have no saved drafts.</Text>
        <Text style={styles.emptySubText}>Reports you save offline will appear here.</Text>
    </View>
);

export default function DraftsScreen() {
    const { user } = useContext(UserContext);
    const [reportDrafts, setReportDrafts] = useState([]);
    const [evaluationDrafts, setEvaluationDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedDraftIndex, setSelectedDraftIndex] = useState(null);
    const [selectedTab, setSelectedTab] = useState('reports'); // 'reports' or 'evaluations'

    const loadDrafts = useCallback(async () => {
        try {
            const storedReportDrafts = await AsyncStorage.getItem('reportDrafts');
            if (storedReportDrafts) {
                setReportDrafts(JSON.parse(storedReportDrafts));
            }
            const storedEvaluationDrafts = await AsyncStorage.getItem('evaluationDrafts');
            if (storedEvaluationDrafts) {
                setEvaluationDrafts(JSON.parse(storedEvaluationDrafts));
            }
        } catch (error) {
            console.error('Error loading drafts:', error);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadDrafts();
        }, [loadDrafts])
    );

    const submitDraft = async (draft, index) => {
        setSelectedDraftIndex(index);
        setLoading(true);

        try {
            const formData = new FormData();
            let endpoint = '';
            let successMessage = '';
            let draftTypeKey = '';

            if (draft.type === 'dr') {
                formData.append('project_id', draft.project_id);
                formData.append('date', draft.date);
                formData.append('longitude', draft.longitude);
                formData.append('latitude', draft.latitude);
                formData.append('activity', draft.activity);
                formData.append('outcome', draft.outcome);
                formData.append('project_stage', draft.project_stage);
                formData.append('lgaSupId', draft.userId);
                endpoint = '/reports/dailyreports';
                successMessage = 'Daily Report submitted successfully!';
                draftTypeKey = 'reportDrafts';
            } else if (draft.type === 'fr') {
                formData.append('project_id', draft.project_id);
                formData.append('recommendation', draft.recommendation);
                formData.append('longitude', draft.longitude);
                formData.append('latitude', draft.latitude);
                formData.append('status', draft.status);
                formData.append('issue', draft.issue);
                formData.append('sender', draft.sender);
                endpoint = '/reports/functionality';
                successMessage = 'Functionality Report submitted successfully!';
                draftTypeKey = 'reportDrafts';
            } else if (draft.type === 'evaluation') {
                formData.append('project_id', draft.project_id);
                formData.append('evaluator_id', user.id);
                formData.append('overall_status', draft.overallStatus);
                formData.append('recommendations', draft.recommendations);
                formData.append('issues_identified', draft.issuesIdentified);
                formData.append('materials_used', draft.materialsUsed);

                if (draft.project_title === 'HPBH' || draft.project_title === 'SMBH' || draft.project_title === 'FLBH') {
                    formData.append('borehole_depth', draft.boreholeDepth);
                    formData.append('borehole_yield', draft.boreholeYield);
                    formData.append('pump_type', draft.pumpType);
                    formData.append('tank_size', draft.tankSize);
                    formData.append('reticulation_details', draft.reticulationDetails);
                } else if (draft.project_title === 'VIP') {
                    formData.append('latrine_stances', draft.latrineStances);
                    formData.append('pit_size', draft.pitSize);
                    formData.append('superstructure_material', draft.superstructureMaterial);
                    formData.append('roof_type', draft.roofType);
                    formData.append('ventilation_details', draft.ventilationDetails);
                    formData.append('accessibility_details', draft.accessibilityDetails);
                }

                endpoint = '/evaluations';
                successMessage = 'Project Evaluation submitted successfully!';
                draftTypeKey = 'evaluationDrafts';
            }

            if (draft.imageUri) {
                const imageName = draft.imageUri.split('/').pop();
                formData.append('image', { uri: draft.imageUri, type: 'image/jpeg', name: imageName });
            }
            if (draft.photos && draft.photos.length > 0) {
                for (const uri of draft.photos) {
                    const filename = uri.split('/').pop();
                    const match = /\.(\w+)$/.exec(filename);
                    const type = match ? `image/${match[1]}` : `image`;
                    formData.append('photos', { uri, name: filename, type });
                }
            }

            const response = await api.post(endpoint, formData);

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', successMessage);
                const currentDrafts = selectedTab === 'reports' ? reportDrafts : evaluationDrafts;
                const updatedDrafts = currentDrafts.filter((_, i) => i !== index);
                await AsyncStorage.setItem(draftTypeKey, JSON.stringify(updatedDrafts));
                if (selectedTab === 'reports') {
                    setReportDrafts(updatedDrafts);
                } else {
                    setEvaluationDrafts(updatedDrafts);
                }
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

    const handleDelete = async (draft, index) => {
        Alert.alert(
            "Delete Draft",
            "Are you sure you want to delete this draft? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        const draftTypeKey = draft.type === 'evaluation' ? 'evaluationDrafts' : 'reportDrafts';
                        const currentDrafts = selectedTab === 'reports' ? reportDrafts : evaluationDrafts;
                        const updatedDrafts = currentDrafts.filter((_, i) => i !== index);
                        await AsyncStorage.setItem(draftTypeKey, JSON.stringify(updatedDrafts));
                        if (selectedTab === 'reports') {
                            setReportDrafts(updatedDrafts);
                        } else {
                            setEvaluationDrafts(updatedDrafts);
                        }
                    }
                }
            ]
        );
    };

    const renderDraftItem = ({ item, index }) => {
        if (item.type === 'evaluation') {
            return (
                <View style={styles.draftCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name="file-document-check-outline" size={24} color="#007bff" />
                        <Text style={styles.reportType}>Project Evaluation</Text>
                        <Text style={styles.reportDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.projectInfo}>Project: {item.project_title}</Text>
                        <Text style={styles.projectSubInfo}>{item.project_community}, {item.project_lga}</Text>
                        <Text style={styles.projectSubInfo}>Status: {item.overallStatus}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item, index)}>
                            <MaterialCommunityIcons name="delete-outline" size={22} color="#dc3545" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={() => submitDraft(item, index)} disabled={loading && selectedDraftIndex === index}>
                            {loading && selectedDraftIndex === index ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="upload" size={22} color="#fff" />
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        } else { // dr or fr
            return (
                <View style={styles.draftCard}>
                    <View style={styles.cardHeader}>
                        <MaterialCommunityIcons name={getReportIcon(item.type)} size={24} color="#007bff" />
                        <Text style={styles.reportType}>{getReportTypeName(item.type)}</Text>
                        <Text style={styles.reportDate}>{new Date(item.date).toLocaleDateString()}</Text>
                    </View>
                    <View style={styles.cardBody}>
                        <Text style={styles.projectInfo}>Project: {item.project_title}</Text>
                        <Text style={styles.projectSubInfo}>{item.project_community}, {item.project_lga}</Text>
                        <Text style={styles.projectSubInfo}>Activity: {item.activity || item.recommendation}</Text>
                    </View>
                    <View style={styles.cardActions}>
                        <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item, index)}>
                            <MaterialCommunityIcons name="delete-outline" size={22} color="#dc3545" />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.submitButton} onPress={() => submitDraft(item, index)} disabled={loading && selectedDraftIndex === index}>
                            {loading && selectedDraftIndex === index ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialCommunityIcons name="upload" size={22} color="#fff" />
                                    <Text style={styles.submitButtonText}>Submit</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }
    };

    const currentDrafts = selectedTab === 'reports' ? reportDrafts : evaluationDrafts;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Saved Drafts</Text>

            {user?.role === 'admin' && (
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, selectedTab === 'reports' && styles.tabButtonActive]}
                        onPress={() => setSelectedTab('reports')}
                    >
                        <Text style={[styles.tabButtonText, selectedTab === 'reports' && styles.tabButtonTextActive]}>Reports</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, selectedTab === 'evaluations' && styles.tabButtonActive]}
                        onPress={() => setSelectedTab('evaluations')}
                    >
                        <Text style={[styles.tabButtonText, selectedTab === 'evaluations' && styles.tabButtonTextActive]}>Evaluations</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={currentDrafts}
                renderItem={renderDraftItem}
                keyExtractor={(item, index) => `${item.type}-${index}`}
                ListEmptyComponent={EmptyDrafts}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={false} onRefresh={loadDrafts} colors={['#007bff']} tintColor={'#007bff'} />}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    tabContainer: { flexDirection: 'row', marginBottom: 20, backgroundColor: '#e0e0e0', borderRadius: 10, overflow: 'hidden' },
    tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center' },
    tabButtonActive: { backgroundColor: '#007bff' },
    tabButtonText: { fontSize: 16, fontWeight: 'bold', color: '#555' },
    tabButtonTextActive: { color: '#fff' },
    draftCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
    reportType: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
    reportDate: { fontSize: 12, color: '#666' },
    cardBody: { marginBottom: 15 },
    projectInfo: { fontSize: 16, color: '#444', marginBottom: 2 },
    projectSubInfo: { fontSize: 14, color: '#777' },
    cardActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' },
    deleteButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, marginRight: 10 },
    deleteButtonText: { color: '#dc3545', marginLeft: 5, fontWeight: 'bold' },
    submitButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#007bff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
    submitButtonText: { color: '#fff', marginLeft: 5, fontWeight: 'bold' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#aaa', marginTop: 15 },
    emptySubText: { fontSize: 14, color: '#ccc', marginTop: 5 },
});
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image, ScrollView, Modal, Platform } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import api from '../services/axiosConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../context/contextUser';

export default function ViewProjectEvaluations() {
    const { user } = useContext(UserContext);
    const navigation = useNavigation();
    const params = useLocalSearchParams();
    const projectId = params.id; // Get project ID from params

    const [evaluations, setEvaluations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedEvaluation, setSelectedEvaluation] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const fetchEvaluations = useCallback(async () => {
        setLoading(true);
        try {
            const endpoint = projectId ? `/evaluations/${projectId}` : '/evaluations';
            const response = await api.get(endpoint);
            if (response.data.status) {
                setEvaluations(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching evaluations:", error);
            Alert.alert("Error", "Failed to load project evaluations.");
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => {
        fetchEvaluations();
    }, [fetchEvaluations]);

    const openEvaluationDetails = (evaluation) => {
        setSelectedEvaluation(evaluation);
        setIsModalVisible(true);
    };

    const closeEvaluationDetails = () => {
        setIsModalVisible(false);
        setSelectedEvaluation(null);
    };

    const renderEvaluationItem = ({ item }) => (
        <TouchableOpacity style={styles.evaluationCard} onPress={() => openEvaluationDetails(item)}>
            <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="file-document-check-outline" size={24} color="#007bff" />
                <Text style={styles.cardTitle}>Evaluation on {new Date(item.evaluation_date).toLocaleDateString()}</Text>
            </View>
            <View style={styles.cardBody}>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Project:</Text> {item.project_community}, {item.project_lga} ({item.project_title})</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Evaluator:</Text> {item.evaluator_name}</Text>
                <Text style={styles.cardText}><Text style={styles.cardLabel}>Status:</Text> {item.overall_status}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007bff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{projectId ? `Evaluations for ${params.community}` : 'All Project Evaluations'}</Text>

            {evaluations.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons name="file-remove-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyText}>No evaluations found.</Text>
                </View>
            ) : (
                <FlatList
                    data={evaluations}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderEvaluationItem}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}

            {/* Evaluation Details Modal */}
            <Modal visible={isModalVisible} animationType="slide" onRequestClose={closeEvaluationDetails}>
                <View style={styles.modalContainer}>
                    <ScrollView style={styles.modalContent}>
                        <TouchableOpacity onPress={closeEvaluationDetails} style={styles.closeButton}>
                            <MaterialCommunityIcons name="close-circle" size={30} color="#666" />
                        </TouchableOpacity>
                        {selectedEvaluation && (
                            <View>
                                <Text style={styles.modalTitle}>Evaluation Details</Text>
                                <Text style={styles.modalText}><Text style={styles.modalLabel}>Date:</Text> {new Date(selectedEvaluation.evaluation_date).toLocaleDateString()}</Text>
                                <Text style={styles.modalText}><Text style={styles.modalLabel}>Project:</Text> {selectedEvaluation.project_community}, {selectedEvaluation.project_lga} ({selectedEvaluation.project_title})</Text>
                                <Text style={styles.modalText}><Text style={styles.modalLabel}>Evaluator:</Text> {selectedEvaluation.evaluator_name}</Text>
                                <Text style={styles.modalText}><Text style={styles.modalLabel}>Overall Status:</Text> {selectedEvaluation.overall_status}</Text>

                                {selectedEvaluation.recommendations && <Text style={styles.modalText}><Text style={styles.modalLabel}>Recommendations:</Text> {selectedEvaluation.recommendations}</Text>}
                                {selectedEvaluation.issues_identified && <Text style={styles.modalText}><Text style={styles.modalLabel}>Issues Identified:</Text> {selectedEvaluation.issues_identified}</Text>}
                                {selectedEvaluation.materials_used && <Text style={styles.modalText}><Text style={styles.modalLabel}>Materials Used:</Text> {selectedEvaluation.materials_used}</Text>}

                                {/* Borehole Specific */}
                                {(selectedEvaluation.project_title === 'HPBH' || selectedEvaluation.project_title === 'SMBH' || selectedEvaluation.project_title === 'FLBH') && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Borehole Details</Text>
                                        {selectedEvaluation.borehole_depth && <Text style={styles.modalText}><Text style={styles.modalLabel}>Depth:</Text> {selectedEvaluation.borehole_depth}m</Text>}
                                        {selectedEvaluation.borehole_yield && <Text style={styles.modalText}><Text style={styles.modalLabel}>Yield:</Text> {selectedEvaluation.borehole_yield} L/hr</Text>}
                                        {selectedEvaluation.pump_type && <Text style={styles.modalText}><Text style={styles.modalLabel}>Pump Type:</Text> {selectedEvaluation.pump_type}</Text>}
                                        {selectedEvaluation.tank_size && <Text style={styles.modalText}><Text style={styles.modalLabel}>Tank Size:</Text> {selectedEvaluation.tank_size}L</Text>}
                                        {selectedEvaluation.reticulation_details && <Text style={styles.modalText}><Text style={styles.modalLabel}>Reticulation:</Text> {selectedEvaluation.reticulation_details}</Text>}
                                    </View>
                                )}

                                {/* Latrine Specific */}
                                {selectedEvaluation.project_title === 'VIP' && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Latrine Details</Text>
                                        {selectedEvaluation.latrine_stances && <Text style={styles.modalText}><Text style={styles.modalLabel}>Stances:</Text> {selectedEvaluation.latrine_stances}</Text>}
                                        {selectedEvaluation.pit_size && <Text style={styles.modalText}><Text style={styles.modalLabel}>Pit Size:</Text> {selectedEvaluation.pit_size}</Text>}
                                        {selectedEvaluation.superstructure_material && <Text style={styles.modalText}><Text style={styles.modalLabel}>Superstructure:</Text> {selectedEvaluation.superstructure_material}</Text>}
                                        {selectedEvaluation.roof_type && <Text style={styles.modalText}><Text style={styles.modalLabel}>Roof Type:</Text> {selectedEvaluation.roof_type}</Text>}
                                        {selectedEvaluation.ventilation_details && <Text style={styles.modalText}><Text style={styles.modalLabel}>Ventilation:</Text> {selectedEvaluation.ventilation_details}</Text>}
                                        {selectedEvaluation.accessibility_details && <Text style={styles.modalText}><Text style={styles.modalLabel}>Accessibility:</Text> {selectedEvaluation.accessibility_details}</Text>}
                                    </View>
                                )}

                                {selectedEvaluation.photos && selectedEvaluation.photos.length > 0 && (
                                    <View style={styles.modalSection}>
                                        <Text style={styles.modalSectionTitle}>Photos</Text>
                                        <ScrollView horizontal style={styles.photosContainer}>
                                            {selectedEvaluation.photos.map((photoUri, index) => (
                                                <Image key={index} source={{ uri: photoUri }} style={styles.modalPhoto} />
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}
                            </View>
                        )}
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
    emptyText: { fontSize: 18, fontWeight: 'bold', color: '#aaa', marginTop: 15 },
    evaluationCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardHeader: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10, marginBottom: 10 },
    cardTitle: { flex: 1, marginLeft: 10, fontSize: 16, fontWeight: 'bold', color: '#333' },
    cardBody: { marginBottom: 5 },
    cardText: { fontSize: 14, color: '#555', marginBottom: 3 },
    cardLabel: { fontWeight: 'bold' },
    modalContainer: { flex: 1, backgroundColor: '#f0f4f8', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
    modalContent: { flex: 1, backgroundColor: '#fff', borderRadius: 10, margin: 15, padding: 20, elevation: 5 },
    closeButton: { alignSelf: 'flex-end', marginBottom: 10 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    modalText: { fontSize: 16, color: '#555', marginBottom: 8 },
    modalLabel: { fontWeight: 'bold' },
    modalSection: { marginTop: 15, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#eee' },
    modalSectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
    photosContainer: { flexDirection: 'row', marginTop: 10 },
    modalPhoto: { width: 100, height: 100, borderRadius: 8, marginRight: 10 },
});

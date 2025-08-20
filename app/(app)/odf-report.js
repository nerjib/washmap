import React, { useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { UserContext } from '../context/contextUser';
import api from '../services/axiosConfig';
import { RadioGroup } from 'react-native-radio-buttons-group';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

const getStatusStyle = (status) => {
    switch (status) {
        case 'ODF Verified': return styles.statusVerified;
        case 'ODF Claimed': return styles.statusClaimed;
        case 'Triggered': return styles.statusTriggered;
        case 'Slipped Back': return styles.statusSlipped;
        default: return styles.statusDefault;
    }
};

export default function OdfReport() {
    const { user } = useContext(UserContext);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [communityName, setCommunityName] = useState('');
    const [wardName, setWardName] = useState('');
    const [communityStatus, setCommunityStatus] = useState('');
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [loading, setLoading] = useState(false);

    const odfStatusOptions = useMemo(() => ([
        { id: 'Not Triggered', label: 'Not Triggered', value: 'Not Triggered' },
        { id: 'Triggered', label: 'Triggered', value: 'Triggered' },
        { id: 'ODF Claimed', label: 'ODF Claimed', value: 'ODF Claimed' },
        { id: 'ODF Verified', label: 'ODF Verified', value: 'ODF Verified' },
        { id: 'Slipped Back', label: 'Slipped Back', value: 'Slipped Back' },
    ]), []);

    const fetchCommunities = useCallback(async () => {
        if (!user || !user.lga) return;
        setLoading(true);
        try {
            const res = await api.get(`/odf/odfstatus/${user.lga}`);
            if (res.data.status) {
                setCommunities(res.data.data);
            }
        } catch (e) {
            Alert.alert('Error', 'Could not fetch communities. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [user]);

    useFocusEffect(useCallback(() => { fetchCommunities(); }, [fetchCommunities]));

    const openEditModal = (community) => {
        setSelectedCommunity(community);
        setCommunityStatus(community.status);
        setIsEditModalVisible(true);
    };

    const addCommunity = async () => {
        if (!communityName || !wardName || !communityStatus) {
            Alert.alert('Missing Information', 'Please fill all fields.');
            return;
        }
        const postBody = { community: communityName, ward: wardName, lga: user.lga, status: communityStatus, sender: user.full_name };
        try {
            await api.post('/odf/odfstatus', postBody);
            fetchCommunities();
            setIsModalVisible(false);
            setCommunityName('');
            setWardName('');
        } catch (err) {
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    };

    const updateCommunityStatus = async () => {
        if (!communityStatus) {
            Alert.alert('No Status', 'Please select a new status.');
            return;
        }
        try {
            await api.put(`/odf/odfstatus/${selectedCommunity.id}`, { status: communityStatus });
            fetchCommunities();
            setIsEditModalVisible(false);
        } catch (err) {
            Alert.alert('Error', 'An error occurred. Please try again.');
        }
    };

    const statusStats = communities.reduce((acc, community) => {
        acc[community.status] = (acc[community.status] || 0) + 1;
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            <Text style={styles.title}>ODF Report</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>LGA Overview</Text>
                <Text style={styles.userInfoText}>LGA: {user?.lga}</Text>
                <Text style={styles.userInfoText}>Facilitator: {user?.full_name}</Text>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Statistics</Text>
                <Text style={styles.statsText}>Total Communities: {communities.length}</Text>
                {Object.entries(statusStats).map(([status, count]) => (
                    <Text key={status} style={styles.statsText}>{status}: {count}</Text>
                ))}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={() => setIsModalVisible(true)}>
                <MaterialCommunityIcons name="plus-circle" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Add Community</Text>
            </TouchableOpacity>

            {loading ? <ActivityIndicator size="large" color="#007bff" /> : (
                <FlatList
                    data={communities}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <TouchableOpacity onPress={() => openEditModal(item)} style={styles.communityCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.communityName}>{item.community}</Text>
                                <Text style={styles.communityWard}>{item.ward} Ward</Text>
                            </View>
                            <Text style={[styles.statusBadge, getStatusStyle(item.status)]}>{item.status}</Text>
                        </TouchableOpacity>
                    )}
                />
            )}

            {/* Add/Edit Modals */}
            <Modal visible={isModalVisible || isEditModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditModalVisible ? 'Edit Community Status' : 'Add New Community'}</Text>
                        {isEditModalVisible ? (
                            <Text style={styles.selectedCommunity}>Community: {selectedCommunity?.community}</Text>
                        ) : (
                            <>
                                <TextInput style={styles.input} placeholder="Community Name" value={communityName} onChangeText={setCommunityName} />
                                <TextInput style={styles.input} placeholder="Ward Name" value={wardName} onChangeText={setWardName} />
                            </>
                        )}
                        <RadioGroup radioButtons={odfStatusOptions} onPress={setCommunityStatus} selectedId={communityStatus} containerStyle={styles.radioGroup} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => isEditModalVisible ? setIsEditModalVisible(false) : setIsModalVisible(false)}>
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={isEditModalVisible ? updateCommunityStatus : addCommunity}>
                                <Text style={styles.buttonText}>{isEditModalVisible ? 'Update' : 'Add'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    card: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#007bff', marginBottom: 10 },
    userInfoText: { fontSize: 16, color: '#555', marginBottom: 5 },
    statsText: { fontSize: 16, color: '#555', marginBottom: 5 },
    addButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    addButtonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    communityCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, padding: 15, marginBottom: 10, elevation: 2 },
    cardContent: { flex: 1 },
    communityName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    communityWard: { fontSize: 14, color: '#777', marginTop: 2 },
    statusBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12, fontSize: 12, fontWeight: 'bold', color: '#fff', overflow: 'hidden' },
    statusVerified: { backgroundColor: '#28a745' },
    statusClaimed: { backgroundColor: '#17a2b8' },
    statusTriggered: { backgroundColor: '#ffc107', color: '#000' },
    statusSlipped: { backgroundColor: '#dc3545' },
    statusDefault: { backgroundColor: '#6c757d' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContent: { width: '90%', padding: 20, backgroundColor: '#ffffff', borderRadius: 10 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
    selectedCommunity: { fontSize: 18, marginBottom: 15, textAlign: 'center', color: '#495057' },
    input: { height: 50, borderColor: '#ced4da', borderWidth: 1, borderRadius: 8, paddingHorizontal: 15, marginBottom: 15, backgroundColor: '#f1f3f5' },
    radioGroup: { alignItems: 'flex-start' },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, padding: 15, borderRadius: 10, alignItems: 'center' },
    buttonText: { color: '#ffffff', fontSize: 16, fontWeight: 'bold' },
    cancelButton: { backgroundColor: '#6c757d', marginRight: 10 },
    submitButton: { backgroundColor: '#007bff', marginLeft: 10 },
});
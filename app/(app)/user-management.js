import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal, ScrollView, Platform } from 'react-native';
import api from '../services/axiosConfig';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserContext } from '../context/contextUser';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function UserManagement() {
    const { user: currentUser } = useContext(UserContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('user');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [lga, setLga] = useState('');

    const roles = ['user', 'manager', 'admin', 'super_admin'];
    const lgaList = ['Birnin Gwari', 'Chikun', 'Giwa', 'Igabi', 'Ikara', 'Jaba', 'Jemaa', 'Kachia', 'Kaduna North', 'Kaduna South', 'Kagarko', 'Kajuru', 'Kaura', 'Kauru', 'Kubau', 'Kudan', 'Lere', 'Makarfi', 'Sabon Gari', 'Sanga', 'Soba', 'Zangon Kataf', 'Zaria'];

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/users');
            if (response.status === 201) {
                setUsers(response.data);
            }
        } catch (error) {
            console.error('Error fetching users:', error.response?.data || error.message);
            Alert.alert('Error', 'Failed to load users.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const resetForm = () => {
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('user');
        setPhoneNumber('');
        setLga('');
        setSelectedUser(null);
    };

    const openAddModal = () => {
        setIsEditMode(false);
        resetForm();
        setIsModalVisible(true);
    };

    const openEditModal = (user) => {
        setIsEditMode(true);
        setSelectedUser(user);
        setFullName(user.full_name);
        setEmail(user.email);
        setRole(user.role);
        setPhoneNumber(user.phone_number);
        setLga(user.lga);
        setPassword(''); // Password should not be pre-filled for security
        setIsModalVisible(true);
    };

    const handleSaveUser = async () => {
        if (!fullName || !email || !role || !phoneNumber || !lga || (!isEditMode && !password)) {
            Alert.alert('Missing Information', 'Please fill all required fields.');
            return;
        }

        setLoading(true);
        try {
            const userData = { full_name: fullName, email, role, phone_number: phoneNumber, lga };
            if (!isEditMode) {
                userData.password = password;
            }

            let response;
            if (isEditMode) {
                response = await api.put(`/users/${selectedUser.id}`, userData);
            } else {
                response = await api.post('/auth/register', userData);
            }

            if (response.status === 200 || response.status === 201) {
                Alert.alert('Success', `User ${isEditMode ? 'updated' : 'added'} successfully!`);
                fetchUsers();
                setIsModalVisible(false);
            } else {
                Alert.alert('Error', `Failed to ${isEditMode ? 'update' : 'add'} user.`);
            }
        } catch (error) {
            console.error('Error saving user:', error.response?.data || error.message);
            Alert.alert('Error', `An unexpected error occurred: ${error.response?.data?.error || error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = (userToDelete) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to delete ${userToDelete.full_name}? This action cannot be undone.`, 
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const response = await api.delete(`/users/${userToDelete.id}`);
                            if (response.status === 200) {
                                Alert.alert('Success', 'User deleted successfully!');
                                fetchUsers();
                            } else {
                                Alert.alert('Error', 'Failed to delete user.');
                            }
                        } catch (error) {
                            console.error('Error deleting user:', error.response?.data || error.message);
                            Alert.alert('Error', `An unexpected error occurred: ${error.response?.data?.error || error.message}`);
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const renderUserItem = ({ item }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <Text style={styles.userName}>{item.full_name}</Text>
                <Text style={styles.userEmail}>{item.email}</Text>
                <Text style={styles.userRole}>Role: {item.role}</Text>
                <Text style={styles.userContact}>Phone: {item.phone_number} | LGA: {item.lga}</Text>
            </View>
            <View style={styles.userActions}>
                <TouchableOpacity style={styles.editButton} onPress={() => openEditModal(item)}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#007bff" />
                </TouchableOpacity>
                {item.id !== currentUser.id && ( // Prevent user from deleting themselves
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteUser(item)}>
                        <MaterialCommunityIcons name="delete" size={20} color="#dc3545" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>User Management</Text>

            <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
                <MaterialCommunityIcons name="account-plus" size={22} color="#fff" />
                <Text style={styles.addButtonText}>Add New User</Text>
            </TouchableOpacity>

            <FlatList
                data={users}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderUserItem}
                contentContainerStyle={{ paddingBottom: 20 }}
            />

            {/* Add/Edit User Modal */}
            <Modal visible={isModalVisible} animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
                <ScrollView style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{isEditMode ? 'Edit User' : 'Add New User'}</Text>

                        <Text style={styles.label}>Full Name</Text>
                        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder="Full Name" />

                        <Text style={styles.label}>Email</Text>
                        <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" />

                        {!isEditMode && (
                            <>
                                <Text style={styles.label}>Password</Text>
                                <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry />
                            </>
                        )}

                        <Text style={styles.label}>Role</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={role} onValueChange={setRole} style={styles.picker}>
                                {roles.map(r => <Picker.Item key={r} label={r} value={r} />)}
                            </Picker>
                        </View>

                        <Text style={styles.label}>Phone Number</Text>
                        <TextInput style={styles.input} value={phoneNumber} onChangeText={setPhoneNumber} placeholder="Phone Number" keyboardType="phone-pad" />

                        <Text style={styles.label}>LGA</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={lga} onValueChange={setLga} style={styles.picker}>
                                {lgaList.map(l => <Picker.Item key={l} label={l} value={l} />)}
                            </Picker>
                        </View>

                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelModalButton]} onPress={() => setIsModalVisible(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.saveModalButton]} onPress={handleSaveUser} disabled={loading}>
                                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>{isEditMode ? 'Save Changes' : 'Add User'}</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#f0f4f8' },
    title: { fontSize: 28, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    addButton: { flexDirection: 'row', backgroundColor: '#007bff', padding: 15, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginLeft: 10 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    userCard: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, flexDirection: 'row', alignItems: 'center' },
    userInfo: { flex: 1 },
    userName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    userEmail: { fontSize: 14, color: '#666' },
    userRole: { fontSize: 14, color: '#007bff', fontStyle: 'italic' },
    userContact: { fontSize: 12, color: '#777' },
    userActions: { flexDirection: 'row', marginLeft: 10 },
    editButton: { padding: 8, borderRadius: 5, backgroundColor: '#e0f7fa', marginRight: 5 },
    deleteButton: { padding: 8, borderRadius: 5, backgroundColor: '#ffebee' },
    modalContainer: { flex: 1, backgroundColor: '#f0f4f8', paddingTop: Platform.OS === 'ios' ? 50 : 20 },
    modalContent: { flex: 1, backgroundColor: '#fff', borderRadius: 10, margin: 15, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 20, textAlign: 'center' },
    label: { fontSize: 16, fontWeight: '600', color: '#444', marginBottom: 8 },
    input: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, color: '#333', marginBottom: 15 },
    pickerContainer: { backgroundColor: '#f9f9f9', borderRadius: 8, borderWidth: 1, borderColor: '#ddd', overflow: 'hidden', marginBottom: 15 },
    picker: { height: 50, width: '100%' },
    modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    cancelModalButton: { backgroundColor: '#6c757d', marginRight: 10 },
    saveModalButton: { backgroundColor: '#007bff', marginLeft: 10 },
    modalButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

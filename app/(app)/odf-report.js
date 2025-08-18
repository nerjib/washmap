import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { UserContext } from '../context/contextUser';
import axios from 'axios';
import { baseURL } from '../services/config';
import { RadioGroup } from 'react-native-radio-buttons-group';

export default function OdfReport() {
  const { user } = useContext(UserContext);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [communityName, setCommunityName] = useState('');
  const [communityStatus, setCommunityStatus] = useState('');
  const [communities, setCommunities] = useState([]);
  const [wardName, setWardName] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const radioButtons = useMemo(() => ([
      {
          id: 'activated', // acts as primary key, should be unique and non-empty string
          label: 'Activated',
          value: true
      },
      {
          id: 'verified',
          label: 'Verified',
          value: false
      },
      {
          id: 'pending',
          label: 'Pending',
          value: false
      }
  ]), []);

  const openModal = () => setIsModalVisible(true);
  const closeModal = () => setIsModalVisible(false);

  const openEditModal = (community) => {
    setSelectedCommunity(community);
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCommunity(null);
  };

  const addCommunity = () => {
    const postBody = {
      community: communityName,
      ward: wardName,
      lga: user.lga,
      status: communityStatus,
      sender: user.full_name
    };
    axios.post(`${baseURL}/odfstatus`, postBody)
    .then(res => {
      setCommunities([...communities, { community: communityName, status: communityStatus, ward: wardName }]);
      setCommunityName('');
      setWardName('');
      setCommunityStatus('');
      alert('Community added successfully.');
      closeModal();
    })
    .catch(err => {
      alert('An error occurred. Please try again.');
      console.log(err);
    });
  };

  useEffect(() => {
    const getCommunities = async () => {
      try{
        const res = await axios.get(`${baseURL}/odfstatus/${user.lga}`);
        if(res.data.status){
          setCommunities(res.data.data);
        }
      }catch(e){
        alert('An error occurred. Please try again.');
      }
    };
    getCommunities();
  }, []);

  const updateCommunityStatus = () => {
    const postBody = {
      status: communityStatus
    };
    axios.put(`${baseURL}/odfstatus/${selectedCommunity.id}`, postBody)
    .then(res => {
      const updatedCommunities = communities.map((community) =>
        community.id === selectedCommunity.id ? { ...community, status: communityStatus } : community
      );
      setCommunities(updatedCommunities);
      setCommunityStatus('');
      closeEditModal();
      alert('Community status updated successfully.');
    })
    .catch(err => {
      alert('An error occurred. Please try again.');
      console.log(err);
    });
  };

  const totalCommunities = communities.length;
  const statusStats = communities.reduce((acc, community) => {
    acc[community.status] = (acc[community.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ODF Report</Text>

      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoText}>LGA: {user?.lga}</Text>
        <Text style={styles.userInfoText}>User: {user?.full_name}</Text>
      </View>

      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Statistics</Text>
        <Text style={styles.statsText}>Total Communities: {totalCommunities}</Text>
        {Object.entries(statusStats).map(([status, count]) => (
          <Text key={status} style={styles.statsText}>
            {status}: {count}
          </Text>
        ))}
      </View>

      <TouchableOpacity style={styles.addButton} onPress={openModal}>
        <Text style={styles.addButtonText}>Add Community</Text>
      </TouchableOpacity>

      <FlatList
        data={communities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openEditModal(item)} style={styles.communityItem}>
            <Text style={styles.communityName}>{item.community}</Text>
            <Text style={styles.communityWard}>{item.ward} Ward</Text>
            <Text style={styles.communityStatus}>Status: {item.status}</Text>
          </TouchableOpacity>
        )}
      />

      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Community</Text>
            <TextInput
              style={styles.input}
              placeholder="Community Name"
              value={communityName}
              onChangeText={setCommunityName}
            />
            <TextInput
              style={styles.input}
              placeholder="Ward Name"
              value={wardName}
              onChangeText={setWardName}
            />
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setCommunityStatus}
              selectedId={communityStatus}
              containerStyle={styles.radioGroup}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={addCommunity}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Community Status</Text>
            {selectedCommunity && (
              <Text style={styles.selectedCommunity}>
                Community: {selectedCommunity.community}
              </Text>
            )}
            <RadioGroup
              radioButtons={radioButtons}
              onPress={setCommunityStatus}
              selectedId={communityStatus}
              containerStyle={styles.radioGroup}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={closeEditModal}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.submitButton]} onPress={updateCommunityStatus}>
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#343a40',
  },
  userInfoContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  userInfoText: {
    fontSize: 16,
    color: '#495057',
  },
  statsContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#343a40',
  },
  statsText: {
    fontSize: 16,
    color: '#495057',
    marginBottom: 5,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  communityItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
  },
  communityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  communityWard: {
    fontSize: 16,
    color: '#6c757d',
  },
  communityStatus: {
    fontSize: 14,
    color: '#28a745',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedCommunity: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    color: '#495057',
  },
  input: {
    height: 50,
    borderColor: '#ced4da',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#f1f3f5',
  },
  radioGroup: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007bff',
    marginLeft: 10,
  },
});

import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Text, Button, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity } from 'react-native';
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
  const [selectedId, setSelectedId] = useState('');

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
  // Open the add community modal
  const openModal = () => {
    setIsModalVisible(true);
  };

  // Close the add community modal
  const closeModal = () => {
    setIsModalVisible(false);
  };

  // Open the edit community modal
  const openEditModal = (community) => {
    setSelectedCommunity(community);
    setIsEditModalVisible(true);
  };

  // Close the edit community modal
  const closeEditModal = () => {
    setIsEditModalVisible(false);
    setSelectedCommunity(null);
  };

  // Add a new community
  const addCommunity = () => {
    // if (communityName && communityStatus) {
    //   setCommunities([...communities, { name: communityName, status: communityStatus }]);
    //   setCommunityName('');
    //   setCommunityStatus('');
    //   closeModal();
    // } else {
    //   alert('Please fill in both fields.');
    // }
    const postBody = {
      community: communityName,
      ward: wardName,
      lga: user.lga,
      status: communityStatus,
      sender: user.full_name
    };
    axios.post(`${baseURL}/odfstatus`, postBody)
    .then(res => {
      setCommunities([...communities, { community: communityName, status: communityStatus }]);
      setCommunityName('');
      setCommunityStatus('');
      alert('Community added successfully.');
      console.log(res.data);
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
  // Update a community's status
  const updateCommunityStatus = (id) => {
    // if (selectedCommunity && communityStatus) {
    //   const updatedCommunities = communities.map((community) =>
    //     community.name === selectedCommunity.name ? { ...community, status: communityStatus } : community
    //   );
    //   setCommunities(updatedCommunities);
    //   setCommunityStatus('');
    //   closeEditModal();
    // } else {
    //   alert('Please select a status.');
    // }
    const postBody = {
      status: communityStatus
    };
    axios.put(`${baseURL}/odfstatus/${selectedCommunity.id}`, postBody)
    .then(res => {
      const updatedCommunities = communities.map((community) =>
      community.name === selectedCommunity.name ? { ...community, status: communityStatus } : community
    );
    setCommunities(updatedCommunities);
    setCommunityStatus('');
    closeEditModal();
    alert('Community status updated successfully.');
    }
    )
  };

  // Calculate stats
  const totalCommunities = communities.length;
  const statusStats = communities.reduce((acc, community) => {
    acc[community.status] = (acc[community.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ODF Report</Text>

      <View style={styles.userContainer}>
        <Text style={styles.statsTitle}>LGA: {user?.lga}</Text>
        <Text>User: {user?.full_name}</Text>       
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Stats</Text>
        <Text>Total Communities: {totalCommunities}</Text>
        {Object.entries(statusStats).map(([status, count]) => (
          <Text key={status}>
            {status}: {count}
          </Text>
        ))}
      </View>

      {/* Button to open the add community modal */}
      <Button title="Add Community" onPress={openModal} />

      {/* List of communities */}
      <FlatList
        data={communities}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openEditModal(item)}>
            <View style={styles.communityItem}>
              <Text style={styles.communityName}>{item.community}</Text>
              <Text style={styles.communityWard}>{item.ward} Ward</Text>
              <Text style={styles.communityStatus}>Status: {item.status}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal for adding a community */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Community</Text>

            {/* Community Name Input */}
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

            {/* Community Status Input */}
            {/* <TextInput
              style={styles.input}
              placeholder="Community Status"
              value={communityStatus}
              onChangeText={setCommunityStatus}
            /> */}
            <RadioGroup color='#000'
              radioButtons={radioButtons} 
              onPress={setCommunityStatus}
              selectedId={communityStatus}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={closeModal} />
              <Button title="Add" onPress={addCommunity} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for editing a community's status */}
      <Modal visible={isEditModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Community Status</Text>

            {/* Display selected community name */}
            {selectedCommunity && (
              <Text style={styles.selectedCommunity}>
                Community: {selectedCommunity.name}
              </Text>
            )}

            {/* Community Status Input */}
            <RadioGroup color='#000'
              radioButtons={radioButtons} 
              onPress={setCommunityStatus}
              selectedId={communityStatus}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <Button title="Cancel" onPress={closeEditModal} />
              <Button title="Update" onPress={updateCommunityStatus} />
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
  },
  title: {
    fontSize: 24,
    marginBottom: 5,
  },
  statsContainer: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  userContainer: {
    marginBottom: 5,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  communityItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  communityName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  communityWard: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  communityStatus: {
    fontSize: 14,
    color: '#666',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  selectedCommunity: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});